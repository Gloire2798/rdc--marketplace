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
import { ShoppingCart, Trash2, Minus, Plus, Store } from "lucide-react";

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
      <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
        <p style={{ color: "#57534E", fontWeight: "700" }}>Chargement...</p>
      </div>
    );
  }

  if (panier.length === 0) {
    return (
      <div style={{ padding: "40px 16px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A", marginBottom: "20px", letterSpacing: "-0.5px" }}>
          Mon panier
        </h1>
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "50px 20px",
          borderRadius: "24px",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <ShoppingCart size={48} color="#CBD5E1" strokeWidth={1.8} style={{ margin: "0 auto 14px" }} />
          <p style={{ fontSize: "16px", fontWeight: "900", marginBottom: "6px", color: "#0F172A" }}>
            Votre panier est vide
          </p>
          <p style={{ color: "#57534E", marginBottom: "22px", fontSize: "12px", fontWeight: "600" }}>
            Découvrez nos boutiques et ajoutez des articles.
          </p>
          <Link href="/" style={{
            backgroundColor: "#0F172A",
            color: "white",
            padding: "12px 24px",
            borderRadius: "24px",
            fontWeight: "900",
            fontSize: "13px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}>
            Voir les boutiques
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 14px 30px 14px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A", marginBottom: "4px", letterSpacing: "-0.5px" }}>
        Mon panier
      </h1>
      <p style={{ color: "#57534E", marginBottom: "18px", fontSize: "12px", fontWeight: "700" }}>
        {panier.length} article{panier.length > 1 ? "s" : ""}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        {panier.map((article) => {
          const enPromo = article.prixPromo !== null && article.prixPromo < article.prix;
          const prixFinal = enPromo ? article.prixPromo! : article.prix;
          const cleLigne = `${article.produitId}::${article.varianteId || "sv"}`;
          const labelVariante = formaterVariante(article.varianteInfo);

          return (
            <div key={cleLigne} style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "12px",
              border: "1px solid #D4C5A0",
              display: "flex",
              gap: "12px",
              boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
            }}>
              {article.photo ? (
                <img
                  src={article.photo}
                  alt={article.nom}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    borderRadius: "12px",
                    backgroundColor: "#F8FAFC",
                    flexShrink: 0,
                    padding: "4px",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <div style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#F8FAFC",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <ShoppingCart size={24} color="#CBD5E1" strokeWidth={2} />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontSize: "13.5px",
                  fontWeight: "900",
                  marginBottom: "4px",
                  color: "#0F172A",
                  lineHeight: 1.25,
                }}>
                  {article.nom}
                </h3>

                {labelVariante && (
                  <p style={{
                    fontSize: "10.5px",
                    color: "#0F172A",
                    marginBottom: "4px",
                    fontWeight: "800",
                    backgroundColor: "#F5EAD2",
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    border: "1px solid #D4C5A0",
                  }}>
                    {labelVariante}
                  </p>
                )}

                <p style={{
                  fontSize: "10.5px",
                  color: "#57534E",
                  marginBottom: "8px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  <Store size={11} strokeWidth={2.5} />
                  {article.nomBoutique}
                </p>

                {enPromo ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: "900", color: "#EA580C" }}>
                      {formaterPrix(prixFinal, article.devise)}
                    </span>
                    <span style={{ fontSize: "10.5px", color: "#64748B", textDecoration: "line-through", fontWeight: "700" }}>
                      {formaterPrix(article.prix, article.devise)}
                    </span>
                  </div>
                ) : (
                  <p style={{ fontSize: "15px", fontWeight: "900", color: "#EA580C", marginBottom: "8px" }}>
                    {formaterPrix(prixFinal, article.devise)}
                  </p>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => modifier(article.produitId, article.quantite - 1, article.varianteId)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      border: "1.5px solid #0F172A",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "900",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0F172A",
                    }}
                  >
                    <Minus size={12} strokeWidth={3} />
                  </button>
                  <span style={{ fontSize: "14px", fontWeight: "900", minWidth: "20px", textAlign: "center", color: "#0F172A" }}>
                    {article.quantite}
                  </span>
                  <button
                    onClick={() => modifier(article.produitId, article.quantite + 1, article.varianteId)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      border: "1.5px solid #0F172A",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "900",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0F172A",
                    }}
                  >
                    <Plus size={12} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => supprimer(article.produitId, article.varianteId)}
                    style={{
                      marginLeft: "auto",
                      width: "32px",
                      height: "32px",
                      backgroundColor: "#FEE2E2",
                      color: "#DC2626",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "16px",
        border: "1px solid #D4C5A0",
        marginBottom: "14px",
        boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
      }}>
        <p style={{ fontSize: "13px", fontWeight: "900", color: "#0F172A", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Récapitulatif
        </p>

        {(reductionUSD > 0 || reductionFC > 0) && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
              <span style={{ color: "#57534E", fontWeight: "700" }}>Sous-total</span>
              <span style={{ fontWeight: "800", color: "#0F172A" }}>
                {originalUSD > 0 && formaterPrix(originalUSD, "USD")}
                {originalUSD > 0 && originalFC > 0 && " + "}
                {originalFC > 0 && formaterPrix(originalFC, "FC")}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "12px" }}>
              <span style={{ color: "#16A34A", fontWeight: "700" }}>Réductions</span>
              <span style={{ color: "#16A34A", fontWeight: "800" }}>
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
          alignItems: "center",
          paddingTop: "12px",
          borderTop: "1px solid #D4C5A0",
          marginTop: "4px",
        }}>
          <span style={{ fontWeight: "900", fontSize: "14px", color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Total
          </span>
          <div style={{ textAlign: "right" }}>
            {totalUSD > 0 && (
              <p style={{ fontSize: "18px", fontWeight: "900", color: "#EA580C", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                {formaterPrix(totalUSD, "USD")}
              </p>
            )}
            {totalFC > 0 && (
              <p style={{ fontSize: "18px", fontWeight: "900", color: "#EA580C", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
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
          backgroundColor: "#0F172A",
          color: "white",
          padding: "16px",
          borderRadius: "26px",
          textAlign: "center",
          fontWeight: "900",
          fontSize: "14px",
          textDecoration: "none",
          boxSizing: "border-box",
          marginBottom: "10px",
          letterSpacing: "-0.2px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.20)",
        }}
      >
        Passer la commande
      </Link>

      <button
        onClick={toutVider}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "white",
          color: "#DC2626",
          border: "1.5px solid #DC2626",
          borderRadius: "26px",
          fontWeight: "900",
          fontSize: "12.5px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontFamily: "inherit",
        }}
      >
        <Trash2 size={14} strokeWidth={2.5} />
        Vider le panier
      </button>

      <Link
        href="/"
        style={{
          display: "block",
          textAlign: "center",
          marginTop: "14px",
          color: "#57534E",
          fontSize: "12px",
          fontWeight: "800",
          textDecoration: "none",
        }}
      >
        ← Continuer mes achats
      </Link>
    </div>
  );
                }
