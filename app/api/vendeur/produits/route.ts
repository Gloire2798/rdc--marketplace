import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { creerNotificationAbonnes } from "@/lib/notifications";

interface VarianteInput {
  attributs: Record<string, string>;  // { "Taille": "M", "Couleur": "Noir" }
  stock: number;
  prix?: number | null;
  prixPromo?: number | null;
}

export async function POST(request: Request) {
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

    if (!vendeur.actif) {
      return NextResponse.json(
        { erreur: "Votre boutique doit être validée avant de publier des produits" },
        { status: 403 }
      );
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

    if (prix < 0) {
      return NextResponse.json(
        { erreur: "Le prix doit être positif" },
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

    // Vérifier les variantes si présentes
    const aVariantes = Array.isArray(variantes) && variantes.length > 0;

    if (aVariantes) {
      // Validation des variantes
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
    } else {
      // Pas de variantes → stock global obligatoire
      if (stock === undefined || stock < 0) {
        return NextResponse.json(
          { erreur: "Le stock est obligatoire" },
          { status: 400 }
        );
      }
    }

    // Calculer le stock total
    const stockTotal = aVariantes
      ? (variantes as VarianteInput[]).reduce((sum, v) => sum + v.stock, 0)
      : parseInt(stock);

    // Créer le produit
    const produit = await prisma.produit.create({
      data: {
        vendeurId: vendeur.id,
        nom,
        description: description || null,
        prix: parseFloat(prix),
        prixPromo: prixPromoFinal,
        devise: devise || "FC",
        stock: stockTotal,
        photo1,
        photo2: photo2 || null,
        photo3: photo3 || null,
        actif: true,
        variantes: aVariantes
          ? {
              create: (variantes as VarianteInput[]).map((v) => ({
                attributs: JSON.stringify(v.attributs),
                stock: v.stock,
                prix: v.prix || null,
                prixPromo: v.prixPromo || null,
              })),
            }
          : undefined,
      },
      include: {
        variantes: true,
      },
    });

    // Notification aux abonnés
    await creerNotificationAbonnes(
      vendeur.id,
      "NOUVEAU_PRODUIT",
      `🆕 Nouveau chez ${vendeur.nomBoutique}`,
      `Découvrez "${nom}" — disponible dès maintenant !`,
      `/acheteur/produit/${produit.id}`
    );

    return NextResponse.json({ succes: true, produit });
  } catch (error) {
    console.error("Erreur création produit:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
