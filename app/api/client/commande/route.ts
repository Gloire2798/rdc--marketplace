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
      total,
      acompte,
      reste,
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

    // Déterminer l'acheteur :
    // - Si connecté en tant qu'ACHETEUR → utiliser son compte
    // - Sinon → créer ou récupérer un compte invité avec le téléphone saisi
    // - Si connecté en tant que VENDEUR ou ADMIN → ne pas lier au compte
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

    // Récupérer la devise depuis le premier article
    const deviseCommande = articles[0]?.devise || "FC";

    const commande = await prisma.commande.create({
      data: {
        acheteurId,
        nomClient: nom,
        telephoneClient: telephone,
        vendeurId,
        total,
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
            montant: total,
            methode: "MOBILE_MONEY",
            operateur: deviseCommande,
            refTransaction: reference,
            statut: "EN_ATTENTE",
            montantCommission: 0,
            montantVendeur: total,
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
