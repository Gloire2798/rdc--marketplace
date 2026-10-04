import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CarteBoutique from "@/app/components/CarteBoutique";

// ============================================================
// RÉCUPÉRATION DES BOUTIQUES (avec cache 30 sec)
// ============================================================
const getBoutiques = unstable_cache(
  async () => {
    const vendeurs = await prisma.vendeur.findMany({
      where: { actif: true },
      select: {
        id: true,
        nomBoutique: true,
        description: true,
        adresse: true,
        photoCouverture: true,
        photo2: true,
        photo3: true,
        _count: { select: { produits: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return vendeurs.map((v) => ({
      id: v.id,
      nomBoutique: v.nomBoutique,
      description: v.description,
      adresse: v.adresse,
      photoCouverture: v.photoCouverture,
      photo2: v.photo2,
      photo3: v.photo3,
      nombreProduits: v._count.produits,
    }));
  },
  ["boutiques-liste"],
  {
    revalidate: 30,
    tags: ["boutiques"],
  }
);

export default async function PageBoutiques() {
  const boutiques = await getBoutiques();

  return (
    <div style={{ backgroundColor: "#FAF5E8", minHeight: "100vh", padding: "18px 14px 20px 14px" }}>
      <div style={{ marginBottom: "18px" }}>
        <h1 style={{
          fontSize: "20px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "4px",
          letterSpacing: "-0.4px",
        }}>
          Nos boutiques
        </h1>
        <p style={{ fontSize: "11.5px", color: "#78716C", fontWeight: "600" }}>
          {boutiques.length} boutique{boutiques.length > 1 ? "s" : ""} disponible{boutiques.length > 1 ? "s" : ""}
        </p>
      </div>

      {boutiques.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "40px 20px",
          borderRadius: "12px",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
            Aucune boutique pour le moment
          </p>
          <p style={{ color: "#78716C", fontSize: "11px" }}>
            Les boutiques apparaîtront ici dès qu&apos;elles seront validées.
          </p>
        </div>
      ) : (
        <div>
          {boutiques.map((boutique) => (
            <CarteBoutique key={boutique.id} boutique={boutique} />
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <Link
          href="/"
          style={{
            color: "#1D4ED8",
            fontSize: "11.5px",
            fontWeight: "700",
            textDecoration: "none",
          }}
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
