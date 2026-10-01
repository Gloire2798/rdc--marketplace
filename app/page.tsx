import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
      {/* BANDEAU STYLE AFRICAIN */}
      <div style={{
        background: "linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)",
        padding: "20px 16px 22px 16px",
        marginBottom: "18px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "7px",
          background: "repeating-linear-gradient(90deg, #F97316 0px, #F97316 20px, #FBBF24 20px, #FBBF24 40px, #16A34A 40px, #16A34A 60px, #0F172A 60px, #0F172A 80px)",
        }} />

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "5px 11px",
          borderRadius: "20px",
          fontSize: "10px",
          fontWeight: "700",
          color: "#0F172A",
          marginBottom: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <MapPin size={11} strokeWidth={2.5} />
          Kinshasa • Gombe
          <span style={{ color: "#94a3b8" }}>•</span>
          <Clock size={11} strokeWidth={2.5} />
          08:00 - 21:00
        </div>

        <h1 style={{
          fontSize: "28px",
          fontWeight: "900",
          color: "#0F172A",
          lineHeight: 0.95,
          letterSpacing: "-0.8px",
          marginBottom: "6px",
          textTransform: "uppercase",
        }}>
          Le Guide du<br />
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
          fontWeight: "700",
          color: "#475569",
          lineHeight: 1.4,
        }}>
          Découvre. Explore. Shop en live • Kinshasa
        </p>
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

        {boutiques.length > 0 && (
          <div style={{
            marginTop: "16px",
            background: "linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)",
            borderRadius: "16px",
            padding: "14px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "repeating-linear-gradient(90deg, #F97316 0px, #F97316 15px, #FBBF24 15px, #FBBF24 30px, #16A34A 30px, #16A34A 45px)",
            }} />

            <p style={{
              fontSize: "10px",
              fontWeight: "900",
              color: "#F97316",
              letterSpacing: "0.5px",
              marginBottom: "3px",
            }}>
              ⭐ COUP DE CŒUR GK
            </p>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: "4px",
            }}>
              {boutiques[0].nomBoutique}
            </h3>
            <p style={{
              fontSize: "11px",
              color: "#475569",
              fontWeight: "500",
              marginBottom: "10px",
            }}>
              {boutiques[0].description || "Découvrez cette boutique en vedette"}
            </p>
            <Link
              href={`/acheteur/boutique/${boutiques[0].id}`}
              style={{
                display: "inline-block",
                backgroundColor: "#0F172A",
                color: "white",
                fontSize: "11px",
                fontWeight: "800",
                padding: "7px 14px",
                borderRadius: "20px",
                textDecoration: "none",
              }}
            >
              Voir la boutique →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
            }
