import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    <div className="container" style={{ padding: "40px 16px" }}>
      <a href="/vendeur/dashboard" style={{ color: "#2563eb", fontSize: "14px" }}>
        ← Retour au tableau de bord
      </a>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "16px",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }}>
            Mes produits
          </h1>
          <p style={{ color: "#6b7280" }}>
            {produits.length} produit{produits.length > 1 ? "s" : ""} dans votre boutique
          </p>
        </div>

        <Link href="/vendeur/produits/nouveau" className="btn btn-primary">
          + Ajouter un produit
        </Link>
      </div>

      {produits.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>📦</p>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            Aucun produit pour le moment
          </p>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            Ajoutez votre premier produit pour commencer à vendre.
          </p>
          <Link href="/vendeur/produits/nouveau" className="btn btn-primary">
            Ajouter mon premier produit
          </Link>
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

                <Link
                  href={`/vendeur/produits/${p.id}/modifier`}
                  style={{
                    display: "block",
                    width: "100%",
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "10px",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "14px",
                    textDecoration: "none",
                    boxSizing: "border-box",
                  }}
                >
                  ✏️ Modifier
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
