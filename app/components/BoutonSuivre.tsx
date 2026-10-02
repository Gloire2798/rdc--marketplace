"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

interface Props {
  vendeurId: string;
  estConnecte: boolean;
  estClient: boolean;
  suiviInitial: boolean;
}

export default function BoutonSuivre({
  vendeurId,
  estConnecte,
  estClient,
  suiviInitial,
}: Props) {
  const router = useRouter();
  const [suivi, setSuivi] = useState(suiviInitial);
  const [chargement, setChargement] = useState(false);

  const basculer = async () => {
    // Si pas connecté ou pas client → redirection inscription
    if (!estConnecte || !estClient) {
      router.push("/client/inscription");
      return;
    }

    setChargement(true);

    try {
      if (suivi) {
        const res = await fetch(`/api/abonnements?vendeurId=${vendeurId}`, {
          method: "DELETE",
        });
        if (res.ok) setSuivi(false);
      } else {
        const res = await fetch("/api/abonnements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendeurId }),
        });
        if (res.ok) setSuivi(true);
      }
    } catch {}

    setChargement(false);
  };

  return (
    <button
      onClick={basculer}
      disabled={chargement}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "800",
        border: suivi ? "1px solid #dc2626" : "1px solid #1D4ED8",
        backgroundColor: suivi ? "#FEE2E2" : "#EFF6FF",
        color: suivi ? "#dc2626" : "#1D4ED8",
        cursor: "pointer",
        opacity: chargement ? 0.6 : 1,
        marginTop: "6px",
      }}
    >
      <Heart
        size={12}
        strokeWidth={2.5}
        fill={suivi ? "#dc2626" : "transparent"}
      />
      {suivi ? "Suivi ✓" : "Suivre"}
    </button>
  );
}
