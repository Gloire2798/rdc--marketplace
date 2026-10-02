import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET : liste des abonnements du client connecté
export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "ACHETEUR") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const abonnements = await prisma.abonnement.findMany({
      where: { userId: session.id },
      include: {
        vendeur: {
          select: {
            id: true,
            nomBoutique: true,
            logo: true,
            photoCouverture: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ succes: true, abonnements });
  } catch (error) {
    console.error("Erreur GET abonnements:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}

// POST : suivre une boutique
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ACHETEUR") {
      return NextResponse.json(
        { erreur: "Vous devez créer un compte client pour suivre une boutique" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { vendeurId } = body;

    if (!vendeurId) {
      return NextResponse.json({ erreur: "vendeurId manquant" }, { status: 400 });
    }

    const vendeur = await prisma.vendeur.findUnique({
      where: { id: vendeurId },
      select: { id: true, actif: true },
    });

    if (!vendeur || !vendeur.actif) {
      return NextResponse.json({ erreur: "Boutique introuvable" }, { status: 404 });
    }

    // Vérifier si déjà abonné
    const existant = await prisma.abonnement.findUnique({
      where: {
        userId_vendeurId: {
          userId: session.id,
          vendeurId,
        },
      },
    });

    if (existant) {
      return NextResponse.json({ succes: true, message: "Déjà abonné" });
    }

    await prisma.abonnement.create({
      data: {
        userId: session.id,
        vendeurId,
      },
    });

    return NextResponse.json({ succes: true, message: "Boutique suivie" });
  } catch (error) {
    console.error("Erreur POST abonnement:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : ne plus suivre
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ACHETEUR") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const vendeurId = searchParams.get("vendeurId");

    if (!vendeurId) {
      return NextResponse.json({ erreur: "vendeurId manquant" }, { status: 400 });
    }

    await prisma.abonnement.deleteMany({
      where: {
        userId: session.id,
        vendeurId,
      },
    });

    return NextResponse.json({ succes: true, message: "Désabonné" });
  } catch (error) {
    console.error("Erreur DELETE abonnement:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
      }
