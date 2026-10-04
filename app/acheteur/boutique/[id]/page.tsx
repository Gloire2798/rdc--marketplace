import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import BoutonSuivre from "@/app/components/BoutonSuivre";
import { getSession } from "@/lib/auth";
import { MapPin, ArrowLeft, Package, Search, ShoppingCart } from "lucide-react";

export default async function PageBoutique({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendeur = await prisma.vendeur.findUnique({
    where: { id },
  });

  if (!vendeur || !vendeur.actif) {
    notFound();
  }

  const session = await getSession();
  if (session && session.role === "VENDEUR" && session.id === vendeur.userId) {
    redirect("/vendeur/dashboard");
  }

  const produits = await prisma.produit.findMany({
    where: { vendeurId: vendeur.id, actif: true },
    orderBy: { createdAt: "desc" },
  });

  let suiviInitial = false;
  if (session && session.role === "ACHETEUR") {
    const abonnement = await prisma.abonnement.findUnique({
      where: {
        userId_vendeurId: {
          userId: session.id,
          vendeurId: vendeur.id,
        },
      },
    });
    suiviInitial = !!abonnement;
  }

  const estConnecte = !!session;
  const estClient = session?.role === "ACHETEUR";

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") {
      return `${prix.toFixed(2)} $`;
    }
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  // Protection : URL valide uniquement
  const aUneCouverture =
    vendeur.photoCouverture &&
    typeof vendeur.photoCouverture === "string" &&
    vendeur.photoCouverture.startsWith("http");

  // Initiale de la boutique pour le logo carré
  const initiale = (vendeur.nomBoutique || "?").trim().charAt(0).toUpperCase();

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#FFFFFF",
      paddingBottom: "30px",
    }}>
      {/* HEADER NAVY */}
      <div style={{
        backgroundColor: "#0F172A",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={20} color="white" strokeWidth={2.5} />
        </Link>

        <h1 style={{
          flex: 1,
          fontSize: "18px",
          fontWeight: "900",
          color: "white",
          letterSpacing: "-0.3px",
        }}>
          Boutique
        </h1>

        <Link
          href="/recherche"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          <Search size={20} color="white" strokeWidth={2.5} />
        </Link>

        <Link
          href="/acheteur/panier"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          <ShoppingCart size={20} color="white" strokeWidth={2.5} />
        </Link>
      </div>

      {/* BANNIÈRE COUVERTURE */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "200px",
        backgroundColor: "#0F172A",
        overflow: "hidden",
      }}>
        {aUneCouverture ? (
          <img
            src={vendeur.photoCouverture!}
            alt={vendeur.nomBoutique}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        ) : (
          <>
            <div style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(234, 88, 12, 0.45) 0%, rgba(234, 88, 12, 0.10) 50%, transparent 75%)",
            }} />
            <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", opacity: 0.4 }}>
              <path d="M0 100 L0 65 L15 65 L15 45 L28 45 L28 60 L42 60 L42 30 L55 30 L55 50 L70 50 L70 20 L85 20 L85 45 L100 45 L100 35 L115 35 L115 55 L130 55 L130 25 L148 25 L148 50 L165 50 L165 15 L180 15 L180 40 L198 40 L198 30 L215 30 L215 55 L232 55 L232 35 L250 35 L250 60 L268 60 L268 40 L285 40 L285 65 L302 65 L302 45 L320 45 L320 25 L338 25 L338 50 L355 50 L355 35 L372 35 L372 60 L388 60 L388 45 L400 45 L400 100 Z" fill="#1E3A5F" />
            </svg>
          </>
        )}
      </div>

      {/* CARTE IDENTITÉ — chevauche la bannière */}
      <div style={{
        padding: "0 14px",
        marginTop: "-70px",
        position: "relative",
        zIndex: 2,
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "24px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
          padding: "18px 16px 16px 16px",
        }}>
          {/* Ligne : Logo carré noir + Nom */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              flexShrink: 0,
              width: "52px",
              height: "52px",
              backgroundColor: "#0F172A",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{
                fontSize: "26px",
                fontWeight: "900",
                color: "white",
                letterSpacing: "-1px",
                lineHeight: 1,
              }}>
                {initiale}
              </span>
            </div>

            <h1 style={{
              flex: 1,
              fontSize: "20px",
              fontWeight: "900",
              color: "#0F172A",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
              textTransform: "uppercase",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {vendeur.nomBoutique}
            </h1>
          </div>

          {/* Bouton Suivre */}
          <div style={{ marginTop: "12px" }}>
            <BoutonSuivre
              vendeurId={vendeur.id}
              estConnecte={estConnecte}
              estClient={estClient}
              suiviInitial={suiviInitial}
            />
          </div>

          {/* Description + adresse */}
          {(vendeur.adresse || vendeur.description) && (
            <div style={{
              marginTop: "14px",
              paddingTop: "14px",
              borderTop: "1px solid #F1F5F9",
            }}>
              {vendeur.adresse && (
                <p style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "700",
                  marginBottom: "6px",
                }}>
                  <MapPin size={12} strokeWidth={2.5} />
                  {vendeur.adresse}
                </p>
              )}

              {vendeur.description && (
                <p style={{
                  color: "#334155",
                  fontSize: "12.5px",
                  fontWeight: "500",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}>
                  {vendeur.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION PRODUITS */}
      <div style={{ padding: "22px 14px 0 14px" }}>
        <h2 style={{
          fontSize: "14px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "12px",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{
            display: "inline-block",
            width: "3px",
            height: "16px",
            backgroundColor: "#EA580C",
            borderRadius: "2px",
          }} />
          Nos articles
          <span style={{
            fontSize: "12px",
            color: "#64748B",
            fontWeight: "700",
            letterSpacing: "0",
            textTransform: "none",
          }}>
            ({produits.length})
          </span>
        </h2>

        {produits.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            textAlign: "center",
            padding: "40px 20px",
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
          }}>
            <Package size={28} color="#94A3B8" strokeWidth={2} style={{ margin: "0 auto 8px" }} />
            <p style={{ fontSize: "13px", fontWeight: "800", marginBottom: "4px", color: "#0F172A" }}>
              Aucun article pour le moment
            </p>
            <p style={{ color: "#64748B", fontSize: "11px", fontWeight: "600" }}>
              Cette boutique n&apos;a pas encore publié de produits.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
          }}>
            {produits.map((p) => {
              const enPromo = p.prixPromo !== null && p.prixPromo < p.prix;
              const pourcentage = enPromo
                ? Math.round(((p.prix - p.prixPromo!) / p.prix) * 100)
                : 0;

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
                    position: "relative",
                    border: "2px solid #0F172A",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {enPromo && (
                    <span style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      backgroundColor: "#0F172A",
                      color: "white",
                      fontSize: "9.5px",
                      fontWeight: "900",
                      padding: "3px 8px",
                      borderRadius: "10px",
                      zIndex: 2,
                      letterSpacing: "0.2px",
                    }}>
                      -{pourcentage}%
                    </span>
                  )}

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
                          objectPosition: "center",
                          display: "block",
                          padding: "6px",
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
                      <Package size={24} color="#CBD5E1" strokeWidth={2} />
                    </div>
                  )}

                  <div style={{
                    padding: "8px 9px 10px 9px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}>
                    <h3 style={{
                      fontSize: "11.5px",
                      fontWeight: "800",
                      marginBottom: "5px",
                      color: "#0F172A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.2,
                    }}>
                      {p.nom}
                    </h3>

                    {enPromo ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "900", color: "#EA580C", lineHeight: 1.1 }}>
                          {formaterPrix(p.prixPromo!, p.devise)}
                        </span>
                        <span style={{ fontSize: "10px", color: "#94A3B8", textDecoration: "line-through", fontWeight: "700", lineHeight: 1.1 }}>
                          {formaterPrix(p.prix, p.devise)}
                        </span>
                      </div>
                    ) : (
                      <p style={{ fontSize: "13px", fontWeight: "900", color: "#EA580C", lineHeight: 1.1 }}>
                        {formaterPrix(p.prix, p.devise)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
      }
