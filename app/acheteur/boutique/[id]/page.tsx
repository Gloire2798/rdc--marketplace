import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import LogoBoutique from "@/app/components/LogoBoutique";
import BoutonSuivre from "@/app/components/BoutonSuivre";
import { getSession } from "@/lib/auth";
import { MapPin, ArrowLeft, Package } from "lucide-react";

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

  // Vérifier si le client est déjà abonné
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #FFFFFF 0%, #FDF6EC 100%)",
      paddingBottom: "30px",
    }}>
      {/* BANNIÈRE COUVERTURE */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "160px",
        backgroundColor: "#0F172A",
        overflow: "hidden",
      }}>
        {vendeur.photoCouverture ? (
          <img
            src={vendeur.photoCouverture}
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
            {/* Skyline fallback si pas de couverture */}
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

        {/* Bouton retour par-dessus */}
        <Link
          href="/"
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: "white",
            border: "1.5px solid #0F172A",
            borderRadius: "20px",
            padding: "6px 10px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            textDecoration: "none",
            color: "#0F172A",
            fontSize: "10.5px",
            fontWeight: "900",
            boxShadow: "2px 2px 0 #F59E0B",
          }}
        >
          <ArrowLeft size={12} strokeWidth={3} />
          Retour
        </Link>
      </div>

      {/* CARTE IDENTITÉ BOUTIQUE */}
      <div style={{
        padding: "0 14px",
        marginTop: "-40px",
        position: "relative",
        zIndex: 2,
      }}>
        <div style={{
          backgroundColor: "white",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "10px",
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "24px",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #F59E0B, 0 6px 24px rgba(15, 23, 42, 0.10)",
          padding: "16px 14px 14px 14px",
        }}>
          {/* Logo + nom */}
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}>
            <div style={{
              flexShrink: 0,
              backgroundColor: "white",
              borderRadius: "50%",
              border: "2px solid #0F172A",
              padding: "3px",
            }}>
              <LogoBoutique nom={vendeur.nomBoutique} taille={54} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontSize: "17px",
                fontWeight: "900",
                color: "#0F172A",
                marginBottom: "4px",
                letterSpacing: "-0.4px",
                lineHeight: 1.15,
              }}>
                {vendeur.nomBoutique}
              </h1>

              {vendeur.adresse && (
                <p style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#64748B",
                  fontSize: "10.5px",
                  fontWeight: "700",
                  marginBottom: "6px",
                }}>
                  <MapPin size={11} strokeWidth={2.5} />
                  {vendeur.adresse}
                </p>
              )}

              {/* Bouton suivre */}
              <div style={{ marginTop: "2px" }}>
                <BoutonSuivre
                  vendeurId={vendeur.id}
                  estConnecte={estConnecte}
                  estClient={estClient}
                  suiviInitial={suiviInitial}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          {vendeur.description && (
            <p style={{
              color: "#334155",
              fontSize: "11.5px",
              fontWeight: "500",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px dashed #E2E8F0",
            }}>
              {vendeur.description}
            </p>
          )}
        </div>
      </div>

      {/* SECTION PRODUITS */}
      <div style={{ padding: "20px 14px 0 14px" }}>
        <h2 style={{
          fontSize: "12px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "10px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{
            display: "inline-block",
            width: "3px",
            height: "14px",
            backgroundColor: "#EA580C",
            borderRadius: "2px",
          }} />
          Nos articles
          <span style={{
            fontSize: "10px",
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
            borderRadius: "14px",
            border: "1.5px solid #0F172A",
            boxShadow: "3px 3px 0 #F59E0B",
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
                    borderRadius: "10px",
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    position: "relative",
                    border: "1.5px solid #0F172A",
                    boxShadow: "2px 2px 0 #F59E0B",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {enPromo && (
                    <span style={{
                      position: "absolute",
                      top: "5px",
                      left: "5px",
                      backgroundColor: "#DC2626",
                      color: "white",
                      fontSize: "8.5px",
                      fontWeight: "900",
                      padding: "2px 5px",
                      borderRadius: "4px",
                      zIndex: 2,
                      letterSpacing: "0.2px",
                    }}>
                      -{pourcentage}%
                    </span>
                  )}

                  {p.photo1 ? (
                    <div style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      backgroundColor: "#FEFCF8",
                      overflow: "hidden",
                      borderBottom: "1px solid #F1ECE0",
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
                          padding: "4px",
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
                      borderBottom: "1px solid #F1ECE0",
                    }}>
                      <Package size={24} color="#CBD5E1" strokeWidth={2} />
                    </div>
                  )}

                  <div style={{ padding: "6px 7px 8px 7px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <h3 style={{
                      fontSize: "10.5px",
                      fontWeight: "800",
                      marginBottom: "4px",
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
                        <span style={{ fontSize: "11px", fontWeight: "900", color: "#16A34A", lineHeight: 1.1 }}>
                          {formaterPrix(p.prixPromo!, p.devise)}
                        </span>
                        <span style={{ fontSize: "8.5px", color: "#94A3B8", textDecoration: "line-through", fontWeight: "700", lineHeight: 1.1 }}>
                          {formaterPrix(p.prix, p.devise)}
                        </span>
                      </div>
                    ) : (
                      <p style={{ fontSize: "11px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.1 }}>
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
