import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { erreur: "Non autorisé" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const produit = await prisma.produit.findUnique({
      where: { id },
    });

    if (!produit) {
      return NextResponse.json(
        { erreur: "Produit introuvable" },
        { status: 404 }
      );
    }

    await prisma.produit.delete({
      where: { id },
    });

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur suppression produit:", error);
    return NextResponse.json(
      { erreur: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
      }
