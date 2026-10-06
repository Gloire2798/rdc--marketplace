import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GraphiqueMultiBoutiques from "./GraphiqueMultiBoutiques";
import { Wallet, ShoppingCart, Store } from "lucide-react";

export default async function VentesAdmin() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const vendeurs = await prisma.vendeur.findMany({
    where: { actif: true },
    select: {
      id: true,
      nomBoutique: true,
    },
    orderBy: { nomBoutique: "asc" },
  });

  const commandes = await prisma.commande.findMany({
    where: {
      statut: { in: ["PAYE", "PRET", "RETIRE"] },
    },
    include: {
      items: {
        include: {
          produit: true,
        },
      },
    },
  });

  const maintenant = new Date();
  const nomsMois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  const dataParMois: Record<string, Record<string, number>> = {};

  for (let i = 5; i >= 0; i--) {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    const label = nomsMois[date.getMonth()];
    dataParMois[label] = {};
  }

  // ✅ Graphique uniquement FC (pas de mélange)
  commandes.forEach((c) => {
    const dateCommande = new Date(c.createdAt);
    const moisLabel = nomsMois[dateCommande.getMonth()];

    if (!dataParMois[moisLabel]) return;

    let montantFC = 0;
    c.items.forEach((item) => {
      // ✅ CORRIGÉ : produit peut être null
      if (item.produit?.devise !== "USD") {
        montantFC += item.prixUnitaire * item.quantite;
      }
    });

    if (montantFC === 0) return;

    const boutique = vendeurs.find((v) => v.id === c.vendeurId);
    if (!boutique) return;

    const nomBoutique = boutique.nomBoutique;

    if (!dataParMois[moisLabel][nomBoutique]) {
      dataParMois[moisLabel][nomBoutique] = 0;
    }
    dataParMois[moisLabel][nomBoutique] += montantFC;
  });

  const donnees = Object.entries(dataParMois).map(([mois, valeurs]) => ({
    mois,
    ...valeurs,
  }));

  const boutiques = vendeurs.map((v) => v.nomBoutique);

  // ✅ CA total séparé FC / USD
  let caTotalFC = 0;
  let caTotalUSD = 0;
  const nbCommandes = commandes.length;

  commandes.forEach((c) => {
    c.items.forEach((item) => {
      const montant = item.prixUnitaire * item.quantite;
      // ✅ CORRIGÉ : produit peut être null
      if (item.produit?.devise === "USD") {
        caTotalUSD += montant;
      } else {
        caTotalFC += montant;
      }
    });
  });

  const formaterCA = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M FC`;
    }
    if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}k FC`;
    }
    return `${montant.toLocaleString("fr-FR")} FC`;
  };

  return (
    <div style={{
      padding: "16px 12px 100px 12px",
      backgroundColor: "#F5EAD2",
      minHeight: "100vh",
    }}>
      {/* En-tête */}
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "3px",
          letterSpacing: "-0.4px",
        }}>
          Ventes par boutique
        </h1>
        <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700" }}>
          Évolution des ventes en temps réel
        </p>
      </div>

      {/* Stats globales */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
        marginBottom: "14px",
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "12px",
          border: "1px solid #D4C5A0",
          boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
        }}>
          <p style={{
            fontSize: "9.5px",
            color: "#57534E",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <Wallet size={11} strokeWidth={2.8} color="#EA580C" />
            CA Total
          </p>
          {caTotalFC > 0 && (
            <p style={{
              fontSize: "16px",
              fontWeight: "900",
              color: "#EA580C",
              lineHeight: 1.2,
              letterSpacing: "-0.3px",
            }}>
              {formaterCA(caTotalFC)}
            </p>
          )}
          {caTotalUSD > 0 && (
            <p style={{
              fontSize: "14px",
              fontWeight: "900",
              color: "#16A34A",
              lineHeight: 1.2,
              letterSpacing: "-0.3px",
            }}>
              {caTotalUSD.toFixed(2)} $
            </p>
          )}
          {caTotalFC === 0 && caTotalUSD === 0 && (
            <p style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A" }}>
              0 FC
            </p>
          )}
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "12px",
          border: "1px solid #D4C5A0",
          boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
        }}>
          <p style={{
            fontSize: "9.5px",
            color: "#57534E",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <ShoppingCart size={11} strokeWidth={2.8} color="#16A34A" />
            Commandes
          </p>
          <p style={{
            fontSize: "16px",
            fontWeight: "900",
            color: "#16A34A",
            lineHeight: 1.2,
          }}>
            {nbCommandes}
          </p>
        </div>
      </div>

      {/* Graphique multi-boutiques */}
      <GraphiqueMultiBoutiques
        donnees={donnees}
        boutiques={boutiques}
      />

      {/* Détail par boutique */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "16px",
        border: "1px solid #D4C5A0",
        marginTop: "14px",
        boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
      }}>
        <p style={{
          fontSize: "12px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{
            display: "inline-block",
            width: "3px",
            height: "13px",
            backgroundColor: "#EA580C",
            borderRadius: "2px",
          }} />
          <Store size={14} strokeWidth={2.8} color="#EA580C" />
          Détail par boutique ({vendeurs.length})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {vendeurs.map((v) => {
            let caBoutiqueFC = 0;
            let caBoutiqueUSD = 0;

            commandes
              .filter((c) => c.vendeurId === v.id)
              .forEach((c) => {
                c.items.forEach((item) => {
                  const montant = item.prixUnitaire * item.quantite;
                  // ✅ CORRIGÉ : produit peut être null
                  if (item.produit?.devise === "USD") {
                    caBoutiqueUSD += montant;
                  } else {
                    caBoutiqueFC += montant;
                  }
                });
              });

            return (
              <div key={v.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                backgroundColor: "#F5EAD2",
                borderRadius: "12px",
                border: "1px solid #D4C5A0",
                gap: "8px",
              }}>
                <span style={{
                  fontWeight: "900",
                  color: "#0F172A",
                  fontSize: "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}>
                  {v.nomBoutique}
                </span>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {caBoutiqueFC > 0 && (
                    <p style={{
                      fontWeight: "900",
                      color: "#EA580C",
                      fontSize: "12px",
                      lineHeight: 1.2,
                    }}>
                      {formaterCA(caBoutiqueFC)}
                    </p>
                  )}
                  {caBoutiqueUSD > 0 && (
                    <p style={{
                      fontWeight: "900",
                      color: "#16A34A",
                      fontSize: "11px",
                      lineHeight: 1.2,
                    }}>
                      {caBoutiqueUSD.toFixed(2)} $
                    </p>
                  )}
                  {caBoutiqueFC === 0 && caBoutiqueUSD === 0 && (
                    <p style={{
                      fontWeight: "900",
                      color: "#94A3B8",
                      fontSize: "12px",
                    }}>
                      0 FC
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
                }
