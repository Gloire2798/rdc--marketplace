import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { telephone, code, nouveauMotDePasse } = body;

    if (!telephone || !code || !nouveauMotDePasse) {
      return NextResponse.json(
        { erreur: "Champs manquants" },
        { status: 400 }
      );
    }

    if (nouveauMotDePasse.length < 6) {
      return NextResponse.json(
        { erreur: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telephone },
    });

    if (!user) {
      return NextResponse.json(
        { erreur: "Aucun compte trouvé" },
        { status: 404 }
      );
    }

    // Chercher un token valide
    const token = await prisma.tokenReset.findFirst({
      where: {
        userId: user.id,
        code,
        utilise: false,
        expireAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return NextResponse.json(
        { erreur: "Code invalide ou expiré" },
        { status: 400 }
      );
    }

    // Chiffrer le nouveau mot de passe
    const motDePasseChiffre = await bcrypt.hash(nouveauMotDePasse, 10);

    // Mettre à jour le mot de passe + marquer le token utilisé
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { motDePasse: motDePasseChiffre },
      }),
      prisma.tokenReset.update({
        where: { id: token.id },
        data: { utilise: true },
      }),
    ]);

    return NextResponse.json({
      succes: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur réinitialisation:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
  }
