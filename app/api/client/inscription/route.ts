import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { normaliserTelephone, validerTelephone } from "@/lib/telephone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, telephone, email, motDePasse } = body;

    if (!nom || !telephone || !motDePasse) {
      return NextResponse.json(
        { erreur: "Nom, téléphone et mot de passe sont obligatoires" },
        { status: 400 }
      );
    }

    // ✅ Validation du format du téléphone
    const validationTel = validerTelephone(telephone);
    if (!validationTel.valide) {
      return NextResponse.json(
        { erreur: validationTel.erreur || "Numéro de téléphone invalide" },
        { status: 400 }
      );
    }

    // ✅ Normalisation du téléphone (stockage uniforme)
    const telephoneNormalise = normaliserTelephone(telephone);

    if (motDePasse.length < 6) {
      return NextResponse.json(
        { erreur: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Vérifier que le téléphone n'est pas déjà utilisé
    const existantTel = await prisma.user.findUnique({
      where: { telephone: telephoneNormalise },
    });

    if (existantTel) {
      return NextResponse.json(
        { erreur: "Ce numéro de téléphone a déjà un compte" },
        { status: 400 }
      );
    }

    // Vérifier que l'email n'est pas déjà utilisé (si fourni)
    const emailNettoye = email ? email.trim().toLowerCase() : null;

    if (emailNettoye) {
      const existantEmail = await prisma.user.findUnique({
        where: { email: emailNettoye },
      });

      if (existantEmail) {
        return NextResponse.json(
          { erreur: "Cet email a déjà un compte" },
          { status: 400 }
        );
      }
    }

    const motDePasseChiffre = await bcrypt.hash(motDePasse, 10);

    const user = await prisma.user.create({
      data: {
        telephone: telephoneNormalise,
        nom,
        email: emailNettoye,
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
