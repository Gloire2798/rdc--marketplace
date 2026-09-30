"use client";

import { useState } from "react";
import { ajouterAuPanier } from "@/lib/panier";

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
  const [erreur, setErreur] = useState("");

  const ajouter = () => {
    setErreur("");

    if (stock === 0) {
      setErreur("Produit en rupture de stock");
      return;
    }

    try {
      ajouterAuPanier(article);
      setAjoute(true);
      setTimeout(() => setAjoute(false), 2000);
    } catch {
      setErreur("Erreur lors de l'ajout");
    }
  };

  return (
    <div>
      <button
        onClick={ajouter}
        disabled={stock === 0}
        style={{
          width: "100%",
          backgroundColor:
            stock === 0 ? "#9ca3af" : ajoute ? "#16a34a" : "#2563eb",
          color: "white",
          padding: "16px",
          borderRadius: "12px",
          border: "none",
          fontWeight: "600",
          fontSize: "16px",
          cursor: stock === 0 ? "not-allowed" : "pointer",
          transition: "background-color 0.3s",
        }}
      >
        {stock === 0
          ? "❌ Rupture de stock"
          : ajoute
          ? "✅ Ajouté au panier !"
          : "🛒 Ajouter au panier"}
      </button>

      {erreur && (
        <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px", textAlign: "center" }}>
          {erreur}
        </p>
      )}
    </div>
  );
          }
