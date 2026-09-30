"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Vendeur {
  id: string;
  nomBoutique: string;
  description: string | null;
  adresse: string | null;
  telephone: string;
  numMobileMoney: string;
  nomProprietaire: string | null;
  actif: boolean;
  nombreProduits: number;
}

export default function LienVendeur({ vendeur }: { vendeur: Vendeur }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);

  const changerStatut = async (nouveauStatut: boolean) => {
    setChargement(true);
    try {
      const res = await fetch(`/api/admin/vendeurs/${vendeur.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif: nouveauStatut }),
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

  const initiale = vendeur.nomBoutique.charAt(0).toUpperCase();

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "14px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}>
      {/* Logo rond */}
      <div style={{
        width: "46px",
        height: "46px",
        borderRadius: "50%",
        backgroundColor: vendeur.actif ? "#DBEAFE" : "#FED7AA",
        color: vendeur.actif ? "#1E40AF" : "#92400E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        fontWeight: "800",
        flexShrink: 0,
      }}>
        {initiale}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: "15px",
          fontWeight: "700",
          color: "#0F172A",
          marginBottom: "2px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {vendeur.nomBoutique}
        </h3>
        <p style={{
          fontSize: "12px",
          color: "#64748b",
          fontWeight: "500",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {vendeur.description || "Boutique en ligne"}
        </p>
        <p style={{
          fontSize: "11px",
          color: "#94a3b8",
          marginTop: "2px",
          fontWeight: "500",
        }}>
          📦 {vendeur.nombreProduits} produit{vendeur.nombreProduits > 1 ? "s" : ""}
        </p>
      </div>

      {/* Boutons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
        {!vendeur.actif ? (
          <button
            onClick={() => changerStatut(true)}
            disabled={chargement}
            style={{
              backgroundColor: "#16a34a",
              color: "white",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
            }}
          >
            ✅ Valider
          </button>
        ) : (
          <button
            onClick={() => changerStatut(false)}
            disabled={chargement}
            style={{
              backgroundColor: "white",
              color: "#dc2626",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #dc2626",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
            }}
          >
            ❌ Désactiver
          </button>
        )}

        <a
          href={`/admin/vendeurs/${vendeur.id}/produits`}
          style={{
            backgroundColor: "#F1F5F9",
            color: "#475569",
            padding: "6px 10px",
            borderRadius: "8px",
            textAlign: "center",
            textDecoration: "none",
            fontSize: "11px",
            fontWeight: "600",
          }}
        >
          Voir
        </a>
      </div>
    </div>
  );
              }
