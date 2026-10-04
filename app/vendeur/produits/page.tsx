import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

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
    <div style={{ padding: "16px 14px 100px 14px", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
      <Link
        href="/vendeur/dashboard"
        style={{ color: "#1D4ED8", fontSize: "11.5px", fontWeight: "700", textDecoration: "none" }}
      >
        ← Retour au tableau de bord
      </Link>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "12px",
        marginBottom: "16px",
        gap: "8px",
        flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", marginBottom: "2px" }}>
            Mes produits
          </h1>
          <p style={{ color: "#64748b", fontSize: "11.5px", fontWeight: "600" }}>
            {produits.length} produit{produits.length > 1 ? "s" : ""}
          </p>
        </div>

        <Link
          href="/vendeur/produits/nouveau"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            backgroundColor: "#1D4ED8",
            color: "white",
            padding: "8px 12px",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "11.5px",
            fontWeight: "800",
          }}
        >
          <Plus size={14} strokeWidth={3} />
          Ajouter
        </Link>
      </div>

      {produits.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px 20px",
          textAlign: "center",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "40px", marginBottom: "10px" }}>📦</p>
          <p style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "4px" }}>
            Aucun produit
          </p>
          <p style={{ color: "#64748b", fontSize: "11.5px", fontWeight: "500", marginBottom: "16px" }}>
            Ajoutez votre premier produit pour commencer à vendre.
          </p>
          <Link
            href="/vendeur/produits/nouveau"
            style={{
              display: "inline-block",
              backgroundColor: "#1D4ED8",
              color: "white",
              padding: "10px 20px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: "800",
            }}
          >
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
              <div key={p.id} style={{ display: "flex", flexDirection: "column" }}>
                {/* Carte produit */}
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid #E8DFC8",
                  boxShadow: "0 1px 2px rgba(120, 100, 60, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}>
                  {/* Badge promo */}
                  {enPromo && (
                    <span style={{
                      position: "absolute",
                      top: "4px",
                      left: "4px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      fontSize: "8.5px",
                      fontWeight: "800",
                      padding: "2px 5px",
                      borderRadius: "4px",
                      zIndex: 2,
                    }}>
                      -{pourcentage}%
                    </span>
                  )}

                  {/* Photo */}
                  {p.photo1 ? (
                    <div style={{
                      width: "100%",
                      height: "100px",
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
                          display: "block",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100px",
                      backgroundColor: "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}>
                      📦
                    </div>
                  )}

                  {/* Contenu */}
                  <div style={{ padding: "6px 7px 7px 7px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <h3 style={{
                      fontSize: "10.5px",
                      fontWeight: "700",
                      marginBottom: "3px",
                      color: "#0F172A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.2,
                    }}>
                      {p.nom}
                    </h3>

                    {enPromo ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#16a34a", lineHeight: 1.1 }}>
                          {formaterPrix(p.prixPromo!, p.devise)}
                        </span>
                        <span style={{ fontSize: "8.5px", color: "#94a3b8", textDecoration: "line-through", lineHeight: 1.1 }}>
                          {formaterPrix(p.prix, p.devise)}
                        </span>
                      </div>
                    ) : (
                      <p style={{ fontSize: "11px", fontWeight: "800", color: "#1D4ED8", lineHeight: 1.1 }}>
                        {formaterPrix(p.prix, p.devise)}
                      </p>
                    )}

                    <p style={{
                      fontSize: "9px",
                      color: p.stock > 0 ? "#16a34a" : "#dc2626",
                      fontWeight: "700",
                      marginTop: "3px",
                    }}>
                      {p.stock > 0 ? `✅ ${p.stock} en stock` : "❌ Rupture"}
                    </p>
                  </div>
                </div>

                {/* Bouton Modifier EN DESSOUS */}
                <Link
                  href={`/vendeur/produits/${p.id}/modifier`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "3px",
                    marginTop: "4px",
                    padding: "6px 4px",
                    backgroundColor: "#1D4ED8",
                    color: "white",
                    borderRadius: "7px",
                    textDecoration: "none",
                    fontSize: "10px",
                    fontWeight: "800",
                  }}
                >
                  <Pencil size={10} strokeWidth={2.5} />
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
