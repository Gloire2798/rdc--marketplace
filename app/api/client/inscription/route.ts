import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, telephone, motDePasse } = body;

    if (!nom || !telephone || !motDePasse) {
      return NextResponse.json(
        { erreur: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    if (motDePasse.length < 6) {
      return NextResponse.json(
        { erreur: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    const existant = await prisma.user.findUnique({
      where: { telephone },
    });

    if (existant) {
      return NextResponse.json(
        { erreur: "Ce numéro de téléphone est déjà utilisé" },
        { status: 400 }
      );
    }

    const motDePasseChiffre = await bcrypt.hash(motDePasse, 10);

    const user = await prisma.user.create({
      data: {
        telephone,
        nom,
        role: "ACHETEUR",
        motDePasse: motDePasseChiffre,
      },
    });

    return NextResponse.json({
      succes: true,
      message: "Compte créé !",
      userId: user.id,
    });
  } catch (error) {
    console.error("Erreur inscription client:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
