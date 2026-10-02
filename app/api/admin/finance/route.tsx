import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json(
        { erreur: "Accès refusé. Admin uniquement." },
        { status: 403 }
      );
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
