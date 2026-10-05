import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoutonSupprimerProduit from "./BoutonSupprimerProduit";
import { ArrowLeft, Package, User, CheckCircle, XCircle } from "lucide-react";

export default async function ProduitsVendeur({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const { id } = await params;

  const vendeur = await prisma.vendeur.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!vendeur) {
    redirect("/admin/dashboard");
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
    <div style={{
      padding: "16px 12px 100px 12px",
      backgroundColor: "#F5EAD2",
      minHeight: "100vh",
      maxWidth: "600px",
      margin: "0 auto",
    }}>
      {/* Lien retour */}
      <Link
        href="/admin/dashboard"
        style={{
          color: "#0F172A",
          fontSize: "11px",
          fontWeight: "800",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <ArrowLeft size={12} strokeWidth={2.8} />
        Retour à l&apos;admin
      </Link>

      {/* Header */}
      <div style={{ marginTop: "14px", marginBottom: "18px" }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "4px",
          letterSpacing: "-0.4px",
        }}>
          {vendeur.nomBoutique}
        </h1>
        <p style={{
          color: "#57534E",
          fontSize: "11.5px",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          flexWrap: "wrap",
        }}>
          <User size={11} strokeWidth={2.8} />
          {vendeur.user.nom || "Non renseigné"}
          <span style={{ color: "#D4C5A0" }}>·</span>
          <Package size={11} strokeWidth={2.8} />
          {produits.length} produit{produits.length > 1 ? "s" : ""} en ligne
        </p>
      </div>

      {/* Liste produits */}
      {produits.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "50px 20px",
          borderRadius: "20px",
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
            <Package size={30} color="#EA580C" strokeWidth={2} />
          </div>
          <p style={{
            fontSize: "14px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "4px",
          }}>
            Aucun produit
          </p>
          <p style={{
            fontSize: "11.5px",
            color: "#57534E",
            fontWeight: "700",
          }}>
            Cette boutique n&apos;a pas encore publié de produits.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}>
          {produits.map((p) => (
            <div key={p.id} style={{
              backgroundColor: "white",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1.5px solid #0F172A",
              boxShadow: "2px 2px 0 #EA580C",
              display: "flex",
              flexDirection: "column",
            }}>
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
                  <Package size={28} color="#CBD5E1" strokeWidth={2} />
                </div>
              )}

              {/* Contenu */}
              <div style={{
                padding: "10px 10px 12px 10px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}>
                <h3 style={{
                  fontSize: "12px",
                  fontWeight: "900",
                  color: "#0F172A",
                  marginBottom: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                }}>
                  {p.nom}
                </h3>

                {p.description && (
                  <p style={{
                    color: "#57534E",
                    fontSize: "10.5px",
                    fontWeight: "700",
                    marginBottom: "6px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.3,
                  }}>
                    {p.description}
                  </p>
                )}

                <p style={{
                  fontSize: "13px",
                  fontWeight: "900",
                  color: "#EA580C",
                  marginBottom: "6px",
                  letterSpacing: "-0.2px",
                }}>
                  {formaterPrix(p.prix, p.devise)}
                </p>

                {/* Stock */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "10.5px",
                  fontWeight: "900",
                  color: p.stock > 0 ? "#16A34A" : "#DC2626",
                  marginBottom: "10px",
                }}>
                  {p.stock > 0 ? (
                    <>
                      <CheckCircle size={11} strokeWidth={3} />
                      {p.stock} en stock
                    </>
                  ) : (
                    <>
                      <XCircle size={11} strokeWidth={3} />
                      Rupture
                    </>
                  )}
                </div>

                {/* Bouton supprimer */}
                <div style={{ marginTop: "auto" }}>
                  <BoutonSupprimerProduit produitId={p.id} nomProduit={p.nom} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
              }
