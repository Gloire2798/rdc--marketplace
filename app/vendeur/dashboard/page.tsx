import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardVendeur() {
  const session = await getSession();

  if (!session) {
    redirect("/vendeur/connexion");
  }

  if (session.role !== "VENDEUR") {
    redirect("/");
  }

  const vendeur = await prisma.vendeur.findUnique({
    where: { userId: session.id },
  });

  return (
    <div className="container" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
        Bonjour {session.nom}
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Bienvenue sur votre tableau de bord GK Sensei.
      </p>

      {!vendeur?.actif && (
        <div style={{
          backgroundColor: "#fef3c7",
          color: "#92400e",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}>
          ⏳ <strong>Votre boutique est en attente de validation.</strong>
          <br />
          L'administrateur va vérifier vos informations et activer votre boutique sous peu.
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "16px",
      }}>
        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Boutique</p>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginTop: "4px" }}>
            {vendeur?.nomBoutique || "Non définie"}
          </h2>
        </div>

        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Statut</p>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginTop: "4px" }}>
            {vendeur?.actif ? "✅ Active" : "⏳ En attente"}
          </h2>
        </div>

        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Produits</p>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginTop: "4px" }}>
            0
          </h2>
        </div>

        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Commandes</p>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginTop: "4px" }}>
            0
          </h2>
        </div>
      </div>

      <div style={{ marginTop: "32px" }}>
        <Link
          href="/vendeur/produits"
          className="btn btn-primary"
          style={{ marginRight: "12px" }}
        >
          Ajouter un produit
        </Link>
      </div>
    </div>
  );
}
