import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  creerNotificationVendeur,
  creerNotificationAdmin,
} from "@/lib/notifications";

interface ArticleInput {
  produitId: string;
  quantite: number;
  prix: number;
  prixPromo: number | null;
  varianteId?: string | null;
  varianteInfo?: Record<string, string> | null;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      vendeurId,
      nom,
      telephone,
      adresse,
      mode,
      reference,
      articles,
      totalFC,
      totalUSD,
      devise,
      groupeId,
    } = body;

    if (!vendeurId || !nom || !telephone || !articles || articles.length === 0) {
      return NextResponse.json(
        { erreur: "Informations manquantes" },
        { status: 400 }
      );
    }

    const vendeur = await prisma.vendeur.findUnique({
      where: { id: vendeurId },
    });

    if (!vendeur) {
      return NextResponse.json(
        { erreur: "Boutique introuvable" },
        { status: 404 }
      );
    }

    // Récupérer ou créer l'acheteur (hors transaction — opération idempotente)
    let acheteurId: string | null = null;

    if (session && session.role === "ACHETEUR") {
      acheteurId = session.id;
    } else {
      const existant = await prisma.user.findUnique({
        where: { telephone },
      });

      if (existant) {
        acheteurId = existant.id;
      } else {
        const nouveau = await prisma.user.create({
          data: {
            telephone,
            nom,
            role: "ACHETEUR",
          },
        });
        acheteurId = nouveau.id;
      }
    }

    // Récupérer les noms des produits AVANT la transaction
    const produitsInfos = await prisma.produit.findMany({
      where: {
        id: { in: (articles as ArticleInput[]).map((a) => a.produitId) },
      },
      select: { id: true, nom: true },
    });
    const nomsProduits = new Map(produitsInfos.map((p) => [p.id, p.nom]));

    const totalCombine = (totalFC || 0) + (totalUSD || 0);

    // ✅ TRANSACTION : tout ou rien
    const commande = await prisma.$transaction(async (tx) => {
      // 1. Vérifier les stocks DANS la transaction (protection contre race conditions)
      for (const a of articles as ArticleInput[]) {
        if (a.varianteId) {
          const variante = await tx.variante.findUnique({
            where: { id: a.varianteId },
          });
          if (!variante || variante.stock < a.quantite) {
            throw new Error("STOCK_INSUFFISANT");
          }
        } else {
          const produit = await tx.produit.findUnique({
            where: { id: a.produitId },
          });
          if (!produit || produit.stock < a.quantite) {
            throw new Error("STOCK_INSUFFISANT");
          }
        }
      }

      // 2. Créer la commande + items + paiement
      const nouvelleCommande = await tx.commande.create({
        data: {
          groupeId: groupeId || null,
          acheteurId,
          nomClient: nom,
          telephoneClient: telephone,
          vendeurId,
          total: totalCombine,
          fraisLivraison: 0,
          mode,
          adresse: adresse || null,
          statut: "EN_ATTENTE",
          methodePaiement: "MOBILE_MONEY",
          items: {
            create: (articles as ArticleInput[]).map((a) => ({
              produitId: a.produitId,
              nomProduit: nomsProduits.get(a.produitId) || null,
              quantite: a.quantite,
              prixUnitaire: a.prixPromo !== null ? a.prixPromo : a.prix,
              varianteInfo: a.varianteInfo
                ? JSON.stringify(a.varianteInfo)
                : null,
            })),
          },
          paiement: {
            create: {
              montant: totalCombine,
              methode: "MOBILE_MONEY",
              operateur: devise,
              refTransaction: reference,
              statut: "EN_ATTENTE",
              montantCommission: 0,
              montantVendeur: totalCombine,
            },
          },
        },
      });

      // 3. Décrémenter les stocks
      for (const a of articles as ArticleInput[]) {
        if (a.varianteId) {
          await tx.variante.update({
            where: { id: a.varianteId },
            data: { stock: { decrement: a.quantite } },
          });

          // Recalculer le stock total du produit
          const variantesProduit = await tx.variante.findMany({
            where: { produitId: a.produitId },
          });
          const nouveauStock = variantesProduit.reduce(
            (sum, v) => sum + v.stock,
            0
          );
          await tx.produit.update({
            where: { id: a.produitId },
            data: { stock: Math.max(0, nouveauStock) },
          });
        } else {
          await tx.produit.update({
            where: { id: a.produitId },
            data: { stock: { decrement: a.quantite } },
          });
        }
      }

      return nouvelleCommande;
    });

    // ✅ HORS TRANSACTION : notifications (si ça échoue, la commande reste valide)
    const numCommande = commande.id.slice(0, 8);

    try {
      await creerNotificationVendeur(
        vendeurId,
        "COMMANDE_RECUE",
        "🛒 Nouvelle commande reçue",
        `Commande #${numCommande} de ${nom}. Validez-la dans votre dashboard.`,
        "/vendeur/commandes"
      );

      await creerNotificationAdmin(
        "COMMANDE_PASSEE",
        "📦 Nouvelle commande",
        `${nom} a commandé chez ${vendeur.nomBoutique} (commande #${numCommande}).`,
        "/admin/commandes"
      );
    } catch (notifError) {
      // On log mais on ne bloque pas la réponse
      console.error("Erreur notifications (non bloquant):", notifError);
    }

    return NextResponse.json({
      succes: true,
      commandeId: commande.id,
      message: "Commande enregistrée !",
    });
  } catch (error) {
    // Gestion spéciale du stock insuffisant
    if (error instanceof Error && error.message === "STOCK_INSUFFISANT") {
      return NextResponse.json(
        { erreur: "Stock insuffisant pour un article. Veuillez réessayer." },
        { status: 400 }
      );
    }

    console.error("Erreur création commande:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
            }
