"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoBoutique from "@/app/components/LogoBoutique";
import { Phone, Package, Check, X } from "lucide-react";

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
      padding: "12px",
      boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      borderLeft: `3px solid ${vendeur.actif ? "#16a34a" : "#f97316"}`,
    }}>
      <LogoBoutique nom={vendeur.nomBoutique} taille={44} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#0F172A",
          marginBottom: "3px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
        }}>
          {vendeur.nomBoutique}
        </h3>

        <p style={{
          fontSize: "11px",
          color: "#334155",
          fontWeight: "600",
          marginBottom: "2px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          lineHeight: 1.3,
        }}>
          Propriétaire : {vendeur.nomProprietaire || "—"}
        </p>

        {vendeur.description && (
          <p style={{
            fontSize: "10.5px",
            color: "#64748b",
            fontWeight: "500",
            marginBottom: "4px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.3,
          }}>
            {vendeur.description}
          </p>
        )}

        <a
          href={`tel:${vendeur.telephone}`}
          style={{
            fontSize: "10.5px",
            color: "#1D4ED8",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            textDecoration: "none",
          }}
        >
          <Phone size={11} strokeWidth={2.5} />
          Appeler
        </a>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px", flexShrink: 0 }}>
        {!vendeur.actif ? (
          <button
            onClick={() => changerStatut(true)}
            disabled={chargement}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              backgroundColor: "#1D4ED8",
              color: "white",
              padding: "7px 12px",
              borderRadius: "7px",
              border: "none",
              fontWeight: "700",
              fontSize: "11px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            <Check size={12} strokeWidth={3} />
            Valider
          </button>
        ) : (
          <button
            onClick={() => changerStatut(false)}
            disabled={chargement}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              backgroundColor: "white",
              color: "#475569",
              padding: "7px 12px",
              borderRadius: "7px",
              border: "1px solid #cbd5e1",
              fontWeight: "700",
              fontSize: "11px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            <X size={12} strokeWidth={3} />
            Désactiver
          </button>
        )}

        <a
          href={`/admin/vendeurs/${vendeur.id}/produits`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            backgroundColor: "#F1F5F9",
            color: "#334155",
            padding: "5px 10px",
            borderRadius: "7px",
            textAlign: "center",
            textDecoration: "none",
            fontSize: "10.5px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >
          <Package size={11} strokeWidth={2.5} />
          Voir
        </a>
      </div>
    </div>
  );
}
