import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoBoutique from "@/app/components/LogoBoutique";
import NavigationBas from "./NavigationBas";
import MenuBurger from "./menu-burger";
import GraphiqueVendeur from "./GraphiqueVendeur";
import TopProduits from "./TopProduits";
import { Plus, Store, Camera, Package, ShoppingCart, CheckCircle, Clock } from "lucide-react";

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
  const venteParMois: { mois: string; montant: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    const moisLabel = nomsMois[date.getMonth()];

    const montantMois = commandesValidees
      .filter((c) => {
        const dc = new Date(c.createdAt);
        return dc.getMonth() === date.getMonth() && dc.getFullYear() === date.getFullYear();
      })
      .reduce((acc, c) => {
        return acc + c.items.reduce((sum, item) => {
          const devise = item.produit.devise;
          const montant = item.prixUnitaire * item.quantite;
          if (devise === "USD") return sum + montant * 2800;
          return sum + montant;
        }, 0);
      }, 0);

    venteParMois.push({ mois: moisLabel, montant: montantMois });
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
      {/* Barre supérieure avec le menu burger */}
      <div style={{
        backgroundColor: "#F3F4F6",
        padding: "12px 14px 0 14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <MenuBurger />
        <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A" }}>
          Espace vendeur
        </p>
      </div>

      <div style={{
        backgroundColor: "#F3F4F6",
        minHeight: "100vh",
        padding: "12px 14px 100px 14px",
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
              fontSize: "17px",
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: "2px",
              letterSpacing: "-0.3px",
            }}>
              Bonjour {session.nom}
            </h1>
            <p style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
              {vendeur.nomBoutique}
            </p>
          </div>
        </div>

        {!vendeur.actif && (
          <div style={{
            backgroundColor: "#FEF3C7",
            color: "#78350F",
            padding: "10px 12px",
            borderRadius: "10px",
            marginBottom: "14px",
            border: "1px solid #FDE68A",
          }}>
            <p style={{ fontWeight: "800", fontSize: "12px", marginBottom: "2px" }}>
              ⏳ Boutique en attente de validation
            </p>
            <p style={{ fontSize: "10.5px", fontWeight: "500" }}>
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
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
            border: "1px solid #F1F5F9",
          }}>
            <div style={{
              backgroundColor: vendeur.actif ? "#BBF7D0" : "#FED7AA",
              padding: "8px",
              display: "flex",
              justifyContent: "center",
            }}>
              {vendeur.actif ? (
                <CheckCircle size={18} color="#15803d" strokeWidth={2.5} />
              ) : (
                <Clock size={18} color="#c2410c" strokeWidth={2.5} />
              )}
            </div>
            <div style={{ padding: "8px 6px 10px 6px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "#475569", marginBottom: "3px", fontWeight: "700" }}>
                Statut
              </p>
              <p style={{
                fontSize: "13px",
                fontWeight: "900",
                color: vendeur.actif ? "#15803d" : "#c2410c",
                lineHeight: 1.1,
              }}>
                {vendeur.actif ? "Active" : "En attente"}
              </p>
            </div>
          </div>

          {/* Produits */}
          <Link href="/vendeur/produits" style={{
            backgroundColor: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
            border: "1px solid #F1F5F9",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}>
            <div style={{
              backgroundColor: "#DBEAFE",
              padding: "8px",
              display: "flex",
              justifyContent: "center",
            }}>
              <Package size={18} color="#1D4ED8" strokeWidth={2.5} />
            </div>
            <div style={{ padding: "8px 6px 10px 6px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "#475569", marginBottom: "3px", fontWeight: "700" }}>
                Produits
              </p>
              <p style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", lineHeight: 1 }}>
                {nombreProduits}
              </p>
            </div>
          </Link>

          {/* Commandes */}
          <Link href="/vendeur/commandes" style={{
            backgroundColor: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
            border: "1px solid #F1F5F9",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}>
            <div style={{
              backgroundColor: "#FEF3C7",
              padding: "8px",
              display: "flex",
              justifyContent: "center",
            }}>
              <ShoppingCart size={18} color="#c2410c" strokeWidth={2.5} />
            </div>
            <div style={{ padding: "8px 6px 10px 6px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "#475569", marginBottom: "3px", fontWeight: "700" }}>
                Commandes
              </p>
              <p style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", lineHeight: 1 }}>
                {nombreCommandes}
              </p>
            </div>
          </Link>

          {/* Stories */}
          <Link href="/vendeur/stories" style={{
            backgroundColor: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
            border: "1px solid #F1F5F9",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}>
            <div style={{
              backgroundColor: "#FCE7F3",
              padding: "8px",
              display: "flex",
              justifyContent: "center",
            }}>
              <Camera size={18} color="#BE185D" strokeWidth={2.5} />
            </div>
            <div style={{ padding: "8px 6px 10px 6px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "#475569", marginBottom: "3px", fontWeight: "700" }}>
                Stories
              </p>
              <p style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", lineHeight: 1 }}>
                {nombreStories}<span style={{ fontSize: "12px", color: "#94a3b8" }}>/10</span>
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
          backgroundColor: "#1D4ED8",
          color: "white",
          padding: "13px",
          borderRadius: "12px",
          fontWeight: "800",
          fontSize: "13px",
          textDecoration: "none",
          marginBottom: "10px",
          boxShadow: "0 2px 8px rgba(29, 78, 216, 0.2)",
        }}>
          <Plus size={16} strokeWidth={2.8} />
          Ajouter un produit
        </Link>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}>
          <Link href="/vendeur/boutique" style={{
            backgroundColor: "white",
            color: "#1D4ED8",
            border: "1.5px solid #E8DFC8",
            padding: "12px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "12px",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}>
            <Store size={15} strokeWidth={2.5} />
            Ma boutique
          </Link>

          <Link href="/" style={{
            backgroundColor: "white",
            color: "#1D4ED8",
            border: "1.5px solid #E8DFC8",
            padding: "12px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "12px",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}>
            🌐 Voir le site
          </Link>
        </div>
      </div>

      <NavigationBas />
    </>
  );
                   }
