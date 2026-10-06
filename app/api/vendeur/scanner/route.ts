import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST : Valider le QR et retourner les infos
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

    const body = await request.json();
    const { qrToken } = body;

    if (!qrToken || typeof qrToken !== "string") {
      return NextResponse.json({ erreur: "QR invalide" }, { status: 400 });
    }

    const parts = qrToken.split(":");
    if (parts.length !== 3 || parts[0] !== "CMD") {
      return NextResponse.json({ erreur: "QR non reconnu" }, { status: 400 });
    }

    const [, commandeId, token] = parts;

    const commande = await prisma.commande.findUnique({
      where: { id: commandeId },
      include: {
        items: { include: { produit: true } },
        vendeur: {
          select: {
            id: true,
            nomBoutique: true,
          },
        },
      },
    });

    if (!commande) {
      return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
    }

    if (commande.qrToken !== token) {
      return NextResponse.json({ erreur: "QR falsifié" }, { status: 400 });
    }

    if (commande.vendeurId !== vendeur.id) {
      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { telephone: true },
      });

      return NextResponse.json(
        {
          erreur: "QR_MAUVAISE_BOUTIQUE",
          message: `Ce QR appartient à la boutique "${commande.vendeur.nomBoutique}". Contactez l'administrateur GK Sensei pour plus d'informations.`,
          boutiqueProprietaire: commande.vendeur.nomBoutique,
          whatsappAdmin: admin?.telephone
            ? admin.telephone.replace(/\D/g, "")
            : null,
        },
        { status: 403 }
      );
    }

    if (commande.statut === "RETIRE") {
      return NextResponse.json(
        { erreur: "Cette commande a déjà été retirée" },
        { status: 400 }
      );
    }

    if (commande.statut !== "PRET") {
      return NextResponse.json(
        {
          erreur:
            commande.statut === "EN_ATTENTE"
              ? "Cette commande n'a pas encore été validée par vos soins"
              : "Cette commande n'est pas encore prête pour le retrait",
        },
        { status: 400 }
      );
    }

    if (commande.qrExpireAt && commande.qrExpireAt < new Date()) {
      return NextResponse.json(
        { erreur: "Ce QR a expiré" },
        { status: 400 }
      );
    }

    // Calculer les totaux séparés par devise
    let totalFC = 0;
    let totalUSD = 0;

    commande.items.forEach((i) => {
      const montant = i.prixUnitaire * i.quantite;
      // ✅ CORRIGÉ : produit peut être null
      if (i.produit?.devise === "USD") {
        totalUSD += montant;
      } else {
        totalFC += montant;
      }
    });

    const acompteFC = Math.round(totalFC * 0.1);
    const acompteUSD = Math.round(totalUSD * 0.1 * 100) / 100;
    const resteFC = totalFC - acompteFC;
    const resteUSD = totalUSD - acompteUSD;

    return NextResponse.json({
      succes: true,
      commande: {
        id: commande.id,
        nomClient: commande.nomClient || "Client",
        telephoneClient: commande.telephoneClient || "—",
        adresse: commande.adresse,
        mode: commande.mode,
        totalFC,
        totalUSD,
        acompteFC,
        acompteUSD,
        resteFC,
        resteUSD,
        statut: commande.statut,
        createdAt: commande.createdAt.toISOString(),
        nomBoutique: vendeur.nomBoutique,
        items: commande.items.map((i) => ({
          // ✅ CORRIGÉ : produit peut être null
          nom: i.produit?.nom || i.nomProduit || "Produit supprimé",
          quantite: i.quantite,
          prixUnitaire: i.prixUnitaire,
          devise: i.produit?.devise || "FC",
        })),
      },
    });
  } catch (error) {
    console.error("Erreur scanner:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}

// PUT : Confirmer le retrait (marquer comme RETIRE + invalider le QR)
export async function PUT(request: Request) {
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
    const { commandeId } = body;

    if (!commandeId) {
      return NextResponse.json({ erreur: "ID manquant" }, { status: 400 });
    }

    const commande = await prisma.commande.findUnique({
      where: { id: commandeId },
    });

    if (!commande) {
      return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
    }

    if (commande.vendeurId !== vendeur.id) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    if (commande.statut === "RETIRE") {
      return NextResponse.json(
        { erreur: "Déjà retirée" },
        { status: 400 }
      );
    }

    await prisma.commande.update({
      where: { id: commandeId },
      data: {
        statut: "RETIRE",
        retireAt: new Date(),
        qrToken: `USED_${commande.qrToken}`,
      },
    });

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur validation retrait:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
      }
