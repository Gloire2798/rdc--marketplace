"use client";

import { useState } from "react";
import { ajouterAuPanier, getPanier } from "@/lib/panier";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";

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
  const [, setTick] = useState(0);

  const quantiteDansPanier = (): number => {
    const panier = getPanier();
    const existant = panier.find(
      (a) => a.produitId === article.produitId && !a.varianteId
    );
    return existant ? existant.quantite : 0;
  };

  const dejaDans = quantiteDansPanier();
  const enRupture = stock === 0;
  const maxAtteint = !enRupture && dejaDans >= stock;

  const ajouter = () => {
    if (enRupture) return;

    if (dejaDans + 1 > stock) {
      setErreur(
        `Stock max atteint (${stock} disponible${stock > 1 ? "s" : ""})`
      );
      setTimeout(() => setErreur(""), 2500);
      return;
    }

    try {
      ajouterAuPanier(article);
      setAjoute(true);
      setTick((t) => t + 1);
      setTimeout(() => setAjoute(false), 2000);
    } catch {}
  };

  return (
    <div>
      {/* STATUT STOCK */}
      <p style={{
        fontSize: "11.5px",
        color: enRupture || maxAtteint ? "#DC2626" : "#16A34A",
        fontWeight: "800",
        marginBottom: "14px",
        textAlign: "center",
      }}>
        {enRupture
          ? "Rupture de stock"
          : maxAtteint
          ? `Stock max atteint (${stock} dans le panier)`
          : `En stock (${stock} disponible${stock > 1 ? "s" : ""})`}
      </p>

      <button
        onClick={ajouter}
        disabled={enRupture || maxAtteint}
        style={{
          width: "100%",
          backgroundColor:
            enRupture || maxAtteint
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
          color: "#DC2626",
          fontSize: "11px",
          marginTop: "10px",
          textAlign: "center",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
        }}>
          <AlertCircle size={13} />
          {erreur}
        </p>
      )}
    </div>
  );
          }
