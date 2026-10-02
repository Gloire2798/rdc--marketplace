import { NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth"; 

export async function DELETE(
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

    const abonnement = await prisma.abonnement.findUnique({
      where: { id },
    });

    if (!abonnement || abonnement.vendeurId !== vendeur.id) {
      return NextResponse.json({ erreur: "Abonnement introuvable" }, { status: 404 });
    }

    await prisma.abonnement.delete({
      where: { id },
    });

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur DELETE abonnement:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
