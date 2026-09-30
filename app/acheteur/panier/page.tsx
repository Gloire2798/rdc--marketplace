"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getPanier,
  changerQuantite,
  retirerDuPanier,
  viderPanier,
  formaterPrix,
  ArticlePanier,
} from "@/lib/panier";

export default function PagePanier() {
  const [panier, setPanier] = useState<ArticlePanier[]>([]);
  const [chargement, setChargement] = useState(true);

  const chargerPanier = () => {
    setPanier(getPanier());
    setChargement(false);
  };

  useEffect(() => {
    chargerPanier();

    window.addEventListener("panier-mis-a-jour", chargerPanier);
    return () => {
      window.removeEventListener("panier-mis-a-jour", chargerPanier);
    };
  }, []);

  const modifier = (produitId: string, nouvelleQuantite: number) => {
    changerQuantite(produitId, nouvelleQuantite);
    chargerPanier();
  };

  const supprimer = (produitId: string) => {
    if (confirm("Retirer cet article du panier ?")) {
      retirerDuPanier(produitId);
      chargerPanier();
    }
  };

  const toutVider = () => {
    if (confirm("Vider complètement le panier ?")) {
      viderPanier();
      chargerPanier();
    }
  };

  const total = panier.reduce((acc, a) => {
    const prixFinal = a.prixPromo !== null ? a.prixPromo : a.prix;
    return acc + prixFinal * a.quantite;
  }, 0);

  const totalOriginal = panier.reduce((acc, a) => {
    return acc + a.prix * a.quantite;
  }, 0);

  const reductions = totalOriginal - total;

  if (chargement) {
    return (
      <div className="container" style={{ padding: "60px 16px", textAlign: "center" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (panier.length === 0) {
    return (
      <div className="container" style={{ padding: "40px 16px", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>
          Mon panier
        </h1>

        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</p>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            Votre panier est vide
          </p>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            Découvrez nos boutiques et ajoutez des articles.
          </p>
          <Link href="/" className="btn btn-primary">
            Voir les boutiques
          </Link>
        </div>
      </div>
    );
  }

  const devise = panier[0]?.devise || "FC";

  return (
    <div className="container" style={{ padding: "40px 16px", maxWidth: "600px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
        Mon panier
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        {panier.length} article{panier.length > 1 ? "s" : ""} dans votre panier
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {panier.map((article) => {
          const enPromo =
            article.prixPromo !== null && article.prixPromo < article.prix;
          const prixFinal = enPromo ? article.prixPromo! : article.prix;

          return (
            <div key={article.produitId} className="card" style={{ display: "flex", gap: "12px", padding: "12px" }}>
              {article.photo ? (
                <img
                  src={article.photo}
                  alt={article.nom}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    backgroundColor: "#f3f4f6",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  flexShrink: 0,
                }}>
                  📦
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "2px" }}>
                  {article.nom}
                </h3>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
                  🏪 {article.nomBoutique}
                </p>

                {enPromo ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: "bold", color: "#16a34a" }}>
                      {formaterPrix(prixFinal, article.devise)}
                    </span>
                    <span style={{ fontSize: "12px", color: "#9ca3af", textDecoration: "line-through" }}>
                      {formaterPrix(article.prix, article.devise)}
                    </span>
                  </div>
                ) : (
                  <p style={{ fontSize: "15px", fontWeight: "bold", color: "#2563eb", marginBottom: "8px" }}>
                    {formaterPrix(prixFinal, article.devise)}
                  </p>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => modifier(article.produitId, article.quantite - 1)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: "15px", fontWeight: "600", minWidth: "20px", textAlign: "center" }}>
                    {article.quantite}
                  </span>
                  <button
                    onClick={() => modifier(article.produitId, article.quantite + 1)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => supprimer(article.produitId)}
                    style={{
                      marginLeft: "auto",
                      padding: "4px 8px",
                      fontSize: "12px",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Récapitulatif */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "#6b7280" }}>Sous-total</span>
          <span>{formaterPrix(totalOriginal, devise)}</span>
        </div>

        {reductions > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: "#16a34a" }}>Réductions</span>
            <span style={{ color: "#16a34a", fontWeight: "600" }}>
              −{formaterPrix(reductions, devise)}
            </span>
          </div>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "8px",
          borderTop: "1px solid #e5e7eb",
          marginTop: "8px",
        }}>
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>TOTAL</span>
          <span style={{ fontWeight: "bold", fontSize: "16px", color: "#2563eb" }}>
            {formaterPrix(total, devise)}
          </span>
        </div>
      </div>

      <button
        onClick={() => alert("La commande sera activée très bientôt !")}
        className="btn btn-primary"
        style={{ width: "100%" }}
      >
        ✅ Passer la commande
      </button>

      <button
        onClick={toutVider}
        style={{
          width: "100%",
          marginTop: "12px",
          padding: "10px",
          backgroundColor: "white",
          color: "#dc2626",
          border: "1px solid #dc2626",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        🗑️ Vider le panier
      </button>

      <Link
        href="/"
        style={{
          display: "block",
          textAlign: "center",
          marginTop: "16px",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        ← Continuer mes achats
      </Link>
    </div>
  );
        }
