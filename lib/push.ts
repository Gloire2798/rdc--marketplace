import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = "mailto:contact@gk-sensei.app";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

interface PayloadPush {
  titre: string;
  message: string;
  lien?: string;
  tag?: string;
}

export async function envoyerPush(
  userId: string,
  payload: PayloadPush
): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn("VAPID non configuré — push ignorée");
    return;
  }

  const abonnements = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (abonnements.length === 0) return;

  const donnees = JSON.stringify({
    titre: payload.titre,
    message: payload.message,
    lien: payload.lien || "/",
    tag: payload.tag || "gk-sensei",
  });

  await Promise.all(
    abonnements.map(async (abo) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: abo.endpoint,
            keys: {
              p256dh: abo.p256dh,
              auth: abo.auth,
            },
          },
          donnees
        );
      } catch (error: any) {
        // Si l'abonnement est expiré (410) ou invalide (404) → supprimer
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { id: abo.id },
          });
        } else {
          console.error("Erreur push:", error?.message || error);
        }
      }
    })
  );
    }
