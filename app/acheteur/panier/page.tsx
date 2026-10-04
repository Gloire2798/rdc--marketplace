"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getPanier,
  changerQuantite,
  retirerDuPanier,
  viderPanier,
  formaterPrix,
  formaterVariante,
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

  const modifier = (produitId: string, nouvelleQuantite: number, varianteId?: string | null) => {
    changerQuantite(produitId, nouvelleQuantite, varianteId);
    chargerPanier();
  };

  const supprimer = (produitId: string, varianteId?: string | null) => {
    if (confirm("Retirer cet article du panier ?")) {
      retirerDuPanier(produitId, varianteId);
      chargerPanier();
    }
  };

  const toutVider = () => {
    if (confirm("Vider complètement le panier ?")) {
      viderPanier();
      chargerPanier();
    }
  };

  let totalFC = 0;
  let totalUSD = 0;
  let originalFC = 0;
  let originalUSD = 0;

  panier.forEach((a) => {
    const prixFinal = a.prixPromo !== null ? a.prixPromo : a.prix;
    const montant = prixFinal * a.quantite;
    const montantOriginal = a.prix * a.quantite;

    if (a.devise === "USD") {
      totalUSD += montant;
      originalUSD += montantOriginal;
    } else {
      totalFC += montant;
      originalFC += montantOriginal;
    }
  });

  const reductionFC = originalFC - totalFC;
  const reductionUSD = originalUSD - totalUSD;

  if (chargement) {
    return (
      <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (panier.length === 0) {
    return (
      <div style={{ padding: "40px 16px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", marginBottom: "20px" }}>
          Mon panier
        </h1>
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "50px 20px",
          borderRadius: "14px",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>🛒</p>
          <p style={{ fontSize: "14px", fontWeight: "800", marginBottom: "6px", color: "#0F172A" }}>
            Votre panier est vide
          </p>
          <p style={{ color: "#78716C", marginBottom: "20px", fontSize: "12px", fontWeight: "500" }}>
            Découvrez nos boutiques et ajoutez des articles.
          </p>
          <Link href="/" style={{
            backgroundColor: "#1D4ED8",
            color: "white",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "13px",
            textDecoration: "none",
            display: "inline-block",
          }}>
            Voir les boutiques
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 14px 20px 14px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", marginBottom: "4px" }}>
        Mon panier
      </h1>
      <p style={{ color: "#64748b", marginBottom: "18px", fontSize: "11.5px", fontWeight: "600" }}>
        {panier.length} article{panier.length > 1 ? "s" : ""}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {panier.map((article) => {
          const enPromo = article.prixPromo !== null && article.prixPromo < article.prix;
          const prixFinal = enPromo ? article.prixPromo! : article.prix;
          const cleLigne = `${article.produitId}::${article.varianteId || "sv"}`;
          const labelVariante = formaterVariante(article.varianteInfo);

          return (
            <div key={cleLigne} style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "10px",
              border: "1px solid #E8DFC8",
              display: "flex",
              gap: "10px",
            }}>
              {article.photo ? (
                <img
                  src={article.photo}
                  alt={article.nom}
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    backgroundColor: "#F8FAFC",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor: "#F8FAFC",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}>
                  📦
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: "13px", fontWeight: "800", marginBottom: "2px", color: "#0F172A" }}>
                  {article.nom}
                </h3>

                {labelVariante && (
                  <p style={{
                    fontSize: "10.5px",
                    color: "#1D4ED8",
                    marginBottom: "2px",
                    fontWeight: "700",
                    backgroundColor: "#EFF6FF",
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}>
                    {labelVariante}
                  </p>
                )}

                <p style={{ fontSize: "10.5px", color: "#78716C", marginBottom: "6px", fontWeight: "600" }}>
                  🏪 {article.nomBoutique}
                </p>

                {enPromo ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: "900", color: "#16a34a" }}>
                      {formaterPrix(prixFinal, article.devise)}
                    </span>
                    <span style={{ fontSize: "10px", color: "#94a3b8", textDecoration: "line-through" }}>
                      {formaterPrix(article.prix, article.devise)}
                    </span>
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", fontWeight: "900", color: "#1D4ED8", marginBottom: "6px" }}>
                    {formaterPrix(prixFinal, article.devise)}
                  </p>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => modifier(article.produitId, article.quantite - 1, article.varianteId)}
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      border: "1px solid #E5E0D5",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: "13px", fontWeight: "800", minWidth: "18px", textAlign: "center" }}>
                    {article.quantite}
                  </span>
                  <button
                    onClick={() => modifier(article.produitId, article.quantite + 1, article.varianteId)}
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      border: "1px solid #E5E0D5",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => supprimer(article.produitId, article.varianteId)}
                    style={{
                      marginLeft: "auto",
                      padding: "4px 8px",
                      fontSize: "11px",
                      backgroundColor: "#FEE2E2",
                      color: "#991B1B",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "700",
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

      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "14px",
        border: "1px solid #E8DFC8",
        marginBottom: "14px",
      }}>
        <p style={{ fontSize: "12px", fontWeight: "800", color: "#0F172A", marginBottom: "10px" }}>
          Récapitulatif
        </p>

        {(reductionUSD > 0 || reductionFC > 0) && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11.5px" }}>
              <span style={{ color: "#78716C", fontWeight: "600" }}>Sous-total</span>
              <span style={{ fontWeight: "700", color: "#0F172A" }}>
                {originalUSD > 0 && formaterPrix(originalUSD, "USD")}
                {originalUSD > 0 && originalFC > 0 && " + "}
                {originalFC > 0 && formaterPrix(originalFC, "FC")}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "11.5px" }}>
              <span style={{ color: "#16a34a", fontWeight: "600" }}>Réductions</span>
              <span style={{ color: "#16a34a", fontWeight: "700" }}>
                {reductionUSD > 0 && `−${formaterPrix(reductionUSD, "USD")}`}
                {reductionUSD > 0 && reductionFC > 0 && " + "}
                {reductionFC > 0 && `−${formaterPrix(reductionFC, "FC")}`}
              </span>
            </div>
          </>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "10px",
          borderTop: "1px solid #F1ECE0",
          marginTop: "6px",
        }}>
          <span style={{ fontWeight: "900", fontSize: "13px", color: "#0F172A" }}>TOTAL</span>
          <div style={{ textAlign: "right" }}>
            {totalUSD > 0 && (
              <p style={{ fontSize: "15px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.2 }}>
                {formaterPrix(totalUSD, "USD")}
              </p>
            )}
            {totalFC > 0 && (
              <p style={{ fontSize: "15px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.2 }}>
                {formaterPrix(totalFC, "FC")}
              </p>
            )}
          </div>
        </div>
      </div>

      <Link
        href="/acheteur/commande"
        style={{
          display: "block",
          width: "100%",
          backgroundColor: "#1D4ED8",
          color: "white",
          padding: "13px",
          borderRadius: "12px",
          textAlign: "center",
          fontWeight: "800",
          fontSize: "13px",
          textDecoration: "none",
          boxSizing: "border-box",
          marginBottom: "8px",
        }}
      >
        ✅ Passer la commande
      </Link>

      <button
        onClick={toutVider}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "white",
          color: "#dc2626",
          border: "1.5px solid #dc2626",
          borderRadius: "10px",
          fontWeight: "700",
          fontSize: "12px",
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
          marginTop: "12px",
          color: "#78716C",
          fontSize: "11.5px",
          fontWeight: "700",
          textDecoration: "none",
        }}
      >
        ← Continuer mes achats
      </Link>
    </div>
  );
                    }
