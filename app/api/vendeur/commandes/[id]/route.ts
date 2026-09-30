import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "VENDEUR") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const vendeur = await prisma.vendeur.findUnique({
      where: { userId: session.id },
    });

    if (!vendeur) {
      return NextResponse.json({ erreur: "Boutique introuvable" }, { status: 404 });
    }

    const commande = await prisma.commande.findUnique({
      where: { id },
    });

    if (!commande || commande.vendeurId !== vendeur.id) {
      return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const { statut } = body;

    const statutsValides = ["EN_ATTENTE", "PAYE", "PRET", "RETIRE", "ANNULE"];
    if (!statutsValides.includes(statut)) {
      return NextResponse.json({ erreur: "Statut invalide" }, { status: 400 });
    }

    const commandeModifiee = await prisma.commande.update({
      where: { id },
      data: { statut },
    });

    return NextResponse.json({ succes: true, commande: commandeModifiee });
  } catch (error) {
    console.error("Erreur mise à jour commande:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
