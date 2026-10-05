import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CarteBoutique from "@/app/components/CarteBoutique";
import { ArrowLeft, Store } from "lucide-react";

// ✅ Pas de cache : toujours frais
export const dynamic = "force-dynamic";

export default async function PageBoutiques() {
  // Requête directe, pas de cache
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

  const boutiques = vendeurs.map((v) => ({
    id: v.id,
    nomBoutique: v.nomBoutique,
    description: v.description,
    adresse: v.adresse,
    photoCouverture: v.photoCouverture,
    photo2: v.photo2,
    photo3: v.photo3,
    nombreProduits: v._count.produits,
  }));

  return (
    <div style={{ backgroundColor: "#F5EAD2", minHeight: "100vh", padding: "18px 14px 100px 14px" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "18px" }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "3px",
          letterSpacing: "-0.5px",
        }}>
          Nos boutiques
        </h1>
        <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700" }}>
          {boutiques.length} boutique{boutiques.length > 1 ? "s" : ""} disponible{boutiques.length > 1 ? "s" : ""}
        </p>
      </div>

      {boutiques.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "50px 20px",
          borderRadius: "20px",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#F5EAD2",
            marginBottom: "12px",
          }}>
            <Store size={30} color="#EA580C" strokeWidth={2} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "900", marginBottom: "6px", color: "#0F172A" }}>
            Aucune boutique pour le moment
          </p>
          <p style={{ color: "#57534E", fontSize: "11.5px", fontWeight: "700", lineHeight: 1.5 }}>
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
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: "#0F172A",
            fontSize: "11.5px",
            fontWeight: "800",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={12} strokeWidth={2.8} />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
