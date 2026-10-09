import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { creerNotification } from "@/lib/notifications";

// Transitions autorisées : de → vers
const TRANSITIONS_AUTORISEES: Record<string, string[]> = {
  EN_ATTENTE: ["PAYE", "ANNULE"],
  PAYE: ["PRET", "ANNULE"],
  PRET: ["RETIRE", "ANNULE"],
  RETIRE: [], // Statut final
  ANNULE: [], // Statut final
};

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
      return NextResponse.json(
        { erreur: "Boutique introuvable" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { statut: nouveauStatut } = body;

    const statutsValides = ["EN_ATTENTE", "PAYE", "PRET", "RETIRE", "ANNULE"];
    if (!statutsValides.includes(nouveauStatut)) {
      return NextResponse.json({ erreur: "Statut invalide" }, { status: 400 });
    }

    // ✅ TRANSACTION : vérification + mise à jour atomiques
    const commandeModifiee = await prisma.$transaction(async (tx) => {
      // 1. Récupérer la commande (dans la transaction)
      const commande = await tx.commande.findUnique({
        where: { id },
      });

      if (!commande || commande.vendeurId !== vendeur.id) {
        throw new Error("COMMANDE_INTROUVABLE");
      }

      // 2. Vérifier la transition autorisée
      const transitionsPossibles =
        TRANSITIONS_AUTORISEES[commande.statut] || [];

      if (!transitionsPossibles.includes(nouveauStatut)) {
        throw new Error("TRANSITION_INVALIDE");
      }

      // 3. Si on annule une commande → REMETTRE LE STOCK
      if (nouveauStatut === "ANNULE") {
        const items = await tx.commandeItem.findMany({
          where: { commandeId: id },
        });

        for (const item of items) {
          if (!item.produitId) continue;

          // Vérifier si l'item avait une variante
          const varianteInfo = item.varianteInfo
            ? JSON.parse(item.varianteInfo)
            : null;

          if (varianteInfo?.varianteId) {
            // Remettre le stock de la variante
            await tx.variante.update({
              where: { id: varianteInfo.varianteId },
              data: { stock: { increment: item.quantite } },
            });

            // Recalculer le stock total du produit
            const variantesProduit = await tx.variante.findMany({
              where: { produitId: item.produitId },
            });
            const nouveauStock = variantesProduit.reduce(
              (sum, v) => sum + v.stock,
              0
            );
            await tx.produit.update({
              where: { id: item.produitId },
              data: { stock: nouveauStock },
            });
          } else {
            // Remettre le stock du produit directement
            await tx.produit.update({
              where: { id: item.produitId },
              data: { stock: { increment: item.quantite } },
            });
          }
        }
      }

      // 4. Mettre à jour le statut
      const updated = await tx.commande.update({
        where: { id },
        data: { statut: nouveauStatut },
      });

      return updated;
    });

    // ✅ HORS TRANSACTION : notifications (non bloquantes)
    if (commandeModifiee.acheteurId) {
      const numCommande = commandeModifiee.id.slice(0, 8);

      let titre = "";
      let message = "";

      if (nouveauStatut === "PAYE") {
        titre = "✅ Paiement validé";
        message = `Votre commande #${numCommande} chez ${vendeur.nomBoutique} a été validée.`;
      } else if (nouveauStatut === "PRET") {
        titre = "🟢 Commande prête";
        message = `Votre commande #${numCommande} chez ${vendeur.nomBoutique} est prête à être retirée.`;
      } else if (nouveauStatut === "ANNULE") {
        titre = "❌ Commande annulée";
        message = `Votre commande #${numCommande} chez ${vendeur.nomBoutique} a été annulée.`;
      }

      if (titre && message) {
        try {
          await creerNotification(
            commandeModifiee.acheteurId,
            `COMMANDE_${nouveauStatut}`,
            titre,
            message,
            `/client/compte`
          );
        } catch (notifError) {
          console.error("Erreur notification (non bloquant):", notifError);
        }
      }
    }

    return NextResponse.json({ succes: true, commande: commandeModifiee });
  } catch (error) {
    // Gestion des erreurs métier
    if (error instanceof Error) {
      if (error.message === "COMMANDE_INTROUVABLE") {
        return NextResponse.json(
          { erreur: "Commande introuvable" },
          { status: 404 }
        );
      }
      if (error.message === "TRANSITION_INVALIDE") {
        return NextResponse.json(
          {
            erreur:
              "Transition de statut non autorisée. Vérifiez l'état actuel de la commande.",
          },
          { status: 400 }
        );
      }
    }

    console.error("Erreur mise à jour commande:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
