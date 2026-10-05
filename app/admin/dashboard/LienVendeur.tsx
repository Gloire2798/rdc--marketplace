"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoBoutique from "@/app/components/LogoBoutique";
import { Phone, Package, Check, X, User } from "lucide-react";

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
      borderRadius: "14px",
      padding: "10px",
      boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      border: "1px solid #D4C5A0",
      borderLeft: `3px solid ${vendeur.actif ? "#16A34A" : "#EA580C"}`,
    }}>
      <LogoBoutique nom={vendeur.nomBoutique} taille={44} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: "13.5px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "3px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}>
          {vendeur.nomBoutique}
        </h3>

        <p style={{
          fontSize: "10.5px",
          color: "#57534E",
          fontWeight: "700",
          marginBottom: "3px",
          display: "flex",
          alignItems: "center",
          gap: "3px",
        }}>
          <User size={10} strokeWidth={2.8} />
          {vendeur.nomProprietaire || "—"}
        </p>

        {vendeur.description && (
          <p style={{
            fontSize: "10px",
            color: "#57534E",
            fontWeight: "600",
            marginBottom: "5px",
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
            color: "#0F172A",
            fontWeight: "900",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            textDecoration: "none",
          }}
        >
          <Phone size={11} strokeWidth={2.8} />
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
              backgroundColor: "#0F172A",
              color: "white",
              padding: "8px 12px",
              borderRadius: "20px",
              border: "none",
              fontWeight: "900",
              fontSize: "11px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
              whiteSpace: "nowrap",
              fontFamily: "inherit",
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
              color: "#DC2626",
              padding: "8px 12px",
              borderRadius: "20px",
              border: "1.5px solid #DC2626",
              fontWeight: "900",
              fontSize: "11px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
              whiteSpace: "nowrap",
              fontFamily: "inherit",
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
            backgroundColor: "#F5EAD2",
            color: "#0F172A",
            padding: "6px 10px",
            borderRadius: "20px",
            textAlign: "center",
            textDecoration: "none",
            fontSize: "10.5px",
            fontWeight: "900",
            whiteSpace: "nowrap",
            border: "1px solid #D4C5A0",
          }}
        >
          <Package size={11} strokeWidth={2.8} />
          Voir
        </a>
      </div>
    </div>
  );
            }
