import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const LIMITE_STORIES = 10;

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

    await prisma.story.deleteMany({
      where: {
        vendeurId: vendeur.id,
        expireAt: { lt: new Date() },
      },
    });

    const nombreStories = await prisma.story.count({
      where: { vendeurId: vendeur.id },
    });

    if (nombreStories >= LIMITE_STORIES) {
      return NextResponse.json(
        { erreur: `Limite de ${LIMITE_STORIES} stories atteinte` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { photo, legende } = body;

    if (!photo) {
      return NextResponse.json({ erreur: "Photo obligatoire" }, { status: 400 });
    }

    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + 24);

    const story = await prisma.story.create({
      data: {
        vendeurId: vendeur.id,
        photo,
        legende: legende || null,
        expireAt,
      },
    });

    // ✅ Vider le cache de la page d'accueil (nouvelles stories)
    revalidateTag("accueil");

    return NextResponse.json({
      succes: true,
      story: {
        id: story.id,
        photo: story.photo,
        legende: story.legende,
        expireAt: story.expireAt.toISOString(),
        heuresRestantes: 24,
      },
    });
  } catch (error) {
    console.error("Erreur création story:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
      }
