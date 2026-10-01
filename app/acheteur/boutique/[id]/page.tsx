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
    <div style={{ padding: "16px 12px", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
      <Link href="/" style={{ color: "#1D4ED8", fontSize: "12px", fontWeight: "700" }}>
        ← Retour à l&apos;accueil
      </Link>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "14px",
        marginBottom: "18px",
      }}>
        <LogoBoutique nom={vendeur.nomBoutique} taille={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: "16px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "2px",
          }}>
            {vendeur.nomBoutique}
          </h1>
          {vendeur.description && (
            <p style={{
              color: "#57534E",
              fontSize: "11px",
              fontWeight: "500",
              lineHeight: 1.3,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
              {vendeur.description}
            </p>
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
          <p style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
            Aucun produit pour le moment
          </p>
          <p style={{ color: "#78716C", fontSize: "11px" }}>
            Cette boutique n&apos;a pas encore publié d&apos;articles.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "6px",
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
                  borderRadius: "8px",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  position: "relative",
                  border: "1px solid #E8DFC8",
                  boxShadow: "0 1px 2px rgba(120, 100, 60, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {enPromo && (
                  <span style={{
                    position: "absolute",
                    top: "3px",
                    left: "3px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    fontSize: "8px",
                    fontWeight: "800",
                    padding: "1px 4px",
                    borderRadius: "3px",
                    zIndex: 2,
                  }}>
                    -{pourcentage}%
                  </span>
                )}

                {p.photo1 ? (
                  <div style={{
                    width: "100%",
                    height: "80px",
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
                        objectPosition: "center",
                        display: "block",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: "100%",
                    height: "80px",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}>
                    📦
                  </div>
                )}

                <div style={{ padding: "5px 6px 7px 6px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <h3 style={{
                    fontSize: "9.5px",
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
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "#16a34a", lineHeight: 1.1 }}>
                        {formaterPrix(p.prixPromo!, p.devise)}
                      </span>
                      <span style={{ fontSize: "8px", color: "#94a3b8", textDecoration: "line-through", lineHeight: 1.1 }}>
                        {formaterPrix(p.prix, p.devise)}
                      </span>
                    </div>
                  ) : (
                    <p style={{ fontSize: "10px", fontWeight: "800", color: "#1D4ED8", lineHeight: 1.1 }}>
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
  );
      }
