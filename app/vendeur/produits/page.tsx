import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Package, CheckCircle, XCircle } from "lucide-react";

export default async function MesProduits() {
  const session = await getSession();

  if (!session || session.role !== "VENDEUR") {
    redirect("/vendeur/connexion");
  }

  const vendeur = await prisma.vendeur.findUnique({
    where: { userId: session.id },
  });

  if (!vendeur) {
    redirect("/vendeur/dashboard");
  }

  const produits = await prisma.produit.findMany({
    where: { vendeurId: vendeur.id },
    orderBy: { createdAt: "desc" },
  });

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") {
      return `${prix.toFixed(2)} $`;
    }
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  return (
    <div style={{ padding: "16px 10px 100px 10px", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
      <div style={{ padding: "0 4px" }}>
        <Link
          href="/vendeur/dashboard"
          style={{
            color: "#0F172A",
            fontSize: "11.5px",
            fontWeight: "800",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ← Retour au tableau de bord
        </Link>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "14px",
          marginBottom: "18px",
          gap: "8px",
          flexWrap: "wrap",
        }}>
          <div>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: "2px",
              letterSpacing: "-0.5px",
            }}>
              Mes produits
            </h1>
            <p style={{ color: "#57534E", fontSize: "12px", fontWeight: "700" }}>
              {produits.length} produit{produits.length > 1 ? "s" : ""}
            </p>
          </div>

          <Link
            href="/vendeur/produits/nouveau"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0F172A",
              color: "white",
              padding: "10px 14px",
              borderRadius: "24px",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: "900",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.20)",
            }}
          >
            <Plus size={14} strokeWidth={3} />
            Ajouter
          </Link>
        </div>
      </div>

      {produits.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "40px 20px",
          textAlign: "center",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
          margin: "0 4px",
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
            <Package size={30} color="#EA580C" strokeWidth={2} />
          </div>
          <p style={{
            fontSize: "15px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "6px",
          }}>
            Aucun produit
          </p>
          <p style={{
            color: "#57534E",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "18px",
          }}>
            Ajoutez votre premier produit pour commencer à vendre.
          </p>
          <Link
            href="/vendeur/produits/nouveau"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0F172A",
              color: "white",
              padding: "12px 20px",
              borderRadius: "24px",
              textDecoration: "none",
              fontSize: "12.5px",
              fontWeight: "900",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.20)",
            }}
          >
            <Plus size={14} strokeWidth={3} />
            Ajouter mon premier produit
          </Link>
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
              <div key={p.id} style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                {/* Carte produit */}
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: "1.5px solid #0F172A",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: "2px 2px 0 #EA580C",
                }}>
                  {/* Badge promo */}
                  {enPromo && (
                    <span style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      backgroundColor: "#0F172A",
                      color: "white",
                      fontSize: "9px",
                      fontWeight: "900",
                      padding: "2px 6px",
                      borderRadius: "8px",
                      zIndex: 2,
                      letterSpacing: "0.2px",
                    }}>
                      -{pourcentage}%
                    </span>
                  )}

                  {/* Photo */}
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
                    }}>
                      <Package size={24} color="#CBD5E1" strokeWidth={2} />
                    </div>
                  )}

                  {/* Contenu */}
                  <div style={{
                    padding: "8px 8px 10px 8px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minWidth: 0,
                  }}>
                    <h3 style={{
                      fontSize: "10.5px",
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
                      <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                        <span style={{
                          fontSize: "11.5px",
                          fontWeight: "900",
                          color: "#EA580C",
                          lineHeight: 1.1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {formaterPrix(p.prixPromo!, p.devise)}
                        </span>
                        <span style={{
                          fontSize: "9px",
                          color: "#94A3B8",
                          textDecoration: "line-through",
                          fontWeight: "700",
                          lineHeight: 1.1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {formaterPrix(p.prix, p.devise)}
                        </span>
                      </div>
                    ) : (
                      <p style={{
                        fontSize: "11.5px",
                        fontWeight: "900",
                        color: "#EA580C",
                        lineHeight: 1.1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {formaterPrix(p.prix, p.devise)}
                      </p>
                    )}

                    <div style={{
                      marginTop: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "9.5px",
                      fontWeight: "900",
                      color: p.stock > 0 ? "#16A34A" : "#DC2626",
                    }}>
                      {p.stock > 0 ? (
                        <>
                          <CheckCircle size={11} strokeWidth={3} />
                          {p.stock}
                        </>
                      ) : (
                        <>
                          <XCircle size={11} strokeWidth={3} />
                          Rupture
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bouton Modifier */}
                <Link
                  href={`/vendeur/produits/${p.id}/modifier`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    marginTop: "5px",
                    padding: "8px 6px",
                    backgroundColor: "#0F172A",
                    color: "white",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontSize: "10.5px",
                    fontWeight: "900",
                  }}
                >
                  <Pencil size={10} strokeWidth={3} />
                  Modifier
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
      }
