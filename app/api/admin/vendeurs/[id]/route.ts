import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH : Modifier une boutique (ex: valider / désactiver)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { actif } = body;

    // Récupérer l'état actuel du vendeur
    const vendeurActuel = await prisma.vendeur.findUnique({
      where: { id },
      select: { actif: true, prochaineEcheance: true },
    });

    if (!vendeurActuel) {
      return NextResponse.json(
        { erreur: "Boutique introuvable" },
        { status: 404 }
      );
    }

    // Préparer les données à mettre à jour
    const data: { actif: boolean; prochaineEcheance?: Date } = { actif };

    // Si on valide une boutique qui était inactive → calculer l'échéance
    if (actif === true && vendeurActuel.actif === false) {
      const nouvelleEcheance = new Date();
      nouvelleEcheance.setDate(nouvelleEcheance.getDate() + 30);
      data.prochaineEcheance = nouvelleEcheance;
    }

    const vendeur = await prisma.vendeur.update({
      where: { id },
      data,
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

// DELETE : Supprimer définitivement une boutique + ses données liées
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const vendeur = await prisma.vendeur.findUnique({
      where: { id },
      select: { id: true, nomBoutique: true },
    });

    if (!vendeur) {
      return NextResponse.json(
        { erreur: "Boutique introuvable" },
        { status: 404 }
      );
    }

    const commandes = await prisma.commande.findMany({
      where: { vendeurId: id },
      select: { id: true },
    });

    const produits = await prisma.produit.findMany({
      where: { vendeurId: id },
      select: { id: true },
    });

    const commandeIds = commandes.map((c) => c.id);
    const produitIds = produits.map((p) => p.id);

    await prisma.$transaction(async (tx) => {
      if (commandeIds.length > 0) {
        await tx.qrScan.deleteMany({
          where: { commandeId: { in: commandeIds } },
        });
      }

      if (commandeIds.length > 0) {
        await tx.paiement.deleteMany({
          where: { commandeId: { in: commandeIds } },
        });
      }

      if (commandeIds.length > 0) {
        await tx.commandeItem.deleteMany({
          where: { commandeId: { in: commandeIds } },
        });
      }

      await tx.commande.deleteMany({
        where: { vendeurId: id },
      });

      await tx.paiementFinance.deleteMany({
        where: { vendeurId: id },
      });

      await tx.story.deleteMany({
        where: { vendeurId: id },
      });

      if (produitIds.length > 0) {
        await tx.commandeItem.deleteMany({
          where: { produitId: { in: produitIds } },
        });
      }

      await tx.produit.deleteMany({
        where: { vendeurId: id },
      });

      await tx.vendeur.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      succes: true,
      message: `Boutique "${vendeur.nomBoutique}" supprimée définitivement`,
    });
  } catch (error) {
    console.error("Erreur suppression vendeur:", error);
    return NextResponse.json(
      { erreur: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
