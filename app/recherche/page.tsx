"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Camera, X, Loader2, Package, Store, SearchX, MapPin } from "lucide-react";

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

  const titreSection = {
    fontSize: "12px",
    fontWeight: "900" as const,
    color: "#0F172A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    marginBottom: "10px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
  };

  const traitOrange = {
    display: "inline-block",
    width: "3px",
    height: "13px",
    backgroundColor: "#EA580C",
    borderRadius: "2px",
  };

  return (
    <div style={{
      padding: "16px 12px 100px 12px",
      backgroundColor: "#F5EAD2",
      minHeight: "100vh",
      maxWidth: "600px",
      margin: "0 auto",
    }}>
      {/* BARRE DE RECHERCHE */}
      <form onSubmit={soumettre} style={{ marginBottom: "18px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "10px 14px",
          border: "1.5px solid #0F172A",
          boxShadow: "2px 2px 0 #EA580C",
        }}>
          <Search size={18} color="#0F172A" strokeWidth={2.8} />
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
              fontSize: "13.5px",
              fontWeight: "700",
              color: "#0F172A",
              fontFamily: "inherit",
              minWidth: 0,
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
                color: "#57534E",
                padding: "2px",
              }}
            >
              <X size={16} strokeWidth={2.8} />
            </button>
          )}
          <button
            type="button"
            onClick={() => alert("Recherche par image : bientôt disponible !")}
            style={{
              background: "#0F172A",
              border: "none",
              borderRadius: "12px",
              padding: "7px 9px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "white",
            }}
            aria-label="Rechercher par photo"
          >
            <Camera size={15} strokeWidth={2.8} />
          </button>
        </div>
      </form>

      {/* CHARGEMENT */}
      {chargement && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader2
            size={28}
            color="#EA580C"
            strokeWidth={2.8}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p style={{
            marginTop: "10px",
            fontSize: "11.5px",
            color: "#57534E",
            fontWeight: "800",
          }}>
            Recherche...
          </p>
        </div>
      )}

      {/* AUCUN RÉSULTAT */}
      {!chargement && aCherche && !aResultats && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "40px 20px",
          textAlign: "center",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#F5EAD2",
            marginBottom: "10px",
          }}>
            <SearchX size={26} color="#EA580C" strokeWidth={2.2} />
          </div>
          <p style={{
            fontSize: "14px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "4px",
          }}>
            Aucun résultat
          </p>
          <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700" }}>
            Essayez un autre mot-clé
          </p>
        </div>
      )}

      {/* RÉSULTATS */}
      {!chargement && aResultats && (
        <>
          {/* BOUTIQUES */}
          {boutiques.length > 0 && (
            <>
              <h2 style={titreSection}>
                <span style={traitOrange} />
                <Store size={14} strokeWidth={2.8} color="#EA580C" />
                Boutiques ({boutiques.length})
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
                      borderRadius: "16px",
                      padding: "10px",
                      border: "1px solid #D4C5A0",
                      textDecoration: "none",
                      color: "inherit",
                      boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
                    }}
                  >
                    {b.logo && b.logo.startsWith("http") ? (
                      <img
                        src={b.logo}
                        alt={b.nomBoutique}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          objectFit: "contain",
                          flexShrink: 0,
                          backgroundColor: "#F5EAD2",
                          padding: "3px",
                          boxSizing: "border-box",
                          border: "1px solid #D4C5A0",
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        backgroundColor: "#0F172A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        flexShrink: 0,
                        fontWeight: "900",
                        color: "white",
                      }}>
                        {(b.nomBoutique || "?").trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: "13px",
                        fontWeight: "900",
                        color: "#0F172A",
                        marginBottom: "3px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {b.nomBoutique}
                      </p>
                      {b.adresse && (
                        <p style={{
                          fontSize: "10.5px",
                          color: "#57534E",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          <MapPin size={10} strokeWidth={2.8} />
                          {b.adresse}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* PRODUITS */}
          {produits.length > 0 && (
            <>
              <h2 style={titreSection}>
                <span style={traitOrange} />
                <Package size={14} strokeWidth={2.8} color="#EA580C" />
                Produits ({produits.length})
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
                        borderRadius: "14px",
                        overflow: "hidden",
                        textDecoration: "none",
                        color: "inherit",
                        border: "1.5px solid #0F172A",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "2px 2px 0 #EA580C",
                      }}
                    >
                      {p.photo1 && p.photo1.startsWith("http") ? (
                        <div style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          backgroundColor: "#F8FAFC",
                          overflow: "hidden",
                        }}>
                          <img
                            src={p.photo1}
                            alt={p.nom}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              display: "block",
                              padding: "5px",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          backgroundColor: "#F8FAFC",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <Package size={26} color="#CBD5E1" strokeWidth={2} />
                        </div>
                      )}
                      <div style={{ padding: "8px 10px" }}>
                        <p style={{
                          fontSize: "11.5px",
                          fontWeight: "900",
                          color: "#0F172A",
                          marginBottom: "3px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          lineHeight: 1.2,
                        }}>
                          {p.nom}
                        </p>
                        <p style={{
                          fontSize: "10px",
                          color: "#57534E",
                          fontWeight: "700",
                          marginBottom: "5px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}>
                          <Store size={9} strokeWidth={2.8} />
                          {p.nomBoutique}
                        </p>
                        {enPromo ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ fontSize: "12.5px", fontWeight: "900", color: "#EA580C", lineHeight: 1.1 }}>
                              {formaterPrix(p.prixPromo!, p.devise)}
                            </span>
                            <span style={{ fontSize: "9.5px", color: "#94A3B8", textDecoration: "line-through", fontWeight: "700", lineHeight: 1.1 }}>
                              {formaterPrix(p.prix, p.devise)}
                            </span>
                          </div>
                        ) : (
                          <p style={{ fontSize: "12.5px", fontWeight: "900", color: "#EA580C" }}>
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

      {/* ÉTAT INITIAL (rien tapé) */}
      {!chargement && !aCherche && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "40px 20px",
          textAlign: "center",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#F5EAD2",
            marginBottom: "12px",
          }}>
            <Search size={30} color="#EA580C" strokeWidth={2.2} />
          </div>
          <p style={{
            fontSize: "14px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "6px",
          }}>
            Que cherchez-vous ?
          </p>
          <p style={{
            fontSize: "11.5px",
            color: "#57534E",
            fontWeight: "700",
            lineHeight: 1.5,
          }}>
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
        <div style={{
          padding: "60px 16px",
          textAlign: "center",
          backgroundColor: "#F5EAD2",
          minHeight: "100vh",
        }}>
          <p style={{ color: "#57534E", fontWeight: "700" }}>Chargement...</p>
        </div>
      }
    >
      <ContenuRecherche />
    </Suspense>
  );
      }
