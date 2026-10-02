"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  vendeurId: string;
  nomBoutique: string;
}

type Action = "restaurer" | "supprimer" | null;

export default function BoutonRestaurer({ vendeurId, nomBoutique }: Props) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [action, setAction] = useState<Action>(null);

  const executer = async (type: Action) => {
    if (!type) return;
    setChargement(true);

    try {
      if (type === "restaurer") {
        const res = await fetch(`/api/admin/vendeurs/${vendeurId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actif: true }),
        });

        if (res.ok) {
          router.refresh();
        } else {
          alert("Erreur lors de la restauration");
        }
      } else if (type === "supprimer") {
        const res = await fetch(`/api/admin/vendeurs/${vendeurId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          router.refresh();
        } else {
          alert("Erreur lors de la suppression");
        }
      }
    } catch {
      alert("Erreur réseau");
    }

    setChargement(false);
    setAction(null);
  };

  if (!action) {
    return (
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={() => setAction("restaurer")}
          style={{
            flex: 1,
            padding: "9px",
            borderRadius: "8px",
            backgroundColor: "#DCFCE7",
            color: "#15803D",
            border: "1px solid #BBF7D0",
            fontWeight: "800",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          ♻️ Restaurer
        </button>

        <button
          onClick={() => setAction("supprimer")}
          style={{
            flex: 1,
            padding: "9px",
            borderRadius: "8px",
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            border: "1px solid #FECACA",
            fontWeight: "800",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          🗑️ Supprimer
        </button>
      </div>
    );
  }

  if (action === "restaurer") {
    return (
      <div
        style={{
          backgroundColor: "#DCFCE7",
          border: "1px solid #BBF7D0",
          borderRadius: "8px",
          padding: "10px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#166534",
            marginBottom: "8px",
          }}
        >
          Restaurer <strong>{nomBoutique}</strong> ?
        </p>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => executer("restaurer")}
            disabled={chargement}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              fontWeight: "800",
              fontSize: "11px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
            }}
          >
            {chargement ? "..." : "✅ Oui, restaurer"}
          </button>
          <button
            onClick={() => setAction(null)}
            disabled={chargement}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              backgroundColor: "white",
              color: "#64748b",
              border: "1px solid #E2E8F0",
              fontWeight: "700",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#FEE2E2",
        border: "2px solid #DC2626",
        borderRadius: "8px",
        padding: "10px",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          fontWeight: "900",
          color: "#991B1B",
          marginBottom: "4px",
        }}
      >
        ⚠️ Supprimer définitivement ?
      </p>
      <p
        style={{
          fontSize: "10.5px",
          fontWeight: "600",
          color: "#7F1D1D",
          marginBottom: "8px",
          lineHeight: 1.4,
        }}
      >
        <strong>{nomBoutique}</strong> sera supprimée avec ses produits, commandes et données.
        <br />
        <strong>Cette action est irréversible.</strong>
      </p>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={() => executer("supprimer")}
          disabled={chargement}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            backgroundColor: "#DC2626",
            color: "white",
            border: "none",
            fontWeight: "800",
            fontSize: "11px",
            cursor: "pointer",
            opacity: chargement ? 0.6 : 1,
          }}
        >
          {chargement ? "..." : "🗑️ Oui, supprimer"}
        </button>
        <button
          onClick={() => setAction(null)}
          disabled={chargement}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            backgroundColor: "white",
            color: "#64748b",
            border: "1px solid #E2E8F0",
            fontWeight: "700",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
