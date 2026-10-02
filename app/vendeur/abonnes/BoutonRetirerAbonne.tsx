"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";

interface Props {
  abonnementId: string;
  nomClient: string;
}

export default function BoutonRetirerAbonne({ abonnementId, nomClient }: Props) {
  const router = useRouter();
  const [confirme, setConfirme] = useState(false);
  const [chargement, setChargement] = useState(false);

  const retirer = async () => {
    setChargement(true);
    try {
      const res = await fetch(`/api/abonnements/${abonnementId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors du retrait");
      }
    } catch {
      alert("Erreur réseau");
    }
    setChargement(false);
    setConfirme(false);
  };

  if (!confirme) {
    return (
      <button
        onClick={() => setConfirme(true)}
        style={{
          padding: "6px 10px",
          borderRadius: "8px",
          backgroundColor: "#FEE2E2",
          color: "#dc2626",
          border: "1px solid #FECACA",
          fontWeight: "800",
          fontSize: "10.5px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          flexShrink: 0,
        }}
      >
        <UserMinus size={11} strokeWidth={2.5} />
        Retirer
      </button>
    );
  }

  return (
    <div style={{
      backgroundColor: "#FEE2E2",
      border: "1px solid #FECACA",
      borderRadius: "8px",
      padding: "8px",
      flexShrink: 0,
    }}>
      <p style={{
        fontSize: "10px",
        fontWeight: "700",
        color: "#991B1B",
        marginBottom: "6px",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}>
        Retirer {nomClient} ?
      </p>
      <div style={{ display: "flex", gap: "4px" }}>
        <button
          onClick={retirer}
          disabled={chargement}
          style={{
            padding: "5px 8px",
            borderRadius: "6px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            fontWeight: "800",
            fontSize: "10px",
            cursor: "pointer",
            opacity: chargement ? 0.6 : 1,
          }}
        >
          {chargement ? "..." : "Oui"}
        </button>
        <button
          onClick={() => setConfirme(false)}
          disabled={chargement}
          style={{
            padding: "5px 8px",
            borderRadius: "6px",
            backgroundColor: "white",
            color: "#64748b",
            border: "1px solid #E2E8F0",
            fontWeight: "700",
            fontSize: "10px",
            cursor: "pointer",
          }}
        >
          Non
        </button>
      </div>
    </div>
  );
                                               }
