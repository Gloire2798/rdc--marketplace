"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="card" style={{
      borderLeft: `4px solid ${vendeur.actif ? "#16a34a" : "#d97706"}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
            {vendeur.nomBoutique}
          </h3>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
            Par : {vendeur.nomProprietaire || "Non renseigné"}
          </p>
          {vendeur.description && (
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>{vendeur.description}</p>
          )}
          <div style={{ fontSize: "13px", color: "#4b5563", display: "flex", flexDirection: "column", gap: "2px" }}>
            <span>📞 {vendeur.telephone}</span>
            {vendeur.adresse && <span>📍 {vendeur.adresse}</span>}
            <span>💰 Mobile Money : {vendeur.numMobileMoney}</span>
            <span>📦 {vendeur.nombreProduits} produit{vendeur.nombreProduits > 1 ? "s" : ""} en ligne</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexDirection: "column", minWidth: "160px" }}>
          {!vendeur.actif ? (
            <button
              onClick={() => changerStatut(true)}
              disabled={chargement}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
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
                backgroundColor: "#dc2626",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                opacity: chargement ? 0.6 : 1,
              }}
            >
              ❌ Désactiver
            </button>
          )}

          <Link
            href={`/admin/vendeurs/${vendeur.id}/produits`}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              textAlign: "center",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            📦 Voir les produits
          </Link>
        </div>
      </div>
    </div>
  );
}
