import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { creerNotification } from "@/lib/notifications";

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

    const commande = await prisma.commande.findUnique({
      where: { id },
    });

    if (!commande || commande.vendeurId !== vendeur.id) {
      return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const { statut } = body;

    const statutsValides = ["EN_ATTENTE", "PAYE", "PRET", "RETIRE", "ANNULE"];
    if (!statutsValides.includes(statut)) {
      return NextResponse.json({ erreur: "Statut invalide" }, { status: 400 });
    }

    const commandeModifiee = await prisma.commande.update({
      where: { id },
      data: { statut },
    });

    // 🔔 Notification au client (si connu)
    if (commande.acheteurId) {
      const numCommande = commande.id.slice(0, 8);

      let titre = "";
      let message = "";

      if (statut === "PAYE") {
        titre = "✅ Paiement validé";
        message = `Votre commande #${numCommande} chez ${vendeur.nomBoutique} a été validée.`;
      } else if (statut === "PRET") {
        titre = "🟢 Commande prête";
        message = `Votre commande #${numCommande} chez ${vendeur.nomBoutique} est prête à être retirée.`;
      } else if (statut === "ANNULE") {
        titre = "❌ Commande annulée";
        message = `Votre commande #${numCommande} chez ${vendeur.nomBoutique} a été annulée.`;
      }

      if (titre && message) {
        await creerNotification(
          commande.acheteurId,
          `COMMANDE_${statut}`,
          titre,
          message,
          `/client/compte`
        );
      }
    }

    return NextResponse.json({ succes: true, commande: commandeModifiee });
  } catch (error) {
    console.error("Erreur mise à jour commande:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
