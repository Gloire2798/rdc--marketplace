import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerNotification, creerNotificationAdmin } from "@/lib/notifications";

const LOYER_MENSUEL = 15000;

// Renvoie le mois précédent au format "2026-09"
function getMoisPrecedent(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

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

    // ---------- DATE DE RÉFÉRENCE ----------
    // Normalement = maintenant. Mais on peut forcer pour tester.
    const dateRef = searchParams.get("date"); // Format "2026-11-05"
    const maintenant = dateRef ? new Date(dateRef) : new Date();

    // ---------- RÉCUPÉRER LES VENDEURS CONCERNÉS ----------
    // Ceux dont la prochaineEcheance est <= aujourd'hui
    const vendeurs = await prisma.vendeur.findMany({
      where: {
        actif: true,
        prochaineEcheance: { lte: maintenant },
      },
      select: {
        id: true,
        nomBoutique: true,
        userId: true,
        prochaineEcheance: true,
      },
    });

    let loyersCrees = 0;
    let notifsEnvoyees = 0;
    let echeancesAvancees = 0;
    let alertesRetard = 0;

    for (const vendeur of vendeurs) {
      const echeance = vendeur.prochaineEcheance!;

      // Le loyer concerne le mois PRÉCÉDENT la date d'échéance
      const moisConcerne = getMoisPrecedent(echeance);

      // 1. Vérifier si la ligne de loyer du mois existe déjà
      const loyerExistant = await prisma.paiementFinance.findUnique({
        where: {
          vendeurId_type_periode: {
            vendeurId: vendeur.id,
            type: "LOYER",
            periode: moisConcerne,
          },
        },
      });

      // 2. Créer si manquant
      if (!loyerExistant) {
        await prisma.paiementFinance.create({
          data: {
            vendeurId: vendeur.id,
            type: "LOYER",
            periode: moisConcerne,
            montant: LOYER_MENSUEL,
            statut: "IMPAYE",
          },
        });
        loyersCrees++;

        await creerNotification(
          vendeur.userId,
          "LOYER_A_PAYER",
          "💰 Loyer à payer",
          `Votre loyer de ${LOYER_MENSUEL.toLocaleString("fr-FR")} FC (période ${moisConcerne}) est à régler.`,
          "/vendeur/dashboard"
        );
        notifsEnvoyees++;
      }

      // 3. Vérifier 2 mois de retard
      const moisAvantConcerne = getMoisPrecedent(echeance);
      const dateAvant = new Date(echeance.getFullYear(), echeance.getMonth() - 2, 1);
      const moisAvant = `${dateAvant.getFullYear()}-${String(dateAvant.getMonth() + 1).padStart(2, "0")}`;

      const loyerAvant = await prisma.paiementFinance.findUnique({
        where: {
          vendeurId_type_periode: {
            vendeurId: vendeur.id,
            type: "LOYER",
            periode: moisAvant,
          },
        },
      });

      const retardActuel = !loyerExistant || loyerExistant.statut === "IMPAYE";
      const retardPrecedent = loyerAvant?.statut === "IMPAYE";

      if (retardActuel && retardPrecedent) {
        await creerNotificationAdmin(
          "LOYER_RETARD_CRITIQUE",
          "⚠️ Vendeur en retard de 2 mois",
          `La boutique "${vendeur.nomBoutique}" a 2 loyers impayés. Suspension à prévoir.`,
          "/admin/finance"
        );
        alertesRetard++;
      }

      // 4. Avancer prochaineEcheance de 30 jours
      const nouvelleEcheance = new Date(echeance);
      nouvelleEcheance.setDate(nouvelleEcheance.getDate() + 30);

      await prisma.vendeur.update({
        where: { id: vendeur.id },
        data: { prochaineEcheance: nouvelleEcheance },
      });
      echeancesAvancees++;
    }

    return NextResponse.json({
      succes: true,
      message: "Cron loyers exécuté",
      dateReference: maintenant.toISOString(),
      vendeursConcernes: vendeurs.length,
      loyersCrees,
      notifsEnvoyees,
      echeancesAvancees,
      alertesRetard,
    });
  } catch (error) {
    console.error("Erreur cron loyers:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
          }
