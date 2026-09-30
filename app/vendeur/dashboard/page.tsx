import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoBoutique from "@/app/components/LogoBoutique";

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
    where: { vendeurId: vendeur.id, statut: { not: "ANNULE" } },
  });

  return (
    <div className="container" style={{ padding: "20px 14px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
      }}>
        <LogoBoutique nom={vendeur.nomBoutique} taille={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: "18px",
            fontWeight: "800",
            color: "#0F172A",
            marginBottom: "2px",
          }}>
            Bonjour {session.nom}
          </h1>
          <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
            {vendeur.nomBoutique}
          </p>
        </div>
      </div>

      {!vendeur.actif && (
        <div style={{
          backgroundColor: "#FEF3C7",
          color: "#78350F",
          padding: "12px",
          borderRadius: "10px",
          marginBottom: "16px",
          border: "1px solid #FDE68A",
        }}>
          <p style={{ fontWeight: "700", fontSize: "13px", marginBottom: "4px" }}>
            ⏳ Boutique en attente de validation
          </p>
          <p style={{ fontSize: "11px" }}>
            L&apos;administrateur va vérifier vos informations sous peu.
          </p>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        marginBottom: "16px",
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "12px",
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}>
          <p style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", marginBottom: "3px" }}>
            Statut
          </p>
          <p style={{
            fontSize: "14px",
            fontWeight: "800",
            color: vendeur.actif ? "#16a34a" : "#c2410c",
          }}>
            {vendeur.actif ? "✅ Active" : "⏳ En attente"}
          </p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "12px",
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}>
          <p style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", marginBottom: "3px" }}>
            Produits
          </p>
          <p style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A" }}>
            {nombreProduits}
          </p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "12px",
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}>
          <p style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", marginBottom: "3px" }}>
            Commandes
          </p>
          <p style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A" }}>
            {nombreCommandes}
          </p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "12px",
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}>
          <p style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", marginBottom: "3px" }}>
            Téléphone
          </p>
          <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A" }}>
            {vendeur.telephone}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Link
          href="/vendeur/produits/nouveau"
          style={{
            backgroundColor: "#1D4ED8",
            color: "white",
            padding: "12px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          + Ajouter un produit
        </Link>

        <Link
          href="/vendeur/produits"
          style={{
            backgroundColor: "white",
            color: "#1D4ED8",
            border: "1.5px solid #1D4ED8",
            padding: "12px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          📦 Voir mes produits
        </Link>

        <Link
          href="/vendeur/commandes"
          style={{
            backgroundColor: "white",
            color: "#1D4ED8",
            border: "1.5px solid #1D4ED8",
            padding: "12px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          🛒 Voir mes commandes
        </Link>
      </div>
    </div>
  );
}
