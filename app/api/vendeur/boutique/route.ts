import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { nomBoutique, description, adresse, photoCouverture, photo2, photo3 } = body;

    if (!nomBoutique) {
      return NextResponse.json({ erreur: "Le nom est obligatoire" }, { status: 400 });
    }

    const vendeurModifie = await prisma.vendeur.update({
      where: { id: vendeur.id },
      data: {
        nomBoutique,
        description: description || null,
        adresse: adresse || null,
        photoCouverture: photoCouverture || null,
        photo2: photo2 || null,
        photo3: photo3 || null,
      },
    });

    // ✅ Vider le cache de la page d'accueil
    revalidateTag("accueil");

    return NextResponse.json({ succes: true, vendeur: vendeurModifie });
  } catch (error) {
    console.error("Erreur mise à jour boutique:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
