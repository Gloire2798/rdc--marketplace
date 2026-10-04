"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Item {
  nom: string;
  quantite: number;
  prixUnitaire: number;
  devise: string;
}

interface Commande {
  id: string;
  statut: string;
  totalFC: number;
  totalUSD: number;
  mode: string;
  adresse: string | null;
  createdAt: string;
  nomClient: string | null;
  telephoneClient: string;
  items: Item[];
}

export default function CarteCommande({ commande }: { commande: Commande }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") {
      return `${prix.toFixed(2)} $`;
    }
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  const changerStatut = async (nouveauStatut: string) => {
    setChargement(true);
    try {
      const res = await fetch(`/api/vendeur/commandes/${commande.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: nouveauStatut }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch {
      alert("Erreur réseau");
    }
    setChargement(false);
  };

  const couleurBordure = () => {
    if (commande.statut === "EN_ATTENTE") return "#d97706";
    if (commande.statut === "PAYE" || commande.statut === "PRET") return "#2563eb";
    if (commande.statut === "RETIRE") return "#16a34a";
    return "#9ca3af";
  };

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "10px",
      padding: "10px 12px",
      borderLeft: `3px solid ${couleurBordure()}`,
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
    }}>
      {/* En-tête compact */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px", marginBottom: "8px" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700", marginBottom: "1px" }}>
            #{commande.id.slice(0, 8)}
          </p>
          <p style={{ fontSize: "12.5px", fontWeight: "800", color: "#0F172A", marginBottom: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            👤 {commande.nomClient || "Client"}
          </p>
          <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>
            📞 {commande.telephoneClient}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {commande.totalUSD > 0 && (
            <p style={{ fontSize: "13.5px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.15 }}>
              {formaterPrix(commande.totalUSD, "USD")}
            </p>
          )}
          {commande.totalFC > 0 && (
            <p style={{ fontSize: "13.5px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.15 }}>
              {formaterPrix(commande.totalFC, "FC")}
            </p>
          )}
          <p style={{ fontSize: "9.5px", color: "#64748b", fontWeight: "700", marginTop: "2px" }}>
            {commande.mode === "LIVRAISON" ? "🚚 Livraison" : "🏪 Retrait"}
          </p>
        </div>
      </div>

      {commande.mode === "LIVRAISON" && commande.adresse && (
        <p style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600", marginBottom: "6px" }}>
          📍 {commande.adresse}
        </p>
      )}

      {/* Articles compacts */}
      <div style={{
        backgroundColor: "#F8FAFC",
        borderRadius: "7px",
        padding: "6px 8px",
        marginBottom: "8px",
      }}>
        {commande.items.map((item, index) => (
          <div key={index} style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            marginBottom: index < commande.items.length - 1 ? "2px" : "0",
            gap: "6px",
          }}>
            <span style={{ color: "#334155", fontWeight: "600", minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.nom} × {item.quantite}
            </span>
            <span style={{ color: "#64748b", fontWeight: "700", flexShrink: 0 }}>
              {formaterPrix(item.prixUnitaire * item.quantite, item.devise)}
            </span>
          </div>
        ))}
      </div>

      {/* Boutons compacts */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {commande.statut === "EN_ATTENTE" && (
          <>
            <button
              onClick={() => changerStatut("PAYE")}
              disabled={chargement}
              style={{
                flex: 1,
                minWidth: "90px",
                backgroundColor: "#16a34a",
                color: "white",
                padding: "7px",
                borderRadius: "7px",
                border: "none",
                fontWeight: "800",
                fontSize: "11px",
                cursor: "pointer",
                opacity: chargement ? 0.6 : 1,
              }}
            >
              ✅ Valider
            </button>
            <button
              onClick={() => changerStatut("ANNULE")}
              disabled={chargement}
              style={{
                flex: 1,
                minWidth: "90px",
                backgroundColor: "#dc2626",
                color: "white",
                padding: "7px",
                borderRadius: "7px",
                border: "none",
                fontWeight: "800",
                fontSize: "11px",
                cursor: "pointer",
                opacity: chargement ? 0.6 : 1,
              }}
            >
              ❌ Refuser
            </button>
          </>
        )}

        {commande.statut === "PAYE" && (
          <button
            onClick={() => changerStatut("PRET")}
            disabled={chargement}
            style={{
              flex: 1,
              backgroundColor: "#2563eb",
              color: "white",
              padding: "7px",
              borderRadius: "7px",
              border: "none",
              fontWeight: "800",
              fontSize: "11px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
            }}
          >
            📦 Marquer comme prêt
          </button>
        )}

        {commande.statut === "PRET" && (
          <div style={{
            flex: 1,
            backgroundColor: "#dcfce7",
            color: "#166534",
            padding: "7px",
            borderRadius: "7px",
            textAlign: "center",
            fontWeight: "800",
            fontSize: "11px",
          }}>
            ⏳ En attente du client
          </div>
        )}

        {commande.statut === "RETIRE" && (
          <div style={{
            flex: 1,
            backgroundColor: "#e5e7eb",
            color: "#374151",
            padding: "7px",
            borderRadius: "7px",
            textAlign: "center",
            fontWeight: "800",
            fontSize: "11px",
          }}>
            ✅ Commande terminée
          </div>
        )}

        {commande.statut === "ANNULE" && (
          <div style={{
            flex: 1,
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "7px",
            borderRadius: "7px",
            textAlign: "center",
            fontWeight: "800",
            fontSize: "11px",
          }}>
            ❌ Commande annulée
          </div>
        )}
      </div>
    </div>
  );
      }
