import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NavigationBas from "./NavigationBas";
import LienVendeur from "./LienVendeur";
import GraphiqueVentes from "./GraphiqueVentes";
import { Store, Clock, CheckCircle, Wallet } from "lucide-react";

export default async function DashboardAdmin() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const vendeurs = await prisma.vendeur.findMany({
    include: {
      user: true,
      _count: { select: { produits: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const commandes = await prisma.commande.findMany({
    include: {
      items: { include: { produit: true } },
    },
  });

  const enAttente = vendeurs.filter((v) => !v.actif);
  const actifs = vendeurs.filter((v) => v.actif);

  const chiffreAffaires = commandes
    .filter((c) => c.statut !== "ANNULE")
    .reduce((acc, c) => {
      const devise = c.items[0]?.produit.devise || "FC";
      if (devise === "FC") return acc + c.total;
      return acc + c.total * 2800;
    }, 0);

  const formaterCA = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M FC`;
    }
    if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}k FC`;
    }
    return `${montant.toLocaleString("fr-FR")} FC`;
  };

  const maintenant = new Date();
  const venteParMois: { mois: string; montant: number }[] = [];
  const nomsMois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    const moisLabel = nomsMois[date.getMonth()];

    const montantMois = commandes
      .filter((c) => {
        if (c.statut === "ANNULE") return false;
        const dc = new Date(c.createdAt);
        return dc.getMonth() === date.getMonth() && dc.getFullYear() === date.getFullYear();
      })
      .reduce((acc, c) => {
        const devise = c.items[0]?.produit.devise || "FC";
        if (devise === "FC") return acc + c.total;
        return acc + c.total * 2800;
      }, 0);

    venteParMois.push({ mois: moisLabel, montant: montantMois });
  }

  const formaterVendeur = (v: typeof vendeurs[0]) => ({
    id: v.id,
    nomBoutique: v.nomBoutique,
    description: v.description,
    adresse: v.adresse,
    telephone: v.telephone,
    numMobileMoney: v.numMobileMoney,
    nomProprietaire: v.user.nom,
    actif: v.actif,
    nombreProduits: v._count.produits,
  });

  const dateAujourdhui = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const stats = [
    {
      label: "Total boutiques",
      valeur: vendeurs.length,
      Icon: Store,
      bg: "#DBEAFE",
      iconColor: "#1D4ED8",
      badge: `+${actifs.length} actives`,
      badgeColor: "#16a34a",
    },
    {
      label: "En attente",
      valeur: enAttente.length,
      Icon: Clock,
      bg: "#FED7AA",
      iconColor: "#c2410c",
      badge: enAttente.length > 0 ? "À traiter" : null,
      badgeColor: "#c2410c",
    },
    {
      label: "Boutiques actives",
      valeur: actifs.length,
      Icon: CheckCircle,
      bg: "#BBF7D0",
      iconColor: "#15803d",
      badge: vendeurs.length > 0 ? `${Math.round((actifs.length / vendeurs.length) * 100)}% du total` : null,
      badgeColor: "#16a34a",
    },
    {
      label: "Chiffre d'affaires",
      valeur: formaterCA(chiffreAffaires),
      Icon: Wallet,
      bg: "#DBEAFE",
      iconColor: "#1D4ED8",
      badge: `${commandes.filter((c) => c.statut !== "ANNULE").length} commandes`,
      badgeColor: "#334155",
    },
  ];

  return (
    <>
      <div style={{
        backgroundColor: "#F1F5F9",
        minHeight: "100vh",
        padding: "16px 12px 90px 12px",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "8px",
        }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginBottom: "2px", letterSpacing: "-0.3px" }}>
              Tableau de bord
            </h1>
            <p style={{ fontSize: "11px", color: "#475569", fontWeight: "600" }}>
              Voici l&apos;activité en temps réel
            </p>
          </div>
          <div style={{
            backgroundColor: "white",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
            padding: "5px 9px",
            fontSize: "10px",
            color: "#0F172A",
            fontWeight: "700",
          }}>
            📅 {dateAujourdhui}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "16px",
        }}>
          {stats.map((stat) => {
            const Icon = stat.Icon;
            return (
              <div key={stat.label} style={{
                backgroundColor: "white",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                border: "1px solid #F1F5F9",
              }}>
                <div style={{
                  backgroundColor: stat.bg,
                  padding: "6px",
                  display: "flex",
                  justifyContent: "center",
                }}>
                  <Icon size={14} color={stat.iconColor} strokeWidth={2.5} />
                </div>
                <div style={{ padding: "6px 4px 8px 4px", textAlign: "center" }}>
                  <p style={{ fontSize: "9.5px", color: "#475569", marginBottom: "2px", fontWeight: "700" }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", lineHeight: 1 }}>
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

        <GraphiqueVentes data={venteParMois} />

        {enAttente.length > 0 && (
          <>
            <h2 style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#0F172A",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              Boutiques en attente
              <span style={{
                backgroundColor: "#FED7AA",
                color: "#7c2d12",
                fontSize: "10px",
                fontWeight: "800",
                padding: "2px 7px",
                borderRadius: "10px",
              }}>
                {enAttente.length}
              </span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px" }}>
              {enAttente.map((v) => (
                <LienVendeur key={v.id} vendeur={formaterVendeur(v)} />
              ))}
            </div>
          </>
        )}

        <h2 style={{
          fontSize: "14px",
          fontWeight: "800",
          color: "#0F172A",
          marginBottom: "8px",
        }}>
          Boutiques actives
        </h2>
        {actifs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "26px 20px" }}>
            <Store size={28} color="#94a3b8" strokeWidth={1.5} style={{ marginBottom: "6px" }} />
            <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
              Aucune boutique active.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {actifs.map((v) => (
              <LienVendeur key={v.id} vendeur={formaterVendeur(v)} />
            ))}
          </div>
        )}
      </div>

      <NavigationBas />
    </>
  );
              }
