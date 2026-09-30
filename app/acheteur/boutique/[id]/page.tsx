import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

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

  const produits = await prisma.produit.findMany({
    where: { vendeurId: vendeur.id, actif: true },
    orderBy: { createdAt: "desc" },
  });

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") {
      return `${prix.toFixed(2)} $`;
    }
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  return (
    <div className="container" style={{ padding: "20px 16px" }}>
      <Link href="/" style={{ color: "#2563eb", fontSize: "14px" }}>
        ← Retour à l'accueil
      </Link>

      <div style={{ marginTop: "16px", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
          🏪 {vendeur.nomBoutique}
        </h1>
        {vendeur.description && (
          <p style={{ color: "#6b7280", marginBottom: "4px" }}>{vendeur.description}</p>
        )}
        {vendeur.adresse && (
          <p style={{ color: "#9ca3af", fontSize: "13px" }}>📍 {vendeur.adresse}</p>
        )}
      </div>

      {produits.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>📦</p>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            Aucun produit pour le moment
          </p>
          <p style={{ color: "#6b7280" }}>
            Cette boutique n'a pas encore publié d'articles.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "12px",
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
                className="card"
                style={{ padding: "0", overflow: "hidden", textDecoration: "none", color: "inherit", position: "relative" }}
              >
                {enPromo && (
                  <span style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    zIndex: 2,
                  }}>
                    -{pourcentage}%
                  </span>
                )}

                {p.photo1 ? (
                  <img
                    src={p.photo1}
                    alt={p.nom}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "contain",
                      backgroundColor: "#f3f4f6",
                      display: "block",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "160px",
                    backgroundColor: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "40px",
                  }}>
                    📦
                  </div>
                )}

                <div style={{ padding: "12px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                    {p.nom}
                  </h3>

                  {enPromo ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "16px", fontWeight: "bold", color: "#16a34a" }}>
                        {formaterPrix(p.prixPromo!, p.devise)}
                      </span>
                      <span style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        textDecoration: "line-through",
                      }}>
                        {formaterPrix(p.prix, p.devise)}
                      </span>
                    </div>
                  ) : (
                    <p style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb" }}>
                      {formaterPrix(p.prix, p.devise)}
                    </p>
                  )}

                  {p.stock === 0 && (
                    <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px" }}>
                      Rupture de stock
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
                  }
