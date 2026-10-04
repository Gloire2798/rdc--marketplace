import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import Stories from "./components/Stories";
import CarteBoutique from "./components/CarteBoutique";
import { MapPin, Clock } from "lucide-react";

// ============================================================
// RÉCUPÉRATION (avec cache 30 sec)
// ============================================================
const getDonneesAccueil = unstable_cache(
  async () => {
    const maintenant = new Date();

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

    const storiesBrutes = await prisma.story.findMany({
      where: { expireAt: { gt: maintenant } },
      select: {
        id: true,
        vendeurId: true,
        photo: true,
        vendeur: { select: { nomBoutique: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { vendeurs, storiesBrutes };
  },
  ["accueil-donnees"],
  { revalidate: 30, tags: ["accueil"] }
);

export default async function Home() {
  const { vendeurs, storiesBrutes } = await getDonneesAccueil();

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
      {/* BANDEAU STYLE B */}
      <div style={{
        position: "relative",
        padding: "20px 18px 22px 18px",
        background: "linear-gradient(180deg, #FFFFFF 0%, #FEFCF8 100%)",
        borderBottom: "2px solid #0F172A",
      }}>
        {/* Bande multi-couleurs (CONSERVÉE) */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "repeating-linear-gradient(90deg, #F97316 0px, #F97316 20px, #FBBF24 20px, #FBBF24 40px, #16A34A 40px, #16A34A 60px, #1E3A5F 60px, #1E3A5F 80px)",
        }} />

        {/* Pill Kinshasa — bleu marine */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "#0F172A",
          padding: "5px 12px",
          borderRadius: "20px",
          fontSize: "9.5px",
          fontWeight: "800",
          color: "white",
          marginBottom: "12px",
          letterSpacing: "0.5px",
        }}>
          <MapPin size={10} strokeWidth={2.5} />
          KINSHASA
          <span style={{ color: "#475569" }}>·</span>
          <Clock size={10} strokeWidth={2.5} />
          24H/24
        </div>

        {/* Titre — plus gros */}
        <h1 style={{
          fontSize: "26px",
          fontWeight: "900",
          color: "#0F172A",
          lineHeight: 1.05,
          letterSpacing: "-0.8px",
          marginBottom: "8px",
          textTransform: "uppercase",
        }}>
          Le Guide du{" "}
          <span style={{
            background: "linear-gradient(90deg, #EA580C 0%, #F59E0B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Complexe
          </span>
        </h1>

        <p style={{
          fontSize: "12px",
          fontWeight: "700",
          color: "#334155",
        }}>
          Découvre. Explore. Shop en ligne.
        </p>
      </div>

      <div style={{ padding: "16px 14px 20px 14px" }}>
        <Stories stories={stories} />

        {/* Titre section avec trait orange */}
        <h2 style={{
          fontSize: "12px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "10px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{
            display: "inline-block",
            width: "3px",
            height: "14px",
            backgroundColor: "#EA580C",
            borderRadius: "2px",
          }} />
          Nos boutiques
        </h2>

        {boutiques.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            textAlign: "center",
            padding: "40px 20px",
            borderRadius: "14px",
            border: "1.5px solid #0F172A",
            boxShadow: "3px 3px 0 #F59E0B",
          }}>
            <p style={{ fontSize: "13px", fontWeight: "800", marginBottom: "6px", color: "#0F172A" }}>
              Aucune boutique pour le moment
            </p>
            <p style={{ color: "#64748B", fontSize: "11px", fontWeight: "600" }}>
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
