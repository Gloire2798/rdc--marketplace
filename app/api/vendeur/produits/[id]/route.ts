import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
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

    const produit = await prisma.produit.findUnique({
      where: { id },
    });

    if (!produit || produit.vendeurId !== vendeur.id) {
      return NextResponse.json({ erreur: "Produit introuvable" }, { status: 404 });
    }

    return NextResponse.json({ succes: true, produit });
  } catch (error) {
    console.error("Erreur GET produit:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}

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

    const produit = await prisma.produit.findUnique({
      where: { id },
    });

    if (!produit || produit.vendeurId !== vendeur.id) {
      return NextResponse.json({ erreur: "Produit introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const { nom, description, prix, prixPromo, devise, stock, photo1, photo2, photo3 } = body;

    if (!nom || prix === undefined || stock === undefined) {
      return NextResponse.json(
        { erreur: "Nom, prix et stock sont obligatoires" },
        { status: 400 }
      );
    }

    if (!photo1) {
      return NextResponse.json(
        { erreur: "La photo principale est obligatoire" },
        { status: 400 }
      );
    }

    let prixPromoFinal = null;
    if (prixPromo !== undefined && prixPromo !== null && prixPromo !== "") {
      const promo = parseFloat(prixPromo);
      if (promo >= parseFloat(prix)) {
        return NextResponse.json(
          { erreur: "Le prix promotionnel doit être inférieur au prix normal" },
          { status: 400 }
        );
      }
      prixPromoFinal = promo;
    }

    const produitModifie = await prisma.produit.update({
      where: { id },
      data: {
        nom,
        description: description || null,
        prix: parseFloat(prix),
        prixPromo: prixPromoFinal,
        devise: devise || "FC",
        stock: parseInt(stock),
        photo1,
        photo2: photo2 || null,
        photo3: photo3 || null,
      },
    });

    return NextResponse.json({ succes: true, produit: produitModifie });
  } catch (error) {
    console.error("Erreur PATCH produit:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}

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

    const produit = await prisma.produit.findUnique({
      where: { id },
    });

    if (!produit || produit.vendeurId !== vendeur.id) {
      return NextResponse.json({ erreur: "Produit introuvable" }, { status: 404 });
    }

    await prisma.produit.delete({
      where: { id },
    });

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur DELETE produit:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
