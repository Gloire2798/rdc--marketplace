"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Camera, X, Loader2 } from "lucide-react";

interface ProduitResultat {
  id: string;
  nom: string;
  photo1: string | null;
  prix: number;
  prixPromo: number | null;
  devise: string;
  nomBoutique: string;
}

interface BoutiqueResultat {
  id: string;
  nomBoutique: string;
  description: string | null;
  logo: string | null;
  photoCouverture: string | null;
  adresse: string | null;
}

function ContenuRecherche() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qInitial = searchParams.get("q") || "";

  const [q, setQ] = useState(qInitial);
  const [produits, setProduits] = useState<ProduitResultat[]>([]);
  const [boutiques, setBoutiques] = useState<BoutiqueResultat[]>([]);
  const [chargement, setChargement] = useState(false);
  const [aCherche, setACherche] = useState(false);

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") return `${prix.toFixed(2)} $`;
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  useEffect(() => {
    if (qInitial && qInitial.length >= 2) {
      lancerRecherche(qInitial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInitial]);

  const lancerRecherche = async (terme: string) => {
    if (terme.length < 2) return;
    setChargement(true);
    setACherche(true);

    try {
      const res = await fetch(`/api/recherche?q=${encodeURIComponent(terme)}`);
      const data = await res.json();

      if (data.succes) {
        setProduits(data.produits || []);
        setBoutiques(data.boutiques || []);
      }
    } catch {
      setProduits([]);
      setBoutiques([]);
    }
    setChargement(false);
  };

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length >= 2) {
      router.push(`/recherche?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const vider = () => {
    setQ("");
    setProduits([]);
    setBoutiques([]);
    setACherche(false);
    router.push("/recherche");
  };

  const aResultats = produits.length > 0 || boutiques.length > 0;

  return (
    <div style={{
      padding: "16px 14px 100px 14px",
      backgroundColor: "#FAF5E8",
      minHeight: "100vh",
      maxWidth: "600px",
      margin: "0 auto",
    }}>
      <form onSubmit={soumettre} style={{ marginBottom: "18px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 14px",
          border: "1px solid #E8DFC8",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
        }}>
          <Search size={18} color="#64748B" strokeWidth={2.4} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher produits, boutiques..."
            autoFocus
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              fontSize: "14px",
              fontWeight: "600",
              color: "#0F172A",
              fontFamily: "inherit",
            }}
          />
          {q && (
            <button
              type="button"
              onClick={vider}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#94a3b8",
                padding: "2px",
              }}
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => alert("📷 Recherche par image : bientôt disponible !")}
            style={{
              background: "#EFF6FF",
              border: "none",
              borderRadius: "8px",
              padding: "6px 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#1D4ED8",
            }}
            aria-label="Rechercher par photo"
          >
            <Camera size={16} strokeWidth={2.4} />
          </button>
        </div>
      </form>

      {chargement && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader2 size={28} color="#1D4ED8" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "8px", fontSize: "11.5px", color: "#64748B", fontWeight: "600" }}>
            Recherche...
          </p>
        </div>
      )}

      {!chargement && aCherche && !aResultats && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px 20px",
          textAlign: "center",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</p>
          <p style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "4px" }}>
            Aucun résultat
          </p>
          <p style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "500" }}>
            Essayez un autre mot-clé
          </p>
        </div>
      )}

      {!chargement && aResultats && (
        <>
          {boutiques.length > 0 && (
            <>
              <h2 style={{
                fontSize: "12px",
                fontWeight: "800",
                color: "#0F172A",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                marginBottom: "8px",
              }}>
                🏪 Boutiques ({boutiques.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {boutiques.map((b) => (
                  <Link
                    key={b.id}
                    href={`/acheteur/boutique/${b.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      backgroundColor: "white",
                      borderRadius: "12px",
                      padding: "10px",
                      border: "1px solid #E8DFC8",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    {b.logo ? (
                      <img src={b.logo} alt={b.nomBoutique} style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }} />
                    ) : (
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        backgroundColor: "#EFF6FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        flexShrink: 0,
                      }}>
                        🏪
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "2px" }}>
                        {b.nomBoutique}
                      </p>
                      {b.adresse && (
                        <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600" }}>
                          📍 {b.adresse}
                        </p>
                      )}
                    </div>
                    <span style={{ color: "#94a3b8", fontWeight: "900" }}>›</span>
                  </Link>
                ))}
              </div>
            </>
          )}          {produits.length > 0 && (
            <>
              <h2 style={{
                fontSize: "12px",
                fontWeight: "800",
                color: "#0F172A",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                marginBottom: "8px",
              }}>
                📦 Produits ({produits.length})
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}>
                {produits.map((p) => {
                  const enPromo = p.prixPromo !== null && p.prixPromo < p.prix;
                  return (
                    <Link
                      key={p.id}
                      href={`/acheteur/produit/${p.id}`}
                      style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        overflow: "hidden",
                        textDecoration: "none",
                        color: "inherit",
                        border: "1px solid #E8DFC8",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {p.photo1 ? (
                        <div style={{
                          width: "100%",
                          height: "120px",
                          backgroundColor: "#F8FAFC",
                          overflow: "hidden",
                        }}>
                          <img
                            src={p.photo1}
                            alt={p.nom}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: "100%",
                          height: "120px",
                          backgroundColor: "#F8FAFC",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "28px",
                        }}>
                          📦
                        </div>
                      )}
                      <div style={{ padding: "8px 10px" }}>
                        <p style={{
                          fontSize: "11.5px",
                          fontWeight: "700",
                          color: "#0F172A",
                          marginBottom: "2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {p.nom}
                        </p>
                        <p style={{
                          fontSize: "10px",
                          color: "#64748b",
                          fontWeight: "600",
                          marginBottom: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          🏪 {p.nomBoutique}
                        </p>
                        {enPromo ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "900", color: "#16a34a" }}>
                              {formaterPrix(p.prixPromo!, p.devise)}
                            </span>
                            <span style={{ fontSize: "9.5px", color: "#94a3b8", textDecoration: "line-through" }}>
                              {formaterPrix(p.prix, p.devise)}
                            </span>
                          </div>
                        ) : (
                          <p style={{ fontSize: "12px", fontWeight: "900", color: "#1D4ED8" }}>
                            {formaterPrix(p.prix, p.devise)}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {!chargement && !aCherche && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px 20px",
          textAlign: "center",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "40px", marginBottom: "10px" }}>🔍</p>
          <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "4px" }}>
            Que cherchez-vous ?
          </p>
          <p style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "500" }}>
            Tapez le nom d&apos;un produit ou d&apos;une boutique
          </p>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function PageRecherche() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
          <p>Chargement...</p>
        </div>
      }
    >
      <ContenuRecherche />
    </Suspense>
  );
                      }
