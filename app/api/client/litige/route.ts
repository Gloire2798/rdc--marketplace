import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  creerNotificationVendeur,
  creerNotificationAdmin,
} from "@/lib/notifications";

const RAISONS_VALIDES = [
  "PRODUIT_DIFFERENT",
  "PRODUIT_CASSE",
  "NON_RECU",
  "AUTRE",
];

const LABELS_RAISON: Record<string, string> = {
  PRODUIT_DIFFERENT: "Produit différent de la description",
  PRODUIT_CASSE: "Produit cassé ou endommagé",
  NON_RECU: "Produit non reçu",
  AUTRE: "Autre problème",
};

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ACHETEUR") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { commandeId, raison, description, photoUrl } = body;

    if (!commandeId || !raison || !description) {
      return NextResponse.json(
        { erreur: "Informations manquantes" },
        { status: 400 }
      );
    }

    if (!RAISONS_VALIDES.includes(raison)) {
      return NextResponse.json({ erreur: "Raison invalide" }, { status: 400 });
    }

    if (description.trim().length < 10) {
      return NextResponse.json(
        { erreur: "Décrivez le problème en au moins 10 caractères" },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe, appartient au client, et est RETIRE
    const commande = await prisma.commande.findUnique({
      where: { id: commandeId },
      include: { vendeur: true },
    });

    if (!commande) {
      return NextResponse.json(
        { erreur: "Commande introuvable" },
        { status: 404 }
      );
    }

    if (commande.acheteurId !== session.id) {
      return NextResponse.json(
        { erreur: "Cette commande ne vous appartient pas" },
        { status: 403 }
      );
    }

    if (commande.statut !== "RETIRE") {
      return NextResponse.json(
        {
          erreur:
            "Vous ne pouvez signaler un problème qu'après avoir récupéré la commande",
        },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un litige pour cette commande
    const litigeExistant = await prisma.litige.findFirst({
      where: { commandeId },
    });

    if (litigeExistant) {
      return NextResponse.json(
        { erreur: "Un litige existe déjà pour cette commande" },
        { status: 400 }
      );
    }

    const numCommande = commande.id.slice(0, 8);
    const labelRaison = LABELS_RAISON[raison];

    // ✅ TRANSACTION : créer le litige + notifier vendeur + notifier admin
    const litige = await prisma.$transaction(async (tx) => {
      const nouveauLitige = await tx.litige.create({
        data: {
          commandeId,
          clientId: session.id,
          vendeurId: commande.vendeurId,
          raison,
          description: description.trim(),
          photoUrl: photoUrl || null,
          statut: "OUVERT",
        },
      });

      return nouveauLitige;
    });

    // ✅ Notifications (hors transaction)
    try {
      await creerNotificationVendeur(
        commande.vendeurId,
        "LITIGE_SIGNALE",
        "⚠️ Litige signalé",
        `Un client a signalé un problème sur la commande #${numCommande} : ${labelRaison}.`,
        `/vendeur/litiges`
      );

      await creerNotificationAdmin(
        "LITIGE_A_TRAITER",
        "⚖️ Nouveau litige à traiter",
        `Litige sur la commande #${numCommande} (${commande.vendeur.nomBoutique}). Raison : ${labelRaison}.`,
        `/admin/litiges`
      );
    } catch (notifError) {
      console.error("Erreur notifications litige:", notifError);
    }

    return NextResponse.json({
      succes: true,
      litigeId: litige.id,
      message: "Litige enregistré. L'administration va traiter votre demande.",
    });
  } catch (error) {
    console.error("Erreur création litige:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
