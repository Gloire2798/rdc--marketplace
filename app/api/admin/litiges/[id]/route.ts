import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { creerNotification } from "@/lib/notifications";

const STATUTS_VALIDES = ["RESOLU", "REJETE"];

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
    const { statut, decisionAdmin } = body;

    if (!statut || !STATUTS_VALIDES.includes(statut)) {
      return NextResponse.json({ erreur: "Statut invalide" }, { status: 400 });
    }

    if (!decisionAdmin || decisionAdmin.trim().length < 5) {
      return NextResponse.json(
        { erreur: "La décision doit être expliquée (min 5 caractères)" },
        { status: 400 }
      );
    }

    const litige = await prisma.litige.findUnique({
      where: { id },
      include: {
        client: true,
        vendeur: true,
        commande: true,
      },
    });

    if (!litige) {
      return NextResponse.json(
        { erreur: "Litige introuvable" },
        { status: 404 }
      );
    }

    if (litige.statut !== "OUVERT") {
      return NextResponse.json(
        { erreur: "Ce litige a déjà été traité" },
        { status: 400 }
      );
    }

    const litigeModifie = await prisma.litige.update({
      where: { id },
      data: {
        statut,
        decisionAdmin: decisionAdmin.trim(),
      },
    });

    const numCommande = litige.commandeId.slice(0, 8);
    const libelle = statut === "RESOLU" ? "résolu" : "rejeté";

    // ✅ Notification au client
    try {
      await creerNotification(
        litige.clientId,
        "LITIGE_TRAITE",
        statut === "RESOLU" ? "✅ Litige résolu" : "❌ Litige rejeté",
        `Votre litige sur la commande #${numCommande} a été ${libelle}. Décision : ${decisionAdmin.trim()}`,
        "/client/litiges"
      );
    } catch (notifError) {
      console.error("Erreur notification client:", notifError);
    }

    // ✅ Notification au vendeur
    try {
      const vendeur = await prisma.vendeur.findUnique({
        where: { id: litige.vendeurId },
        select: { userId: true },
      });

      if (vendeur) {
        await creerNotification(
          vendeur.userId,
          "LITIGE_TRAITE",
          statut === "RESOLU" ? "⚠️ Litige tranché contre vous" : "✅ Litige en votre faveur",
          `Le litige sur la commande #${numCommande} a été ${libelle}. Décision : ${decisionAdmin.trim()}`,
          "/vendeur/litiges"
        );
      }
    } catch (notifError) {
      console.error("Erreur notification vendeur:", notifError);
    }

    return NextResponse.json({
      succes: true,
      litige: litigeModifie,
    });
  } catch (error) {
    console.error("Erreur traitement litige:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
  }
