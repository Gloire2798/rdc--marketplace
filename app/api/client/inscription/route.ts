import { NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { normaliserTelephone, validerTelephone } from "@/lib/telephone";
import { verifierRateLimitMemoire, getIP } from "@/lib/rateLimit";

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

    // ✅ Validation
    const validationTel = validerTelephone(telephone);
    if (!validationTel.valide) {
      return NextResponse.json(
        { erreur: validationTel.erreur || "Numéro de téléphone invalide" },
        { status: 400 }
      );
    }

    const telephoneNormalise = normaliserTelephone(telephone);
    const ip = getIP(request) || "unknown";

    // ✅ Rate limiting PAR TÉLÉPHONE (3/24h)
    const limiteTel = verifierRateLimitMemoire(
      "/api/client/inscription",
      telephoneNormalise
    );
    if (!limiteTel.autorise) {
      const heures = Math.ceil((limiteTel.retryAfter || 0) / 3600);
      return NextResponse.json(
        { erreur: `Trop de tentatives. Réessayez dans ${heures} heure(s).` },
        { status: 429 }
      );
    }

    // ✅ Rate limiting PAR IP (20/24h)
    const limiteIp = verifierRateLimitMemoire(
      "/api/client/inscription-ip",
      ip
    );
    if (!limiteIp.autorise) {
      const heures = Math.ceil((limiteIp.retryAfter || 0) / 3600);
      return NextResponse.json(
        { erreur: `Trop de tentatives depuis ce réseau. Réessayez dans ${heures} heure(s).` },
        { status: 429 }
      );
    }

    if (motDePasse.length < 6) {
      return NextResponse.json(
        { erreur: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Vérifier téléphone existant
    const existantTel = await prisma.user.findUnique({
      where: { telephone: telephoneNormalise },
    });
    if (existantTel) {
      return NextResponse.json(
        { erreur: "Ce numéro de téléphone a déjà un compte" },
        { status: 400 }
      );
    }

    // Vérifier email
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
