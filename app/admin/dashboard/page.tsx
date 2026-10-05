import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NavigationBas from "./NavigationBas";
import LienVendeur from "./LienVendeur";
import GraphiqueVentes from "./GraphiqueVentes";
import { Store, Clock, CheckCircle, Wallet, Calendar } from "lucide-react";

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
      label: "Boutiques",
      valeur: vendeurs.length,
      Icon: Store,
      bg: "#DBEAFE",
      iconColor: "#1D4ED8",
      badge: `+${actifs.length} actives`,
      badgeColor: "#16A34A",
    },
    {
      label: "En attente",
      valeur: enAttente.length,
      Icon: Clock,
      bg: "#FEF3C7",
      iconColor: "#B45309",
      badge: enAttente.length > 0 ? "À traiter" : null,
      badgeColor: "#B45309",
    },
    {
      label: "Actives",
      valeur: actifs.length,
      Icon: CheckCircle,
      bg: "#DCFCE7",
      iconColor: "#15803D",
      badge: vendeurs.length > 0 ? `${Math.round((actifs.length / vendeurs.length) * 100)}%` : null,
      badgeColor: "#16A34A",
    },
    {
      label: "Chiffre d'affaires",
      valeur: formaterCA(chiffreAffaires),
      Icon: Wallet,
      bg: "#FEF3C7",
      iconColor: "#B45309",
      badge: `${commandes.filter((c) => c.statut !== "ANNULE").length} cmds`,
      badgeColor: "#57534E",
    },
  ];

  const titreSection = {
    fontSize: "12px",
    fontWeight: "900" as const,
    color: "#0F172A",
    marginBottom: "10px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.6px",
  };

  const traitOrange = {
    display: "inline-block",
    width: "3px",
    height: "13px",
    backgroundColor: "#EA580C",
    borderRadius: "2px",
  };

  return (
    <>
      <div style={{
        backgroundColor: "#F5EAD2",
        minHeight: "100vh",
        padding: "16px 12px 90px 12px",
      }}>
        {/* HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "8px",
        }}>
          <div>
            <h1 style={{
              fontSize: "22px",
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: "3px",
              letterSpacing: "-0.4px",
            }}>
              Tableau de bord
            </h1>
            <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700" }}>
              Activité en temps réel
            </p>
          </div>
          <div style={{
            backgroundColor: "white",
            border: "1px solid #D4C5A0",
            borderRadius: "12px",
            padding: "6px 10px",
            fontSize: "10px",
            color: "#0F172A",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <Calendar size={11} strokeWidth={2.8} />
            {dateAujourdhui}
          </div>
        </div>

        {/* STATS */}
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
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #D4C5A0",
                boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
              }}>
                <div style={{
                  backgroundColor: stat.bg,
                  padding: "8px",
                  display: "flex",
                  justifyContent: "center",
                }}>
                  <Icon size={16} color={stat.iconColor} strokeWidth={2.8} />
                </div>
                <div style={{ padding: "8px 6px 10px 6px", textAlign: "center" }}>
                  <p style={{
                    fontSize: "9.5px",
                    color: "#57534E",
                    marginBottom: "3px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    fontSize: "18px",
                    fontWeight: "900",
                    color: "#0F172A",
                    lineHeight: 1,
                    letterSpacing: "-0.3px",
                  }}>
                    {stat.valeur}
                  </p>
                  {stat.badge && (
                    <p style={{
                      fontSize: "9px",
                      color: stat.badgeColor,
                      fontWeight: "900",
                      marginTop: "4px",
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

        {/* BOUTIQUES EN ATTENTE */}
        {enAttente.length > 0 && (
          <>
            <h2 style={titreSection}>
              <span style={traitOrange} />
              Boutiques en attente
              <span style={{
                backgroundColor: "#FEF3C7",
                color: "#B45309",
                fontSize: "10px",
                fontWeight: "900",
                padding: "2px 8px",
                borderRadius: "10px",
                textTransform: "none",
                letterSpacing: "0",
              }}>
                {enAttente.length}
              </span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
              {enAttente.map((v) => (
                <LienVendeur key={v.id} vendeur={formaterVendeur(v)} />
              ))}
            </div>
          </>
        )}

        {/* BOUTIQUES ACTIVES */}
        <h2 style={titreSection}>
          <span style={traitOrange} />
          Boutiques actives ({actifs.length})
        </h2>
        {actifs.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            textAlign: "center",
            padding: "30px 20px",
            borderRadius: "16px",
            border: "1px solid #D4C5A0",
          }}>
            <Store size={26} color="#EA580C" strokeWidth={2} style={{ marginBottom: "6px" }} />
            <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700" }}>
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
