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

  if (!vendeur) {
    redirect("/vendeur/connexion");
  }

  const nombreProduits = await prisma.produit.count({
    where: { vendeurId: vendeur.id },
  });

  const nombreCommandes = await prisma.commande.count({
    where: { vendeurId: vendeur.id },
  });

  return (
    <div className="container" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
        Bonjour {session.nom}
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Bienvenue sur votre tableau de bord GK Sensei.
      </p>

      {!vendeur.actif && (
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
            {vendeur.nomBoutique}
          </h2>
        </div>

        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Statut</p>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginTop: "4px" }}>
            {vendeur.actif ? "✅ Active" : "⏳ En attente"}
          </h2>
        </div>

        <Link href="/vendeur/produits" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card" style={{ cursor: "pointer" }}>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Produits</p>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginTop: "4px" }}>
              {nombreProduits}
            </h2>
          </div>
        </Link>

        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Commandes</p>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginTop: "4px" }}>
            {nombreCommandes}
          </h2>
        </div>
      </div>

      <div style={{ marginTop: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link href="/vendeur/produits/nouveau" className="btn btn-primary">
          Ajouter un produit
        </Link>
        <Link href="/vendeur/produits" className="btn" style={{
          backgroundColor: "white",
          color: "#2563eb",
          border: "1px solid #2563eb",
        }}>
          Voir mes produits
        </Link>
      </div>
    </div>
  );
}
