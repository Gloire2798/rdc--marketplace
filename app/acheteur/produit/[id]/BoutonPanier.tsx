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
            stock === 0 ? "#9ca3af" : ajoute ? "#16a34a" : "#1D4ED8",
          color: "white",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "none",
          fontWeight: "800",
          fontSize: "13px",
          cursor: stock === 0 ? "not-allowed" : "pointer",
          transition: "background-color 0.3s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        {stock === 0 ? (
          "❌ Rupture de stock"
        ) : ajoute ? (
          <>
            <Check size={16} strokeWidth={3} />
            Ajouté au panier !
          </>
        ) : (
          <>
            <ShoppingCart size={16} strokeWidth={2.8} />
            Ajouter au panier
          </>
        )}
      </button>

      {erreur && (
        <p style={{ color: "#dc2626", fontSize: "11px", marginTop: "6px", textAlign: "center", fontWeight: "600" }}>
          {erreur}
        </p>
      )}
    </div>
  );
}
