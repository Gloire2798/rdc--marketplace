import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerNotification, creerNotificationAdmin } from "@/lib/notifications";

const LOYER_MENSUEL = 15000;

export async function GET(request: Request) {
  try {
    // Sécurité : vérifier que c'est Vercel Cron (ou toi en test)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Si un secret est défini en env, on vérifie
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    }

    // Mois actuel au format "2026-10"
    const maintenant = new Date();
    const moisActuel = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;

    // Mois précédent (pour compter les retards)
    const datePrecedente = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
    const moisPrecedent = `${datePrecedente.getFullYear()}-${String(datePrecedente.getMonth() + 1).padStart(2, "0")}`;

    // Récupérer tous les vendeurs actifs
    const vendeurs = await prisma.vendeur.findMany({
      where: { actif: true },
      select: {
        id: true,
        nomBoutique: true,
        userId: true,
      },
    });

    let loyersCrees = 0;
    let notifsEnvoyees = 0;
    let alertesRetard = 0;

    for (const vendeur of vendeurs) {
      // 1. Vérifier si la ligne de loyer du mois existe déjà
      const loyerExistant = await prisma.paiementFinance.findUnique({
        where: {
          vendeurId_type_periode: {
            vendeurId: vendeur.id,
            type: "LOYER",
            periode: moisActuel,
          },
        },
      });

      // 2. Si elle n'existe pas, la créer
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

        // Notifier le vendeur
        await creerNotification(
          vendeur.userId,
          "LOYER_A_PAYER",
          "💰 Loyer du mois à payer",
          `Votre loyer de ${LOYER_MENSUEL.toLocaleString("fr-FR")} FC pour ${moisActuel} est à régler avant le 15.`,
          "/vendeur/dashboard"
        );
        notifsEnvoyees++;
      }

      // 3. Vérifier les impayés (mois actuel + mois précédent)
      const loyerPrecedent = await prisma.paiementFinance.findUnique({
        where: {
          vendeurId_type_periode: {
            vendeurId: vendeur.id,
            type: "LOYER",
            periode: moisPrecedent,
          },
        },
      });

      const retardActuel = loyerExistant?.statut === "IMPAYE" || !loyerExistant;
      const retardPrecedent = loyerPrecedent?.statut === "IMPAYE";

      // 4. Si 2 mois impayés → alerte admin
      if (retardActuel && retardPrecedent) {
        await creerNotificationAdmin(
          "LOYER_RETARD_CRITIQUE",
          "⚠️ Vendeur en retard de 2 mois",
          `La boutique "${vendeur.nomBoutique}" a 2 loyers impayés (${moisPrecedent} et ${moisActuel}). Suspension à prévoir.`,
          "/admin/finance"
        );
        alertesRetard++;
      }
    }

    return NextResponse.json({
      succes: true,
      message: "Cron loyers exécuté",
      moisActuel,
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
