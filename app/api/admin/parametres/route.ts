import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET : lire les paramètres (crée la ligne par défaut si absente)
export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    let parametre = await prisma.parametre.findUnique({
      where: { id: "singleton" },
    });

    // Créer la ligne si elle n'existe pas
    if (!parametre) {
      parametre = await prisma.parametre.create({
        data: { id: "singleton" },
      });
    }

    return NextResponse.json({ succes: true, parametre });
  } catch (error) {
    console.error("Erreur GET parametres:", error);
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PATCH : mettre à jour les paramètres
export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();

    const {
      nomComplexe,
      adresse,
      telephone,
      fraisInscription,
      loyerMensuel,
      jourEcheance,
      numMobileMoney,
      lienAnalytics,
    } = body;

    // Construire les données à mettre à jour
    const data: Record<string, string | number | null> = {};

    if (typeof nomComplexe === "string" && nomComplexe.trim()) {
      data.nomComplexe = nomComplexe.trim();
    }
    if (typeof adresse === "string") {
      data.adresse = adresse.trim() || null;
    }
    if (typeof telephone === "string") {
      data.telephone = telephone.trim() || null;
    }
    if (typeof fraisInscription === "number" && fraisInscription >= 0) {
      data.fraisInscription = fraisInscription;
    }
    if (typeof loyerMensuel === "number" && loyerMensuel >= 0) {
      data.loyerMensuel = loyerMensuel;
    }
    if (
      typeof jourEcheance === "number" &&
      jourEcheance >= 1 &&
      jourEcheance <= 28
    ) {
      data.jourEcheance = jourEcheance;
    }
    if (typeof numMobileMoney === "string") {
      data.numMobileMoney = numMobileMoney.trim() || null;
    }
    if (typeof lienAnalytics === "string") {
      data.lienAnalytics = lienAnalytics.trim() || null;
    }

    // Upsert : créer ou mettre à jour
    const parametre = await prisma.parametre.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    return NextResponse.json({ succes: true, parametre });
  } catch (error) {
    console.error("Erreur PATCH parametres:", error);
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
        }
