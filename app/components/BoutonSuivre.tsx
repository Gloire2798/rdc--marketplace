"use client";

import { useState } from "react";
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
        justifyContent: "center",
        gap: "6px",
        padding: "10px 18px",
        borderRadius: "24px",
        fontSize: "12.5px",
        fontWeight: "900",
        border: "none",
        backgroundColor: suivi ? "#FFFFFF" : "#0F172A",
        color: suivi ? "#0F172A" : "#FFFFFF",
        cursor: "pointer",
        opacity: chargement ? 0.6 : 1,
        transition: "transform 0.15s ease, opacity 0.15s ease",
        boxShadow: suivi ? "inset 0 0 0 2px #0F172A" : "none",
        fontFamily: "inherit",
      }}
    >
      <Heart
        size={14}
        strokeWidth={2.8}
        fill={suivi ? "#0F172A" : "white"}
        color={suivi ? "#0F172A" : "white"}
      />
      {suivi ? "Suivi" : "Suivre"}
    </button>
  );
}
