import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { normaliserTelephone } from "@/lib/telephone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { telephone, motDePasse } = body;

    if (!telephone || !motDePasse) {
      return NextResponse.json(
        { erreur: "Téléphone et mot de passe requis" },
        { status: 400 }
      );
    }

    // ✅ Normalisation : peu importe le format saisi
    const telephoneNormalise = normaliserTelephone(telephone);

    const user = await prisma.user.findUnique({
      where: { telephone: telephoneNormalise },
      include: { vendeur: true },
    });

    if (!user || !user.motDePasse) {
      return NextResponse.json(
        { erreur: "Téléphone ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!motDePasseValide) {
      return NextResponse.json(
        { erreur: "Téléphone ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      succes: true,
      role: user.role,
      redirection:
        user.role === "VENDEUR"
          ? "/vendeur/dashboard"
          : user.role === "ADMIN"
          ? "/admin/dashboard"
          : "/client/compte",
    });
  } catch (error) {
    console.error("Erreur connexion:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
