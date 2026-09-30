import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CompteClient() {
  const session = await getSession();

  if (!session) {
    redirect("/vendeur/connexion");
  }

  if (session.role !== "ACHETEUR") {
    if (session.role === "VENDEUR") redirect("/vendeur/dashboard");
    if (session.role === "ADMIN") redirect("/admin/dashboard");
  }

  const commandes = await prisma.commande.findMany({
    where: { acheteurId: session.id },
    include: {
      vendeur: true,
      items: {
        include: {
          produit: true,
        },
      },
    },
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
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
        Bonjour {session.nom}
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Bienvenue dans votre espace client GK Sensei.
      </p>

      <div className="card" style={{ marginBottom: "24px" }}>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "4px" }}>
          Téléphone
        </p>
        <p style={{ fontSize: "16px", fontWeight: "600" }}>
          {session.telephone}
        </p>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
        Mes commandes ({commandes.length})
      </h2>

      {commandes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>🛍️</p>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            Aucune commande pour le moment
          </p>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            Découvrez nos boutiques et faites votre première commande.
          </p>
          <Link href="/" className="btn btn-primary">
            Voir les boutiques
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {commandes.map((c) => (
            <div key={c.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#6b7280" }}>
                    Commande #{c.id.slice(0, 8)}
                  </p>
                  <p style={{ fontSize: "16px", fontWeight: "600", marginTop: "4px" }}>
                    🏪 {c.vendeur.nomBoutique}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb" }}>
                    {formaterPrix(c.total, "FC")}
                  </p>
                  <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    {c.statut}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
              }
