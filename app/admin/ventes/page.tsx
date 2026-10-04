import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GraphiqueMultiBoutiques from "./GraphiqueMultiBoutiques";

export default async function VentesAdmin() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  // Récupérer toutes les boutiques actives
  const vendeurs = await prisma.vendeur.findMany({
    where: { actif: true },
    select: {
      id: true,
      nomBoutique: true,
    },
    orderBy: { nomBoutique: "asc" },
  });

  // Récupérer toutes les commandes validées (pas annulées)
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

  // Construire les données pour les 6 derniers mois
  const maintenant = new Date();
  const nomsMois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  // Structure : { mois: "Jan", "Boutique A": 50000, "Boutique B": 30000 }
  const dataParMois: Record<string, Record<string, number>> = {};

  for (let i = 5; i >= 0; i--) {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    const label = nomsMois[date.getMonth()];
    dataParMois[label] = {};
  }

  // Remplir les données
  commandes.forEach((c) => {
    const dateCommande = new Date(c.createdAt);
    const moisLabel = nomsMois[dateCommande.getMonth()];

    // Vérifier que le mois est dans les 6 derniers
    if (!dataParMois[moisLabel]) return;

    // Calculer le montant total en FC (convertir USD si besoin)
    let montantFC = 0;
    c.items.forEach((item) => {
      const montant = item.prixUnitaire * item.quantite;
      if (item.produit.devise === "USD") {
        montantFC += montant * 2800; // taux approximatif
      } else {
        montantFC += montant;
      }
    });

    // Récupérer le nom de la boutique
    const boutique = vendeurs.find((v) => v.id === c.vendeurId);
    if (!boutique) return;

    const nomBoutique = boutique.nomBoutique;

    if (!dataParMois[moisLabel][nomBoutique]) {
      dataParMois[moisLabel][nomBoutique] = 0;
    }
    dataParMois[moisLabel][nomBoutique] += montantFC;
  });

  // Transformer en tableau pour Recharts
  const donnees = Object.entries(dataParMois).map(([mois, valeurs]) => ({
    mois,
    ...valeurs,
  }));

  // Liste des noms de boutiques pour les lignes
  const boutiques = vendeurs.map((v) => v.nomBoutique);

  // Stats globales
  let caTotal = 0;
  let nbCommandes = commandes.length;
  commandes.forEach((c) => {
    c.items.forEach((item) => {
      const montant = item.prixUnitaire * item.quantite;
      if (item.produit.devise === "USD") {
        caTotal += montant * 2800;
      } else {
        caTotal += montant;
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
      padding: "16px 14px 100px 14px",
      backgroundColor: "#F1F5F9",
      minHeight: "100vh",
    }}>
      {/* En-tête */}
      <div style={{ marginBottom: "14px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", marginBottom: "2px" }}>
          Ventes par boutique
        </h1>
        <p style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>
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
          borderRadius: "10px",
          padding: "10px 12px",
          border: "1px solid #E2E8F0",
        }}>
          <p style={{ fontSize: "9.5px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "3px" }}>
            💰 CA Total
          </p>
          <p style={{ fontSize: "16px", fontWeight: "900", color: "#1D4ED8" }}>
            {formaterCA(caTotal)}
          </p>
        </div>
        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "10px 12px",
          border: "1px solid #E2E8F0",
        }}>
          <p style={{ fontSize: "9.5px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "3px" }}>
            🛒 Commandes
          </p>
          <p style={{ fontSize: "16px", fontWeight: "900", color: "#16a34a" }}>
            {nbCommandes}
          </p>
        </div>
      </div>

      {/* Graphique multi-boutiques */}
      <GraphiqueMultiBoutiques
        donnees={donnees}
        boutiques={boutiques}
      />

      {/* Liste des boutiques */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "14px",
        border: "1px solid #E2E8F0",
        marginTop: "14px",
      }}>
        <p style={{ fontSize: "12px", fontWeight: "800", color: "#0F172A", marginBottom: "10px" }}>
          🏪 Boutiques suivies ({vendeurs.length})
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {vendeurs.map((v) => {
            let caBoutique = 0;
            commandes
              .filter((c) => c.vendeurId === v.id)
              .forEach((c) => {
                c.items.forEach((item) => {
                  const montant = item.prixUnitaire * item.quantite;
                  if (item.produit.devise === "USD") {
                    caBoutique += montant * 2800;
                  } else {
                    caBoutique += montant;
                  }
                });
              });

            return (
              <div key={v.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                backgroundColor: "#F8FAFC",
                borderRadius: "8px",
                fontSize: "11.5px",
              }}>
                <span style={{ fontWeight: "700", color: "#334155" }}>
                  {v.nomBoutique}
                </span>
                <span style={{ fontWeight: "800", color: "#1D4ED8" }}>
                  {formaterCA(caBoutique)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
