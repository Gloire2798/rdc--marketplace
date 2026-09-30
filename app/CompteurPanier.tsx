"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { compterArticles } from "@/lib/panier";

export default function CompteurPanier() {
  const [nombre, setNombre] = useState(0);

  useEffect(() => {
    const mettreAJour = () => {
      setNombre(compterArticles());
    };

    mettreAJour();

    // Écouter les changements
    window.addEventListener("panier-mis-a-jour", mettreAJour);
    window.addEventListener("storage", mettreAJour);

    return () => {
      window.removeEventListener("panier-mis-a-jour", mettreAJour);
      window.removeEventListener("storage", mettreAJour);
    };
  }, []);

  return (
    <Link
      href="/acheteur/panier"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        fontSize: "22px",
        padding: "4px 8px",
      }}
    >
      🛒
      {nombre > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-2px",
            right: "-4px",
            backgroundColor: "#dc2626",
            color: "white",
            fontSize: "11px",
            fontWeight: "bold",
            minWidth: "18px",
            height: "18px",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 5px",
          }}
        >
          {nombre}
        </span>
      )}
    </Link>
  );
      }
