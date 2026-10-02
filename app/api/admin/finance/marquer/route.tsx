import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const MONTANTS: Record<string, number> = {
  INSCRIPTION: 25000,
  LOYER: 15000,
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json(
        { erreur: "Accès refusé. Admin uniquement." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { vendeurId, type, periode } = body;

    if (!vendeurId || !type || !periode) {
      return NextResponse.json(
        { erreur: "Champs manquants : vendeurId, type, periode" },
        { status: 400 }
      );
    }

    if (!["INSCRIPTION", "LOYER"].includes(type)) {
      return NextResponse.json(
        { erreur: "Type invalide" },
        { status: 400 }
      );
    }

    const vendeur = await prisma.vendeur.findUnique({
      where: { id: vendeurId },
      select: { id: true },
    });

    if (!vendeur) {
      return NextResponse.json(
        { erreur: "Vendeur introuvable" },
        { status: 404 }
      );
    }

    const montant = MONTANTS[type] || 0;

    const paiement = await prisma.paiementFinance.upsert({
      where: {
        vendeurId_type_periode: {
          vendeurId,
          type,
          periode,
        },
      },
      update: {
        statut: "PAYE",
        datePaiement: new Date(),
      },
      create: {
        vendeurId,
        type,
        periode,
        montant,
        statut: "PAYE",
        datePaiement: new Date(),
      },
    });

    return NextResponse.json({
      succes: true,
      paiement,
    });
  } catch (error) {
    console.error("Erreur marquer payé:", error);
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
        }
