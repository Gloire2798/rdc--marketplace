"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Item {
  nom: string;
  quantite: number;
  prixUnitaire: number;
}

interface Commande {
  id: string;
  statut: string;
  total: number;
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

  const formaterPrix = (prix: number) => {
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
    <div className="card" style={{ borderLeft: `4px solid ${couleurBordure()}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        <div>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>
            Commande #{commande.id.slice(0, 8)}
          </p>
          <p style={{ fontSize: "16px", fontWeight: "600", marginTop: "4px" }}>
            👤 {commande.nomClient || "Client"}
          </p>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
            📞 {commande.telephoneClient}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb" }}>
            {formaterPrix(commande.total)}
          </p>
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            {commande.mode === "LIVRAISON" ? "🚚 Livraison" : "🏪 Retrait"}
          </p>
        </div>
      </div>

      {commande.mode === "LIVRAISON" && commande.adresse && (
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
          📍 {commande.adresse}
        </p>
      )}

      <div style={{
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        padding: "10px 12px",
        marginBottom: "12px",
      }}>
        {commande.items.map((item, index) => (
          <div key={index} style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            marginBottom: index < commande.items.length - 1 ? "4px" : "0",
          }}>
            <span>{item.nom} × {item.quantite}</span>
            <span style={{ color: "#6b7280" }}>
              {formaterPrix(item.prixUnitaire * item.quantite)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {commande.statut === "EN_ATTENTE" && (
          <>
            <button
              onClick={() => changerStatut("PAYE")}
              disabled={chargement}
              style={{
                flex: 1,
                minWidth: "120px",
                backgroundColor: "#16a34a",
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                fontSize: "14px",
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
                minWidth: "120px",
                backgroundColor: "#dc2626",
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                fontSize: "14px",
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
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              fontSize: "14px",
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
            padding: "10px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "600",
            fontSize: "14px",
          }}>
            ⏳ En attente du client
          </div>
        )}

        {commande.statut === "RETIRE" && (
          <div style={{
            flex: 1,
            backgroundColor: "#e5e7eb",
            color: "#374151",
            padding: "10px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "600",
            fontSize: "14px",
          }}>
            ✅ Commande terminée
          </div>
        )}

        {commande.statut === "ANNULE" && (
          <div style={{
            flex: 1,
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "10px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "600",
            fontSize: "14px",
          }}>
            ❌ Commande annulée
          </div>
        )}
      </div>
    </div>
  );
        }
