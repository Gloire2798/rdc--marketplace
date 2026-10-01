import { prisma } from "@/lib/prisma";
import Stories from "./components/Stories";
import CarteBoutique from "./components/CarteBoutique";
import { MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const vendeurs = await prisma.vendeur.findMany({
    where: { actif: true },
    include: {
      _count: { select: { produits: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const maintenant = new Date();
  const storiesBrutes = await prisma.story.findMany({
    where: { expireAt: { gt: maintenant } },
    include: { vendeur: true },
    orderBy: { createdAt: "desc" },
  });

  const storiesParVendeur = new Map();
  storiesBrutes.forEach((s) => {
    if (!storiesParVendeur.has(s.vendeurId)) {
      storiesParVendeur.set(s.vendeurId, {
        vendeurId: s.vendeurId,
        nomBoutique: s.vendeur.nomBoutique,
        photo: s.photo,
        storyId: s.id,
      });
    }
  });

  const stories = Array.from(storiesParVendeur.values());

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
    <div style={{ backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
      {/* BANDEAU BEIGE UNI */}
      <div style={{
        position: "relative",
        padding: "20px 18px 22px 18px",
        borderBottom: "1px solid #E8DFC8",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "repeating-linear-gradient(90deg, #F97316 0px, #F97316 20px, #FBBF24 20px, #FBBF24 40px, #16A34A 40px, #16A34A 60px, #1E3A5F 60px, #1E3A5F 80px)",
        }} />

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "white",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "9.5px",
          fontWeight: "800",
          color: "#57534E",
          marginBottom: "12px",
          border: "1px solid #E8DFC8",
        }}>
          <MapPin size={10} strokeWidth={2.5} />
          Kinshasa
          <span style={{ color: "#CBD5E1" }}>•</span>
          <Clock size={10} strokeWidth={2.5} />
          Ouvert 24h/24
        </div>

        <h1 style={{
          fontSize: "22px",
          fontWeight: "900",
          color: "#0F172A",
          lineHeight: 1.1,
          letterSpacing: "-0.4px",
          marginBottom: "6px",
          textTransform: "uppercase",
        }}>
          Le Guide du{" "}
          <span style={{
            background: "linear-gradient(90deg, #F97316 0%, #EA580C 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Complexe
          </span>
        </h1>

        <p style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "#57534E",
        }}>
          Découvre. Explore. Shop en ligne.
        </p>
      </div>

      <div style={{ padding: "14px 14px 20px 14px" }}>
        <Stories stories={stories} />

        <h2 style={{
          fontSize: "11px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "8px",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}>
          Nos boutiques
        </h2>

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
      </div>
    </div>
  );
}
