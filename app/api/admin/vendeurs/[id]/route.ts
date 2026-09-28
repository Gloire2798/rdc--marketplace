import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
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
    const body = await request.json();
    const { actif } = body;

    const vendeur = await prisma.vendeur.update({
      where: { id },
      data: { actif },
    });

    return NextResponse.json({ succes: true, vendeur });
  } catch (error) {
    console.error("Erreur mise à jour vendeur:", error);
    return NextResponse.json(
      { erreur: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
