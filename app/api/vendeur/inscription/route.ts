import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerNotificationAdmin } from "@/lib/notifications";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      telephone,
      email,
      motDePasse,
      nom,
      nomBoutique,
      description,
      adresse,
      numMobileMoney,
      numMpesa,
      numOrange,
      numAirtel,
    } = body;

    if (!telephone || !email || !motDePasse || !nom || !nomBoutique) {
      return NextResponse.json(
        { erreur: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    if (motDePasse.length < 6) {
      return NextResponse.json(
        { erreur: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    if (!numMobileMoney && !numMpesa && !numOrange && !numAirtel) {
      return NextResponse.json(
        { erreur: "Vous devez renseigner au moins un numéro Mobile Money" },
        { status: 400 }
      );
    }

    // Vérifier le téléphone
    const existantTel = await prisma.user.findUnique({
      where: { telephone },
    });

    if (existantTel) {
      return NextResponse.json(
        { erreur: "Ce numéro de téléphone a déjà un compte" },
        { status: 400 }
      );
    }

    // Vérifier l'email
    const emailNettoye = email.trim().toLowerCase();

    const existantEmail = await prisma.user.findUnique({
      where: { email: emailNettoye },
    });

    if (existantEmail) {
      return NextResponse.json(
        { erreur: "Cet email a déjà un compte" },
        { status: 400 }
      );
    }

    const motDePasseChiffre = await bcrypt.hash(motDePasse, 10);

    const user = await prisma.user.create({
      data: {
        telephone,
        email: emailNettoye,
        nom,
        role: "VENDEUR",
        motDePasse: motDePasseChiffre,
        vendeur: {
          create: {
            nomBoutique,
            description: description || null,
            adresse: adresse || null,
            telephone,
            numMobileMoney:
              numMobileMoney || numMpesa || numOrange || numAirtel,
            numMpesa: numMpesa || null,
            numOrange: numOrange || null,
            numAirtel: numAirtel || null,
            actif: false,
          },
        },
      },
    });

    // Notification aux admins
    await creerNotificationAdmin(
      "NOUVEAU_VENDEUR",
      "🏪 Nouvelle boutique à valider",
      `${nom} vient d'inscrire la boutique "${nomBoutique}". Validez-la dans le dashboard.`,
      "/admin/dashboard"
    );

    return NextResponse.json({
      succes: true,
      message:
        "Compte créé ! Votre boutique sera activée après validation par l'administrateur.",
      userId: user.id,
    });
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
