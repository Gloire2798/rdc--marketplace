import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vendeur = await prisma.vendeur.findUnique({
      where: { id },
      select: {
        id: true,
        nomBoutique: true,
        telephone: true,
        numMpesa: true,
        numOrange: true,
        numAirtel: true,
        numMobileMoney: true,
      },
    });

    if (!vendeur) {
      return NextResponse.json(
        { erreur: "Boutique introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ succes: true, vendeur });
  } catch (error) {
    console.error("Erreur infos vendeur:", error);
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
}
