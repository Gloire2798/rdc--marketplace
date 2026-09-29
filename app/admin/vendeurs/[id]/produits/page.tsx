import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoutonSupprimerProduit from "./BoutonSupprimerProduit";

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
    <div className="container" style={{ padding: "40px 16px" }}>
      <Link href="/admin/dashboard" style={{ color: "#2563eb", fontSize: "14px" }}>
        ← Retour à l'admin
      </Link>

      <div style={{ marginTop: "16px", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }}>
          {vendeur.nomBoutique}
        </h1>
        <p style={{ color: "#6b7280" }}>
          Par : {vendeur.user.nom || "Non renseigné"} — {produits.length} produit{produits.length > 1 ? "s" : ""} en ligne
        </p>
      </div>

      {produits.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>📦</p>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            Aucun produit dans cette boutique
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}>
          {produits.map((p) => (
            <div key={p.id} className="card" style={{ padding: "0", overflow: "hidden" }}>
              {p.photo1 ? (
                <img
                  src={p.photo1}
                  alt={p.nom}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "contain",
                    backgroundColor: "#f3f4f6",
                    display: "block",
                  }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                }}>
                  📦
                </div>
              )}

              <div style={{ padding: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
                  {p.nom}
                </h3>
                {p.description && (
                  <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "8px" }}>
                    {p.description.length > 60
                      ? p.description.slice(0, 60) + "..."
                      : p.description}
                  </p>
                )}
                <p style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb", marginBottom: "8px" }}>
                  {formaterPrix(p.prix, p.devise)}
                </p>
                <p style={{
                  fontSize: "13px",
                  color: p.stock > 0 ? "#16a34a" : "#dc2626",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}>
                  {p.stock > 0 ? `✅ ${p.stock} en stock` : "❌ Rupture de stock"}
                </p>

                <BoutonSupprimerProduit produitId={p.id} nomProduit={p.nom} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
        }
