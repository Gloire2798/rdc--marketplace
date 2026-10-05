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
          padding: "8px 12px",
          borderRadius: "20px",
          backgroundColor: "white",
          color: "#DC2626",
          border: "1.5px solid #DC2626",
          fontWeight: "900",
          fontSize: "11px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          flexShrink: 0,
          fontFamily: "inherit",
        }}
      >
        <UserMinus size={12} strokeWidth={2.8} />
        Retirer
      </button>
    );
  }

  return (
    <div style={{
      backgroundColor: "white",
      border: "1.5px solid #DC2626",
      borderRadius: "14px",
      padding: "8px 10px",
      flexShrink: 0,
      boxShadow: "2px 2px 0 #DC2626",
    }}>
      <p style={{
        fontSize: "10.5px",
        fontWeight: "900",
        color: "#991B1B",
        marginBottom: "6px",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}>
        Retirer {nomClient} ?
      </p>
      <div style={{ display: "flex", gap: "5px" }}>
        <button
          onClick={retirer}
          disabled={chargement}
          style={{
            padding: "6px 12px",
            borderRadius: "14px",
            backgroundColor: "#DC2626",
            color: "white",
            border: "none",
            fontWeight: "900",
            fontSize: "10.5px",
            cursor: "pointer",
            opacity: chargement ? 0.6 : 1,
            fontFamily: "inherit",
          }}
        >
          {chargement ? "..." : "Oui"}
        </button>
        <button
          onClick={() => setConfirme(false)}
          disabled={chargement}
          style={{
            padding: "6px 12px",
            borderRadius: "14px",
            backgroundColor: "white",
            color: "#0F172A",
            border: "1.5px solid #0F172A",
            fontWeight: "900",
            fontSize: "10.5px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Non
        </button>
      </div>
    </div>
  );
}
