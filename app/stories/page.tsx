import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    <div style={{ backgroundColor: "#FAF5E8", minHeight: "100vh", padding: "18px 14px 20px 14px" }}>
      <div style={{ marginBottom: "18px" }}>
        <h1 style={{
          fontSize: "20px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "4px",
          letterSpacing: "-0.4px",
        }}>
          Stories
        </h1>
        <p style={{ fontSize: "11.5px", color: "#78716C", fontWeight: "600" }}>
          {liste.length} story{liste.length > 1 ? "s" : ""} active{liste.length > 1 ? "s" : ""}
        </p>
      </div>

      {liste.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "40px 20px",
          borderRadius: "12px",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
            Aucune story active
          </p>
          <p style={{ color: "#78716C", fontSize: "11px" }}>
            Les stories de nos boutiques apparaîtront ici.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
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
                gap: "5px",
              }}
            >
              <div style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: "12px",
                padding: "3px",
                background: "linear-gradient(135deg, #F97316 0%, #EC4899 50%, #8B5CF6 100%)",
              }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "10px",
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
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
              <span style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#334155",
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
