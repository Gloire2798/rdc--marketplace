"use client";

import React from "react";

interface Props {
  actif: boolean;
  onClick: () => void;
  label: string;
  couleur: "blue" | "red" | "green";
}

export default function FiltreBouton({ actif, onClick, label, couleur }: Props) {
  // Toutes les couleurs actives passent en NOIR pour la cohérence charte
  const bgActif = "#0F172A";

  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "900",
        whiteSpace: "nowrap",
        border: actif ? "1.5px solid #0F172A" : "1.5px solid #D4C5A0",
        backgroundColor: actif ? bgActif : "white",
        color: actif ? "white" : "#57534E",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: actif ? "2px 2px 0 #EA580C" : "none",
      }}
    >
      {label}
    </button>
  );
}
