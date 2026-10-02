"use client";

import React from "react";

interface Props {
  actif: boolean;
  onClick: () => void;
  label: string;
  couleur: "blue" | "red" | "green";
}

export default function FiltreBouton({ actif, onClick, label, couleur }: Props) {
  let bgActif = "#1D4ED8";
  if (couleur === "red") bgActif = "#dc2626";
  if (couleur === "green") bgActif = "#16a34a";

  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "700",
        whiteSpace: "nowrap",
        border: actif ? "1px solid transparent" : "1px solid #E2E8F0",
        backgroundColor: actif ? bgActif : "white",
        color: actif ? "white" : "#475569",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
