import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { creerNotification, creerNotificationAdmin } from "@/lib/notifications";

const LOYER_MENSUEL = 15000;

// Créer automatiquement les loyers manquants
async function creerLoyersManquants() {
  const maintenant = new Date();
  const moisActuel = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;

  const datePrecedente = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
  const moisPrecedent = `${datePrecedente.getFullYear()}-${String(datePrecedente.getMonth() + 1).padStart(2, "0")}`;

  const vendeurs = await prisma.vendeur.findMany({
    where: { actif: true },
    select: { id: true, nomBoutique: true, userId: true },
  });

  let loyersCrees = 0;

  for (const vendeur of vendeurs) {
    // Vérifier si la ligne du mois existe déjà
    const loyerExistant = await prisma.paiementFinance.findUnique({
      where: {
        vendeurId_type_periode: {
          vendeurId: vendeur.id,
          type: "LOYER",
          periode: moisActuel,
        },
      },
    });

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
        `Votre loyer de ${LOYER_MENSUEL.toLocaleString("fr-FR")} FC pour ${moisActuel} est à régler.`,
        "/vendeur/dashboard"
      );
    }

    // Vérifier si 2 mois impayés
    const loyerPrecedent = await prisma.paiementFinance.findUnique({
      where: {
        vendeurId_type_periode: {
          vendeurId: vendeur.id,
          type: "LOYER",
          periode: moisPrecedent,
        },
      },
    });

    const retardActuel = !loyerExistant || loyerExistant.statut === "IMPAYE";
    const retardPrecedent = loyerPrecedent?.statut === "IMPAYE";

    if (retardActuel && retardPrecedent) {
      await creerNotificationAdmin(
        "LOYER_RETARD_CRITIQUE",
        "⚠️ Vendeur en retard de 2 mois",
        `La boutique "${vendeur.nomBoutique}" a 2 loyers impayés. Suspension à prévoir.`,
        "/admin/finance"
      );
    }
  }

  return loyersCrees;
}

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json(
        { erreur: "Accès refusé. Admin uniquement." },
        { status: 403 }
      );
    }

    // Créer les loyers manquants (silencieux si déjà faits)
    try {
      await creerLoyersManquants();
    } catch (e) {
      console.error("Erreur création loyers auto:", e);
    }

    const vendeurs = await prisma.vendeur.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { nom: true, email: true },
        },
        paiementsFinance: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const vendeursFormates = vendeurs.map((v) => ({
      id: v.id,
      nomBoutique: v.nomBoutique,
      telephone: v.telephone,
      userNom: v.user?.nom || null,
      userEmail: v.user?.email || null,
      createdAt: v.createdAt.toISOString(),
      paiementsFinance: v.paiementsFinance.map((p) => ({
        id: p.id,
        type: p.type,
        periode: p.periode,
        montant: p.montant,
        statut: p.statut,
        datePaiement: p.datePaiement ? p.datePaiement.toISOString() : null,
      })),
    }));

    return NextResponse.json({
      succes: true,
      vendeurs: vendeursFormates,
    });
  } catch (error) {
    console.error("Erreur API finance:", error);
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
}
