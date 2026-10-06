import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoBoutique from "@/app/components/LogoBoutique";
import NavigationBas from "./NavigationBas";
import GraphiqueVendeur from "./GraphiqueVendeur";
import TopProduits from "./TopProduits";
import { Plus, Store, Camera, Package, ShoppingCart, CheckCircle, Clock, Globe } from "lucide-react";

export default async function DashboardVendeur() {
  const session = await getSession();

  if (!session) {
    redirect("/vendeur/connexion");
  }

  if (session.role !== "VENDEUR") {
    redirect("/");
  }

  const vendeur = await prisma.vendeur.findUnique({
    where: { userId: session.id },
  });

  if (!vendeur) {
    redirect("/vendeur/connexion");
  }

  const nombreProduits = await prisma.produit.count({
    where: { vendeurId: vendeur.id },
  });

  const nombreCommandes = await prisma.commande.count({
    where: { vendeurId: vendeur.id, statut: { not: "ANNULE" } },
  });

  const nombreStories = await prisma.story.count({
    where: { vendeurId: vendeur.id, expireAt: { gt: new Date() } },
  });

  const commandesValidees = await prisma.commande.findMany({
    where: {
      vendeurId: vendeur.id,
      statut: { in: ["PAYE", "PRET", "RETIRE"] },
    },
    include: {
      items: { include: { produit: true } },
    },
  });

  const maintenant = new Date();
  const nomsMois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  // ✅ FC + USD séparés (plus de mélange × 2800)
  const venteParMois: { mois: string; fc: number; usd: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    const moisLabel = nomsMois[date.getMonth()];

    let montantMoisFC = 0;
    let montantMoisUSD = 0;

    commandesValidees
      .filter((c) => {
        const dc = new Date(c.createdAt);
        return dc.getMonth() === date.getMonth() && dc.getFullYear() === date.getFullYear();
      })
      .forEach((c) => {
        c.items.forEach((item) => {
          const montant = item.prixUnitaire * item.quantite;
          // ✅ CORRIGÉ : produit peut être null
          if (item.produit?.devise === "USD") {
            montantMoisUSD += montant;
          } else {
            montantMoisFC += montant;
          }
        });
      });

    venteParMois.push({ mois: moisLabel, fc: montantMoisFC, usd: montantMoisUSD });
  }

  const ventesParProduit = new Map<string, {
    id: string;
    nom: string;
    photo: string | null;
    quantiteVendue: number;
    chiffreAffaires: number;
    devise: string;
  }>();

  commandesValidees.forEach((c) => {
    c.items.forEach((item) => {
      const p = item.produit;
      // ✅ CORRIGÉ : on skip si le produit a été supprimé
      if (!p) return;

      const existant = ventesParProduit.get(p.id);

      if (existant) {
        existant.quantiteVendue += item.quantite;
        existant.chiffreAffaires += item.prixUnitaire * item.quantite;
      } else {
        ventesParProduit.set(p.id, {
          id: p.id,
          nom: p.nom,
          photo: p.photo1,
          quantiteVendue: item.quantite,
          chiffreAffaires: item.prixUnitaire * item.quantite,
          devise: p.devise,
        });
      }
    });
  });

  const topProduits = Array.from(ventesParProduit.values())
    .sort((a, b) => b.quantiteVendue - a.quantiteVendue)
    .slice(0, 5);

  return (
    <>
      <div style={{
        backgroundColor: "#F5EAD2",
        minHeight: "100vh",
        padding: "16px 14px 100px 14px",
      }}>
        {/* Header vendeur */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}>
          <LogoBoutique nom={vendeur.nomBoutique} taille={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontSize: "18px",
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: "2px",
              letterSpacing: "-0.3px",
            }}>
              Bonjour {session.nom}
            </h1>
            <p style={{ fontSize: "12px", color: "#57534E", fontWeight: "700" }}>
              {vendeur.nomBoutique}
            </p>
          </div>
        </div>

        {!vendeur.actif && (
          <div style={{
            backgroundColor: "white",
            color: "#0F172A",
            padding: "12px 14px",
            borderRadius: "16px",
            marginBottom: "14px",
            border: "1.5px solid #0F172A",
            boxShadow: "4px 4px 0 #EA580C",
          }}>
            <p style={{
              fontWeight: "900",
              fontSize: "12px",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              <Clock size={14} strokeWidth={2.8} color="#EA580C" />
              Boutique en attente de validation
            </p>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "#57534E" }}>
              L&apos;administrateur va vérifier vos informations sous peu.
            </p>
          </div>
        )}

        {/* 4 cartes stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "14px",
        }}>
          {/* Statut */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
            border: "1px solid #D4C5A0",
          }}>
            <div style={{
              backgroundColor: vendeur.actif ? "#DCFCE7" : "#FEF3C7",
              padding: "10px",
              display: "flex",
              justifyContent: "center",
            }}>
              {vendeur.actif ? (
                <CheckCircle size={20} color="#15803D" strokeWidth={2.8} />
              ) : (
                <Clock size={20} color="#B45309" strokeWidth={2.8} />
              )}
            </div>
            <div style={{ padding: "10px 8px 12px 8px", textAlign: "center" }}>
              <p style={{
                fontSize: "10px",
                color: "#57534E",
                marginBottom: "4px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
              }}>
                Statut
              </p>
              <p style={{
                fontSize: "13px",
                fontWeight: "900",
                color: vendeur.actif ? "#15803D" : "#B45309",
                lineHeight: 1.1,
              }}>
                {vendeur.actif ? "Active" : "En attente"}
              </p>
            </div>
          </div>

          {/* Produits */}
          <Link href="/vendeur/produits" style={{
            backgroundColor: "white",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
            border: "1px solid #D4C5A0",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}>
            <div style={{
              backgroundColor: "#DBEAFE",
              padding: "10px",
              display: "flex",
              justifyContent: "center",
            }}>
              <Package size={20} color="#1D4ED8" strokeWidth={2.8} />
            </div>
            <div style={{ padding: "10px 8px 12px 8px", textAlign: "center" }}>
              <p style={{
                fontSize: "10px",
                color: "#57534E",
                marginBottom: "4px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
              }}>
                Produits
              </p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A", lineHeight: 1 }}>
                {nombreProduits}
              </p>
            </div>
          </Link>

          {/* Commandes */}
          <Link href="/vendeur/commandes" style={{
            backgroundColor: "white",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
            border: "1px solid #D4C5A0",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}>
            <div style={{
              backgroundColor: "#FEF3C7",
              padding: "10px",
              display: "flex",
              justifyContent: "center",
            }}>
              <ShoppingCart size={20} color="#B45309" strokeWidth={2.8} />
            </div>
            <div style={{ padding: "10px 8px 12px 8px", textAlign: "center" }}>
              <p style={{
                fontSize: "10px",
                color: "#57534E",
                marginBottom: "4px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
              }}>
                Commandes
              </p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A", lineHeight: 1 }}>
                {nombreCommandes}
              </p>
            </div>
          </Link>

          {/* Stories */}
          <Link href="/vendeur/stories" style={{
            backgroundColor: "white",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
            border: "1px solid #D4C5A0",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}>
            <div style={{
              backgroundColor: "#FCE7F3",
              padding: "10px",
              display: "flex",
              justifyContent: "center",
            }}>
              <Camera size={20} color="#BE185D" strokeWidth={2.8} />
            </div>
            <div style={{ padding: "10px 8px 12px 8px", textAlign: "center" }}>
              <p style={{
                fontSize: "10px",
                color: "#57534E",
                marginBottom: "4px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
              }}>
                Stories
              </p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A", lineHeight: 1 }}>
                {nombreStories}
                <span style={{ fontSize: "13px", color: "#57534E" }}>/10</span>
              </p>
            </div>
          </Link>
        </div>

        <GraphiqueVendeur data={venteParMois} />

        <TopProduits produits={topProduits} />

        <Link href="/vendeur/produits/nouveau" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          backgroundColor: "#0F172A",
          color: "white",
          padding: "16px",
          borderRadius: "26px",
          fontWeight: "900",
          fontSize: "13.5px",
          textDecoration: "none",
          marginBottom: "12px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
          letterSpacing: "-0.2px",
        }}>
          <Plus size={16} strokeWidth={3} />
          Ajouter un produit
        </Link>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}>
          <Link href="/vendeur/boutique" style={{
            backgroundColor: "white",
            color: "#0F172A",
            border: "1.5px solid #0F172A",
            padding: "12px",
            borderRadius: "14px",
            textAlign: "center",
            fontWeight: "900",
            fontSize: "12px",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}>
            <Store size={15} strokeWidth={2.8} />
            Ma boutique
          </Link>

          <Link href="/" style={{
            backgroundColor: "white",
            color: "#0F172A",
            border: "1.5px solid #0F172A",
            padding: "12px",
            borderRadius: "14px",
            textAlign: "center",
            fontWeight: "900",
            fontSize: "12px",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}>
            <Globe size={15} strokeWidth={2.8} />
            Voir le site
          </Link>
        </div>
      </div>

      <NavigationBas />
    </>
  );
                }
