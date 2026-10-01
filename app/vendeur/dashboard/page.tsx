import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoBoutique from "@/app/components/LogoBoutique";
import NavigationBas from "./NavigationBas";
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

  const stats = [
    {
      label: "Statut",
      valeur: vendeur.actif ? "Active" : "En attente",
      Icon: vendeur.actif ? CheckCircle : Clock,
      bg: vendeur.actif ? "#BBF7D0" : "#FED7AA",
      iconColor: vendeur.actif ? "#15803d" : "#c2410c",
      badge: vendeur.actif ? null : "Validation admin",
      badgeColor: "#c2410c",
    },
    {
      label: "Produits",
      valeur: nombreProduits,
      Icon: Package,
      bg: "#DBEAFE",
      iconColor: "#1D4ED8",
      badge: null,
      badgeColor: "#1D4ED8",
    },
    {
      label: "Commandes",
      valeur: nombreCommandes,
      Icon: ShoppingCart,
      bg: "#FEF3C7",
      iconColor: "#c2410c",
      badge: null,
      badgeColor: "#c2410c",
    },
    {
      label: "Stories",
      valeur: `${nombreStories}/10`,
      Icon: Camera,
      bg: "#FCE7F3",
      iconColor: "#BE185D",
      badge: null,
      badgeColor: "#BE185D",
    },
  ];

  return (
    <>
      <div style={{
        backgroundColor: "#F3F4F6",
        minHeight: "100vh",
        padding: "18px 14px 100px 14px",
      }}>
        {/* Header vendeur */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "18px",
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
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "16px",
            border: "1px solid #FDE68A",
          }}>
            <p style={{ fontWeight: "700", fontSize: "12.5px", marginBottom: "3px" }}>
              ⏳ Boutique en attente de validation
            </p>
            <p style={{ fontSize: "11px" }}>
              L&apos;administrateur va vérifier vos informations sous peu.
            </p>
          </div>
        )}

        {/* 4 cartes stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "18px",
        }}>
          {stats.map((stat) => {
            const Icon = stat.Icon;
            return (
              <div key={stat.label} style={{
                backgroundColor: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
                border: "1px solid #F1F5F9",
              }}>
                <div style={{
                  backgroundColor: stat.bg,
                  padding: "8px",
                  display: "flex",
                  justifyContent: "center",
                }}>
                  <Icon size={18} color={stat.iconColor} strokeWidth={2.5} />
                </div>
                <div style={{ padding: "8px 6px 10px 6px", textAlign: "center" }}>
                  <p style={{ fontSize: "10px", color: "#475569", marginBottom: "3px", fontWeight: "700" }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", lineHeight: 1 }}>
                    {stat.valeur}
                  </p>
                  {stat.badge && (
                    <p style={{
                      fontSize: "9px",
                      color: stat.badgeColor,
                      fontWeight: "800",
                      marginTop: "3px",
                    }}>
                      {stat.badge}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
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
          marginBottom: "12px",
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

          <Link href="/vendeur/produits" style={{
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
            <Package size={15} strokeWidth={2.5} />
            Mes produits
          </Link>

          <Link href="/vendeur/commandes" style={{
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
            <ShoppingCart size={15} strokeWidth={2.5} />
            Mes commandes
          </Link>

          <Link href="/vendeur/stories" style={{
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
            <Camera size={15} strokeWidth={2.5} />
            Mes stories
          </Link>
        </div>
      </div>

      <NavigationBas />
    </>
  );
      }
