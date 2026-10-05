import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "VENDEUR") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const vendeur = await prisma.vendeur.findUnique({
      where: { userId: session.id },
    });

    if (!vendeur) {
      return NextResponse.json({ erreur: "Boutique introuvable" }, { status: 404 });
    }

    const { id } = await params;

    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story || story.vendeurId !== vendeur.id) {
      return NextResponse.json({ erreur: "Story introuvable" }, { status: 404 });
    }

    await prisma.story.delete({
      where: { id },
    });

    // ✅ Vider le cache de la page d'accueil (story supprimée)
    revalidateTag("accueil");

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur suppression story:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
