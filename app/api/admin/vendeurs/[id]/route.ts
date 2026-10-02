import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH : Modifier une boutique (ex: restaurer / désactiver)
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

    // Vérifier que la boutique existe
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

    // Récupérer les IDs des commandes et produits liés
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

    // Suppression en cascade manuelle (ordre important)
    await prisma.$transaction(async (tx) => {
      // 1. Scans QR des commandes
      if (commandeIds.length > 0) {
        await tx.qrScan.deleteMany({
          where: { commandeId: { in: commandeIds } },
        });
      }

      // 2. Paiements des commandes
      if (commandeIds.length > 0) {
        await tx.paiement.deleteMany({
          where: { commandeId: { in: commandeIds } },
        });
      }

      // 3. Lignes de commande
      if (commandeIds.length > 0) {
        await tx.commandeItem.deleteMany({
          where: { commandeId: { in: commandeIds } },
        });
      }

      // 4. Commandes
      await tx.commande.deleteMany({
        where: { vendeurId: id },
      });

      // 5. Paiements finance (loyers, inscriptions)
      await tx.paiementFinance.deleteMany({
        where: { vendeurId: id },
      });

      // 6. Stories
      await tx.story.deleteMany({
        where: { vendeurId: id },
      });

      // 7. Items de commande liés aux produits du vendeur (sécurité)
      if (produitIds.length > 0) {
        await tx.commandeItem.deleteMany({
          where: { produitId: { in: produitIds } },
        });
      }

      // 8. Produits
      await tx.produit.deleteMany({
        where: { vendeurId: id },
      });

      // 9. Vendeur
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
