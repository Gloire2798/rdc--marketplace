"use client";

import { useState } from "react";
import { ajouterAuPanier } from "@/lib/panier";
import { ShoppingCart, Check } from "lucide-react";

interface Article {
  produitId: string;
  vendeurId: string;
  nom: string;
  prix: number;
  prixPromo: number | null;
  devise: string;
  photo: string | null;
  nomBoutique: string;
}

export default function BoutonPanier({
  article,
  stock,
}: {
  article: Article;
  stock: number;
}) {
  const [ajoute, setAjoute] = useState(false);

  const ajouter = () => {
    if (stock === 0) return;

    try {
      ajouterAuPanier(article);
      setAjoute(true);
      setTimeout(() => setAjoute(false), 2000);
    } catch {}
  };

  const enRupture = stock === 0;

  return (
    <button
      onClick={ajouter}
      disabled={enRupture}
      style={{
        width: "100%",
        backgroundColor: enRupture
          ? "#94A3B8"
          : ajoute
          ? "#16A34A"
          : "#0F172A",
        color: "white",
        padding: "16px 20px",
        borderRadius: "26px",
        border: "none",
        fontWeight: "900",
        fontSize: "15px",
        cursor: enRupture ? "not-allowed" : "pointer",
        transition: "background-color 0.25s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        letterSpacing: "-0.2px",
        fontFamily: "inherit",
      }}
    >
      {enRupture ? (
        "Rupture de stock"
      ) : ajoute ? (
        <>
          <Check size={18} strokeWidth={3} />
          Ajouté au panier
        </>
      ) : (
        <>
          <ShoppingCart size={18} strokeWidth={2.8} />
          Ajouter au panier
        </>
      )}
    </button>
  );
}
