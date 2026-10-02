import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { creerNotificationAbonnes } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "VENDEUR") {
      return NextResponse.json(
        { erreur: "Non autorisé" },
        { status: 403 }
      );
    }

    const vendeur = await prisma.vendeur.findUnique({
      where: { userId: session.id },
    });

    if (!vendeur) {
      return NextResponse.json(
        { erreur: "Boutique introuvable" },
        { status: 404 }
      );
    }

    if (!vendeur.actif) {
      return NextResponse.json(
        { erreur: "Votre boutique doit être validée avant de publier des produits" },
        { status: 403 }
      );
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

    if (prix < 0 || stock < 0) {
      return NextResponse.json(
        { erreur: "Le prix et le stock doivent être positifs" },
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

    const produit = await prisma.produit.create({
      data: {
        vendeurId: vendeur.id,
        nom,
        description: description || null,
        prix: parseFloat(prix),
        prixPromo: prixPromoFinal,
        devise: devise || "FC",
        stock: parseInt(stock),
        photo1,
        photo2: photo2 || null,
        photo3: photo3 || null,
        actif: true,
      },
    });

    // 🔔 Notifier tous les abonnés de la boutique
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
