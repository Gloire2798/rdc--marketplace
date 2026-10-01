import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import GaleriePhotos from "./GaleriePhotos";
import BoutonPanier from "./BoutonPanier";

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

  const enPromo =
    produit.prixPromo !== null && produit.prixPromo < produit.prix;
  const pourcentage = enPromo
    ? Math.round(((produit.prix - produit.prixPromo!) / produit.prix) * 100)
    : 0;

  const article = {
    produitId: produit.id,
    vendeurId: produit.vendeurId,
    nom: produit.nom,
    prix: produit.prix,
    prixPromo: produit.prixPromo,
    devise: produit.devise,
    photo: produit.photo1,
    nomBoutique: produit.vendeur.nomBoutique,
  };

  return (
    <div style={{
      padding: "12px 14px 20px 14px",
      backgroundColor: "#FAF5E8",
      minHeight: "100vh",
      maxWidth: "600px",
      margin: "0 auto",
    }}>
      <Link
        href={`/acheteur/boutique/${produit.vendeur.id}`}
        style={{ color: "#1D4ED8", fontSize: "11px", fontWeight: "700", display: "inline-block", marginBottom: "10px" }}
      >
        ← Retour à {produit.vendeur.nomBoutique}
      </Link>

      <div style={{ marginBottom: "12px" }}>
        <GaleriePhotos photos={photos} nomProduit={produit.nom} />
      </div>

      <h1 style={{
        fontSize: "16px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "4px",
        lineHeight: 1.25,
      }}>
        {produit.nom}
      </h1>

      {produit.description && (
        <p style={{
          color: "#57534E",
          fontSize: "11.5px",
          fontWeight: "500",
          marginBottom: "10px",
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
        }}>
          {produit.description}
        </p>
      )}

      {enPromo ? (
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#16a34a", lineHeight: 1 }}>
              {formaterPrix(produit.prixPromo!, produit.devise)}
            </span>
            <span style={{
              fontSize: "12px",
              color: "#94a3b8",
              textDecoration: "line-through",
            }}>
              {formaterPrix(produit.prix, produit.devise)}
            </span>
            <span style={{
              backgroundColor: "#dc2626",
              color: "white",
              fontSize: "10px",
              fontWeight: "800",
              padding: "2px 7px",
              borderRadius: "5px",
            }}>
              -{pourcentage}%
            </span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: "20px", fontWeight: "900", color: "#1D4ED8", marginBottom: "8px", lineHeight: 1 }}>
          {formaterPrix(produit.prix, produit.devise)}
        </p>
      )}

      <p style={{
        fontSize: "11px",
        color: produit.stock > 0 ? "#16a34a" : "#dc2626",
        fontWeight: "700",
        marginBottom: "12px",
      }}>
        {produit.stock > 0
          ? `✅ En stock (${produit.stock})`
          : "❌ Rupture de stock"}
      </p>

      <Link
        href={`/acheteur/boutique/${produit.vendeur.id}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "8px 10px",
          marginBottom: "14px",
          textDecoration: "none",
          color: "inherit",
          border: "1px solid #E8DFC8",
        }}
      >
        <span style={{ fontSize: "14px" }}>🏪</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "9.5px", color: "#78716C", fontWeight: "600" }}>
            Vendu par
          </p>
          <p style={{
            fontSize: "12px",
            fontWeight: "800",
            color: "#0F172A",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {produit.vendeur.nomBoutique}
          </p>
        </div>
        <span style={{ fontSize: "11px", color: "#1D4ED8", fontWeight: "700" }}>→</span>
      </Link>

      <BoutonPanier article={article} stock={produit.stock} />
    </div>
  );
}
