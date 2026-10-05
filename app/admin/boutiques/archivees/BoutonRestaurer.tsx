"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, AlertTriangle } from "lucide-react";

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
            padding: "10px",
            borderRadius: "20px",
            backgroundColor: "white",
            color: "#16A34A",
            border: "1.5px solid #16A34A",
            fontWeight: "900",
            fontSize: "11px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            fontFamily: "inherit",
          }}
        >
          <RotateCcw size={12} strokeWidth={3} />
          Restaurer
        </button>

        <button
          onClick={() => setAction("supprimer")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            backgroundColor: "white",
            color: "#DC2626",
            border: "1.5px solid #DC2626",
            fontWeight: "900",
            fontSize: "11px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            fontFamily: "inherit",
          }}
        >
          <Trash2 size={12} strokeWidth={3} />
          Supprimer
        </button>
      </div>
    );
  }

  if (action === "restaurer") {
    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1.5px solid #16A34A",
          borderRadius: "14px",
          padding: "12px",
          boxShadow: "3px 3px 0 #16A34A",
        }}
      >
        <p
          style={{
            fontSize: "11.5px",
            fontWeight: "900",
            color: "#15803D",
            marginBottom: "10px",
            textAlign: "center",
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
              padding: "10px",
              borderRadius: "20px",
              backgroundColor: "#16A34A",
              color: "white",
              border: "none",
              fontWeight: "900",
              fontSize: "11px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            {chargement ? "..." : "Oui, restaurer"}
          </button>
          <button
            onClick={() => setAction(null)}
            disabled={chargement}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "20px",
              backgroundColor: "white",
              color: "#0F172A",
              border: "1.5px solid #0F172A",
              fontWeight: "900",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "inherit",
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
        backgroundColor: "white",
        border: "1.5px solid #DC2626",
        borderRadius: "14px",
        padding: "12px",
        boxShadow: "3px 3px 0 #DC2626",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        marginBottom: "10px",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: "#FEE2E2",
          flexShrink: 0,
        }}>
          <AlertTriangle size={14} color="#DC2626" strokeWidth={2.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "900",
              color: "#991B1B",
              marginBottom: "5px",
            }}
          >
            Supprimer définitivement ?
          </p>
          <p
            style={{
              fontSize: "10.5px",
              fontWeight: "700",
              color: "#7F1D1D",
              lineHeight: 1.5,
            }}
          >
            <strong>{nomBoutique}</strong> sera supprimée avec ses produits, commandes et données.
            <br />
            <strong>Cette action est irréversible.</strong>
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={() => executer("supprimer")}
          disabled={chargement}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            backgroundColor: "#DC2626",
            color: "white",
            border: "none",
            fontWeight: "900",
            fontSize: "11px",
            cursor: "pointer",
            opacity: chargement ? 0.6 : 1,
            fontFamily: "inherit",
          }}
        >
          {chargement ? "..." : "Oui, supprimer"}
        </button>
        <button
          onClick={() => setAction(null)}
          disabled={chargement}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            backgroundColor: "white",
            color: "#0F172A",
            border: "1.5px solid #0F172A",
            fontWeight: "900",
            fontSize: "11px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
            }
