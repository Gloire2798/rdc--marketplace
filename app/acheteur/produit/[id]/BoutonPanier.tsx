"use client";

import { useState } from "react";
import { ajouterAuPanier, getPanier } from "@/lib/panier";
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

  const quantiteDansPanier = () => {
    const panier = getPanier();
    const existant = panier.find(
      (a) => a.produitId === article.produitId && !a.varianteId
    );
    return existant ? existant.quantite : 0;
  };

  const ajouter = () => {
    if (stock === 0) return;

    const dejaDans = quantiteDansPanier();

    if (dejaDans + 1 > stock) {
      setErreur(`Stock max atteint (${stock} disponible${stock > 1 ? "s" : ""})`);
      setTimeout(() => setErreur(""), 2500);
      return;
    }

    try {
      ajouterAuPanier(article);
      setAjoute(true);
      setTimeout(() => setAjoute(false), 2000);
    } catch {}
  };

  const enRupture = stock === 0;
  const dejaDansPanier = quantiteDansPanier();
  const maxAtteint = dejaDansPanier >= stock;

  return (
    <div>
      <button
        onClick={ajouter}
        disabled={enRupture || maxAtteint}
        style={{
          width: "100%",
          backgroundColor: enRupture
            ? "#94A3B8"
            : maxAtteint
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
          cursor: enRupture || maxAtteint ? "not-allowed" : "pointer",
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
        ) : maxAtteint ? (
          `Max ${stock} atteint`
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

      {erreur && (
        <p style={{
          marginTop: "8px",
          fontSize: "11.5px",
          fontWeight: "800",
          color: "#DC2626",
          textAlign: "center",
        }}>
          {erreur}
        </p>
      )}
    </div>
  );
}
