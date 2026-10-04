import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({
        succes: true,
        produits: [],
        boutiques: [],
      });
    }

    const produits = await prisma.produit.findMany({
      where: {
        actif: true,
        OR: [
          { nom: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
      include: {
        vendeur: {
          select: {
            nomBoutique: true,
            actif: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const produitsFiltres = produits.filter((p) => p.vendeur.actif);

    const boutiques = await prisma.vendeur.findMany({
      where: {
        actif: true,
        OR: [
          { nomBoutique: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: {
        id: true,
        nomBoutique: true,
        description: true,
        logo: true,
        photoCouverture: true,
        adresse: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      succes: true,
      produits: produitsFiltres.map((p) => ({
        id: p.id,
        nom: p.nom,
        photo1: p.photo1,
        prix: p.prix,
        prixPromo: p.prixPromo,
        devise: p.devise,
        nomBoutique: p.vendeur.nomBoutique,
      })),
      boutiques,
    });
  } catch (error) {
    console.error("Erreur recherche:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
      }
