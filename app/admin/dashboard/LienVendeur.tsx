"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoBoutique from "@/app/components/LogoBoutique";

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

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "14px",
      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      borderLeft: `4px solid ${vendeur.actif ? "#16a34a" : "#f97316"}`,
    }}>
      <LogoBoutique nom={vendeur.nomBoutique} taille={50} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: "15px",
          fontWeight: "800",
          color: "#0F172A",
          marginBottom: "4px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {vendeur.nomBoutique}
        </h3>

        <p style={{
          fontSize: "12px",
          color: "#334155",
          fontWeight: "600",
          marginBottom: "2px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          Propriétaire : {vendeur.nomProprietaire || "—"}
        </p>

        <p style={{
          fontSize: "11.5px",
          color: "#64748b",
          fontWeight: "500",
          marginBottom: "4px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {vendeur.description || "Boutique en ligne"}
        </p>

        <p style={{
          fontSize: "11.5px",
          color: "#475569",
          fontWeight: "600",
        }}>
          📞 {vendeur.telephone}
        </p>
      </div>

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
              whiteSpace: "nowrap",
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
              border: "1.5px solid #dc2626",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            ❌ Désactiver
          </button>
        )}

        <a
          href={`/admin/vendeurs/${vendeur.id}/produits`}
          style={{
            backgroundColor: "#F1F5F9",
            color: "#334155",
            padding: "6px 10px",
            borderRadius: "8px",
            textAlign: "center",
            textDecoration: "none",
            fontSize: "11px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >
          Voir
        </a>
      </div>
    </div>
  );
    }
