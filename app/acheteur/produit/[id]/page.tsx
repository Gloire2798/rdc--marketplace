import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import GaleriePhotos from "./GaleriePhotos";

export default async function FicheProduit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const produit = await prisma.produit.findUnique({
    where: { id },
    include: {
      vendeur: true,
    },
  });

  if (!produit || !produit.actif) {
    notFound();
  }

  const photos = [produit.photo1, produit.photo2, produit.photo3].filter(
    (p): p is string => p !== null
  );

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") {
      return `${prix.toFixed(2)} $`;
    }
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  return (
    <div className="container" style={{ padding: "20px 16px", maxWidth: "600px" }}>
      <Link
        href={`/acheteur/boutique/${produit.vendeur.id}`}
        style={{ color: "#2563eb", fontSize: "14px" }}
      >
        ← Retour à {produit.vendeur.nomBoutique}
      </Link>

      <div style={{ marginTop: "16px", marginBottom: "24px" }}>
        <GaleriePhotos photos={photos} nomProduit={produit.nom} />
      </div>

      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
        {produit.nom}
      </h1>

      {produit.description && (
        <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "16px" }}>
          {produit.description}
        </p>
      )}

      <p style={{ fontSize: "28px", fontWeight: "bold", color: "#2563eb", marginBottom: "8px" }}>
        {formaterPrix(produit.prix, produit.devise)}
      </p>

      <p style={{
        fontSize: "14px",
        color: produit.stock > 0 ? "#16a34a" : "#dc2626",
        fontWeight: "600",
        marginBottom: "24px",
      }}>
        {produit.stock > 0
          ? `✅ En stock (${produit.stock} disponible${produit.stock > 1 ? "s" : ""})`
          : "❌ Rupture de stock"}
      </p>

      <div
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
          Vendu par
        </p>
        <Link
          href={`/acheteur/boutique/${produit.vendeur.id}`}
          style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}
        >
          🏪 {produit.vendeur.nomBoutique}
        </Link>
      </div>

      <button
        disabled={produit.stock === 0}
        style={{
          width: "100%",
          backgroundColor: produit.stock > 0 ? "#2563eb" : "#9ca3af",
          color: "white",
          padding: "16px",
          borderRadius: "12px",
          border: "none",
          fontWeight: "600",
          fontSize: "16px",
          cursor: produit.stock > 0 ? "pointer" : "not-allowed",
        }}
      >
        🛒 Ajouter au panier
      </button>

      <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "12px", marginTop: "12px" }}>
        (Le panier sera activé très bientôt)
      </p>
    </div>
  );
      }
