import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commandeId = searchParams.get("commande");

    if (!commandeId) {
      return NextResponse.json(
        { erreur: "ID de commande manquant" },
        { status: 400 }
      );
    }

    const commande = await prisma.commande.findUnique({
      where: { id: commandeId },
      select: {
        id: true,
        qrToken: true,
        statut: true,
        retireAt: true,
        vendeur: {
          select: {
            nomBoutique: true,
          },
        },
      },
    });

    if (!commande) {
      return NextResponse.json(
        { erreur: "Commande introuvable" },
        { status: 404 }
      );
    }

    const estRetiree = commande.statut === "RETIRE";

    const tokenComplet = estRetiree
      ? null
      : `CMD:${commande.id}:${commande.qrToken}`;

    return NextResponse.json({
      succes: true,
      qrToken: tokenComplet,
      statut: commande.statut,
      retireAt: commande.retireAt ? commande.retireAt.toISOString() : null,
      nomBoutique: commande.vendeur.nomBoutique,
    });
  } catch (error) {
    console.error("Erreur récupération QR:", error);
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
}
