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
      },
    });

    if (!commande) {
      return NextResponse.json(
        { erreur: "Commande introuvable" },
        { status: 404 }
      );
    }

    // On retourne un token modifié pour identifier le type (commande:token)
    // Ça évite qu'un token d'autre chose soit scanné par erreur
    const tokenComplet = `CMD:${commande.id}:${commande.qrToken}`;

    return NextResponse.json({
      succes: true,
      qrToken: tokenComplet,
      statut: commande.statut,
    });
  } catch (error) {
    console.error("Erreur récupération QR:", error);
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
      }
