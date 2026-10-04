import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerNotification, creerNotificationAdmin } from "@/lib/notifications";

const LOYER_MENSUEL = 15000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ---------- SÉCURITÉ ----------
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const modeTest = searchParams.get("test") === "1";

    if (cronSecret && !modeTest && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    }

    // ---------- MOIS À TRAITER ----------
    let moisActuel: string;
    const moisParam = searchParams.get("mois");

    if (moisParam && /^\d{4}-\d{2}$/.test(moisParam)) {
      // Format "2026-09" fourni → utilisé pour test
      moisActuel = moisParam;
    } else {
      // Par défaut : mois précédent (car on paie le 5 pour le mois précédent)
      const maintenant = new Date();
      const datePrecedente = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
      moisActuel = `${datePrecedente.getFullYear()}-${String(datePrecedente.getMonth() + 1).padStart(2, "0")}`;
    }

    // Calculer le mois encore avant (pour détecter les 2 mois de retard)
    const [annee, mois] = moisActuel.split("-").map(Number);
    const dateAvant = new Date(annee, mois - 2, 1);
    const moisAvant = `${dateAvant.getFullYear()}-${String(dateAvant.getMonth() + 1).padStart(2, "0")}`;

    // ---------- VENDEURS ----------
    const vendeurs = await prisma.vendeur.findMany({
      where: { actif: true },
      select: { id: true, nomBoutique: true, userId: true },
    });

    let loyersCrees = 0;
    let notifsEnvoyees = 0;
    let alertesRetard = 0;
    let vendeursEnRetard: string[] = [];

    for (const vendeur of vendeurs) {
      // 1. Vérifier si la ligne existe
      const loyerExistant = await prisma.paiementFinance.findUnique({
        where: {
          vendeurId_type_periode: {
            vendeurId: vendeur.id,
            type: "LOYER",
            periode: moisActuel,
          },
        },
      });

      // 2. Créer si manquant
      if (!loyerExistant) {
        await prisma.paiementFinance.create({
          data: {
            vendeurId: vendeur.id,
            type: "LOYER",
            periode: moisActuel,
            montant: LOYER_MENSUEL,
            statut: "IMPAYE",
          },
        });
        loyersCrees++;

        // Notif vendeur
        await creerNotification(
          vendeur.userId,
          "LOYER_A_PAYER",
          "💰 Loyer à payer",
          `Votre loyer de ${LOYER_MENSUEL.toLocaleString("fr-FR")} FC (période ${moisActuel}) est à régler avant le 5.`,
          "/vendeur/dashboard"
        );
        notifsEnvoyees++;
      }

      // 3. Vérifier 2 mois de retard
      const loyerAvant = await prisma.paiementFinance.findUnique({
        where: {
          vendeurId_type_periode: {
            vendeurId: vendeur.id,
            type: "LOYER",
            periode: moisAvant,
          },
        },
      });

      const loyerActuelImpaye = !loyerExistant || loyerExistant.statut === "IMPAYE";
      const loyerAvantImpaye = loyerAvant?.statut === "IMPAYE";

      if (loyerActuelImpaye && loyerAvantImpaye) {
        vendeursEnRetard.push(vendeur.nomBoutique);
        alertesRetard++;
      }
    }

    // 4. Alerte globale admin (1 seul message)
    if (vendeursEnRetard.length > 0) {
      await creerNotificationAdmin(
        "LOYER_RETARD_CRITIQUE",
        "⚠️ Vendeurs en retard de 2 mois",
        `${vendeursEnRetard.length} boutique(s) ont 2 loyers impayés : ${vendeursEnRetard.join(", ")}. Suspension à prévoir.`,
        "/admin/finance"
      );
    }

    return NextResponse.json({
      succes: true,
      message: "Cron loyers exécuté",
      moisTraite: moisActuel,
      moisPourRetard: moisAvant,
      vendeurs: vendeurs.length,
      loyersCrees,
      notifsEnvoyees,
      alertesRetard,
    });
  } catch (error) {
    console.error("Erreur cron loyers:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
    }
