import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import LogoBoutique from "@/app/components/LogoBoutique";
import { getSession } from "@/lib/auth";

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

  // Si c'est le propriétaire de la boutique, rediriger vers son dashboard
  const session = await getSession();
  if (session && session.role === "VENDEUR" && session.id === vendeur.userId) {
    redirect("/vendeur/dashboard");
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
    <div style={{ padding: "16px 14px", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
      <Link href="/" style={{ color: "#1D4ED8", fontSize: "12px", fontWeight: "700" }}>
        ← Retour à l&apos;accueil
      </Link>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginTop: "16px",
        marginBottom: "20px",
      }}>
        <LogoBoutique nom={vendeur.nomBoutique} taille={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: "18px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "3px",
          }}>
            {vendeur.nomBoutique}
          </h1>
          {vendeur.description && (
            <p style={{ color: "#57534E", fontSize: "12px", fontWeight: "500", marginBottom: "2px" }}>
              {vendeur.description}
            </p>
          )}
          {vendeur.adresse && (
            <p style={{ color: "#78716C", fontSize: "11px" }}>📍 {vendeur.adresse}</p>
          )}
        </div>
      </div>

      {produits.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "40px 20px",
          borderRadius: "12px",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>
            Aucun produit pour le moment
          </p>
          <p style={{ color: "#78716C", fontSize: "12px" }}>
            Cette boutique n&apos;a pas encore publié d&apos;articles.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "10px",
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
                  border: "1px solid #E8DFC8",
                  boxShadow: "0 1px 3px rgba(120, 100, 60, 0.05)",
                }}
              >
                {enPromo && (
                  <span style={{
                    position: "absolute",
                    top: "6px",
                    left: "6px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "2px 7px",
                    borderRadius: "5px",
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
                      height: "130px",
                      objectFit: "contain",
                      backgroundColor: "#F8FAFC",
                      display: "block",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "130px",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                  }}>
                    📦
                  </div>
                )}

                <div style={{ padding: "8px 10px 10px 10px" }}>
                  <h3 style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    marginBottom: "4px",
                    color: "#0F172A",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {p.nom}
                  </h3>

                  {enPromo ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: "#16a34a" }}>
                        {formaterPrix(p.prixPromo!, p.devise)}
                      </span>
                      <span style={{ fontSize: "10px", color: "#94a3b8", textDecoration: "line-through" }}>
                        {formaterPrix(p.prix, p.devise)}
                      </span>
                    </div>
                  ) : (
                    <p style={{ fontSize: "13px", fontWeight: "800", color: "#1D4ED8" }}>
                      {formaterPrix(p.prix, p.devise)}
                    </p>
                  )}

                  {p.stock === 0 && (
                    <p style={{ fontSize: "10px", color: "#dc2626", marginTop: "3px", fontWeight: "700" }}>
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
