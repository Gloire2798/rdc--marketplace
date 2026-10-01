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
    <div>
      {/* BANDEAU AVEC MOTIF PAGNE EN FOND */}
      <div style={{
        position: "relative",
        padding: "24px 18px 28px 18px",
        marginBottom: "18px",
        overflow: "hidden",
        backgroundColor: "#1E3A5F",
      }}>
        {/* Image pagne en fond */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('https://i.ibb.co/6c6z6hB/pagne-motif.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
        }} />

        {/* Overlay bleu pour la lisibilité */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(30, 58, 95, 0.75) 0%, rgba(15, 23, 42, 0.65) 100%)",
        }} />

        {/* Contenu */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Localisation 24/24 */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "5px 11px",
            borderRadius: "20px",
            fontSize: "10px",
            fontWeight: "800",
            color: "#0F172A",
            marginBottom: "14px",
          }}>
            <MapPin size={11} strokeWidth={2.5} />
            Kinshasa
            <span style={{ color: "#CBD5E1" }}>•</span>
            <Clock size={11} strokeWidth={2.5} />
            Ouvert 24h/24
          </div>

          {/* Titre sur 1 ligne */}
          <h1 style={{
            fontSize: "26px",
            fontWeight: "900",
            color: "white",
            lineHeight: 1.05,
            letterSpacing: "-0.6px",
            marginBottom: "8px",
            textTransform: "uppercase",
          }}>
            Le Guide du <span style={{
              background: "linear-gradient(90deg, #F97316 0%, #FBBF24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Complexe</span>
          </h1>

          {/* Sous-titre */}
          <p style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "rgba(255, 255, 255, 0.9)",
            lineHeight: 1.4,
          }}>
            Découvre. Explore. Shop en ligne.
          </p>
        </div>
      </div>

      <div style={{ padding: "0 14px 20px 14px" }}>
        <Stories stories={stories} />

        <h2 style={{
          fontSize: "12px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "10px",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}>
          Nos boutiques
        </h2>

        {boutiques.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>
              Aucune boutique pour le moment
            </p>
            <p style={{ color: "#64748b", fontSize: "12px" }}>
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
