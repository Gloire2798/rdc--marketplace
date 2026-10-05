import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PageStories() {
  const maintenant = new Date();

  const stories = await prisma.story.findMany({
    where: { expireAt: { gt: maintenant } },
    include: { vendeur: true },
    orderBy: { createdAt: "desc" },
  });

  const storiesUniques = new Map();
  stories.forEach((s) => {
    if (!storiesUniques.has(s.vendeurId)) {
      storiesUniques.set(s.vendeurId, {
        id: s.id,
        photo: s.photo,
        legende: s.legende,
        expireAt: s.expireAt,
        vendeurId: s.vendeurId,
        nomBoutique: s.vendeur.nomBoutique,
      });
    }
  });

  const liste = Array.from(storiesUniques.values());

  return (
    <div style={{ backgroundColor: "#F5EAD2", minHeight: "100vh", padding: "18px 14px 100px 14px" }}>
      <div style={{ marginBottom: "18px" }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "3px",
          letterSpacing: "-0.5px",
        }}>
          Stories
        </h1>
        <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700" }}>
          {liste.length} story{liste.length > 1 ? "s" : ""} active{liste.length > 1 ? "s" : ""}
        </p>
      </div>

      {liste.length === 0 ? (
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
            <Camera size={28} color="#EA580C" strokeWidth={2.2} />
          </div>
          <p style={{
            fontSize: "15px",
            fontWeight: "900",
            marginBottom: "6px",
            color: "#0F172A",
          }}>
            Aucune story active
          </p>
          <p style={{
            color: "#57534E",
            fontSize: "11.5px",
            fontWeight: "600",
            lineHeight: 1.5,
          }}>
            Les stories de nos boutiques apparaîtront ici.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}>
          {liste.map((story) => (
            <Link
              key={story.id}
              href={`/acheteur/stories/${story.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {/* Cercle story : dégradé orange → jaune (charte GK) */}
              <div style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: "16px",
                padding: "3px",
                background: "linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)",
                boxShadow: "0 2px 6px rgba(234, 88, 12, 0.20)",
              }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "13px",
                  overflow: "hidden",
                  backgroundColor: "white",
                  padding: "2px",
                }}>
                  <img
                    src={story.photo}
                    alt={story.nomBoutique}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "11px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              </div>

              {/* Nom boutique */}
              <span style={{
                fontSize: "10.5px",
                fontWeight: "900",
                color: "#0F172A",
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}>
                {story.nomBoutique}
              </span>
            </Link>
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
