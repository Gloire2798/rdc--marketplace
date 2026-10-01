import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      vendeurId,
      nom,
      telephone,
      adresse,
      mode,
      reference,
      articles,
      totalFC,
      totalUSD,
      devise,
    } = body;

    if (!vendeurId || !nom || !telephone || !articles || articles.length === 0) {
      return NextResponse.json(
        { erreur: "Informations manquantes" },
        { status: 400 }
      );
    }

    // Vérifier que le vendeur existe
    const vendeur = await prisma.vendeur.findUnique({
      where: { id: vendeurId },
    });

    if (!vendeur) {
      return NextResponse.json(
        { erreur: "Boutique introuvable" },
        { status: 404 }
      );
    }

    // Déterminer l'acheteur
    let acheteurId: string | null = null;

    if (session && session.role === "ACHETEUR") {
      acheteurId = session.id;
    } else {
      const existant = await prisma.user.findUnique({
        where: { telephone },
      });

      if (existant) {
        acheteurId = existant.id;
      } else {
        const nouveau = await prisma.user.create({
          data: {
            telephone,
            nom,
            role: "ACHETEUR",
          },
        });
        acheteurId = nouveau.id;
      }
    }

    // Total utilisé pour la table (on additionne, on garde le détail en base)
    const totalCombine = (totalFC || 0) + (totalUSD || 0);

    // Créer la commande
    const commande = await prisma.commande.create({
      data: {
        acheteurId,
        nomClient: nom,
        telephoneClient: telephone,
        vendeurId,
        total: totalCombine,
        fraisLivraison: 0,
        mode,
        adresse: adresse || null,
        statut: "EN_ATTENTE",
        methodePaiement: "MOBILE_MONEY",
        items: {
          create: articles.map((a: {
            produitId: string;
            quantite: number;
            prix: number;
            prixPromo: number | null;
          }) => ({
            produitId: a.produitId,
            quantite: a.quantite,
            prixUnitaire: a.prixPromo !== null ? a.prixPromo : a.prix,
          })),
        },
        paiement: {
          create: {
            montant: totalCombine,
            methode: "MOBILE_MONEY",
            operateur: devise,
            refTransaction: reference,
            statut: "EN_ATTENTE",
            montantCommission: 0,
            montantVendeur: totalCombine,
          },
        },
      },
    });

    return NextResponse.json({
      succes: true,
      commandeId: commande.id,
      message: "Commande enregistrée !",
    });
  } catch (error) {
    console.error("Erreur création commande:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
