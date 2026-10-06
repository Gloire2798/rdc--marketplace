import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface VarianteInput {
  attributs: Record<string, string>;
  stock: number;
  prix?: number | null;
  prixPromo?: number | null;
}

// GET : récupérer un produit
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
      include: { variantes: true },
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

// PATCH : modifier un produit
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
    const {
      nom,
      description,
      prix,
      prixPromo,
      devise,
      stock,
      photo1,
      photo2,
      photo3,
      variantes,
    } = body;

    if (!nom || prix === undefined) {
      return NextResponse.json(
        { erreur: "Nom et prix sont obligatoires" },
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

    const aVariantes = Array.isArray(variantes) && variantes.length > 0;

    if (aVariantes) {
      for (const v of variantes as VarianteInput[]) {
        if (!v.attributs || typeof v.attributs !== "object" || Object.keys(v.attributs).length === 0) {
          return NextResponse.json(
            { erreur: "Chaque variante doit avoir des attributs" },
            { status: 400 }
          );
        }
        if (typeof v.stock !== "number" || v.stock < 0) {
          return NextResponse.json(
            { erreur: "Le stock des variantes doit être un nombre positif" },
            { status: 400 }
          );
        }
      }
    }

    const stockTotal = aVariantes
      ? (variantes as VarianteInput[]).reduce((sum, v) => sum + v.stock, 0)
      : parseInt(stock || "0");

    const produitModifie = await prisma.produit.update({
      where: { id },
      data: {
        nom,
        description: description || null,
        prix: parseFloat(prix),
        prixPromo: prixPromoFinal,
        devise: devise || "FC",
        stock: stockTotal,
        photo1,
        photo2: photo2 || null,
        photo3: photo3 || null,
      },
    });

    if (aVariantes) {
      await prisma.variante.deleteMany({
        where: { produitId: id },
      });

      await prisma.variante.createMany({
        data: (variantes as VarianteInput[]).map((v) => ({
          produitId: id,
          attributs: JSON.stringify(v.attributs),
          stock: v.stock,
          prix: v.prix || null,
          prixPromo: v.prixPromo || null,
        })),
      });
    } else {
      await prisma.variante.deleteMany({
        where: { produitId: id },
      });
    }

    return NextResponse.json({ succes: true, produit: produitModifie });
  } catch (error) {
    console.error("Erreur PATCH produit:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : supprimer un produit
// ✅ MODIFIÉ : ne bloque plus si le produit est dans des commandes
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

    // ✅ Supprimer les variantes d'abord
    await prisma.variante.deleteMany({
      where: { produitId: id },
    });

    // ✅ Supprimer le produit
    // Grâce à onDelete: SetNull, les CommandeItem gardent leurs infos
    // (nomProduit + prixUnitaire sont conservés)
    await prisma.produit.delete({
      where: { id },
    });

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur DELETE produit:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
  }
