import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export default async function VoirStory({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const story = await prisma.story.findUnique({
    where: { id },
    include: { vendeur: true },
  });

  if (!story) {
    notFound();
  }

  const maintenant = new Date();
  const heuresRestantes = Math.max(
    0,
    Math.floor((story.expireAt.getTime() - maintenant.getTime()) / (1000 * 60 * 60))
  );

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0F172A",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
      }}>
        <Link href="/" style={{ color: "white", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={22} strokeWidth={2.5} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700" }}>
          <Clock size={12} strokeWidth={2.5} />
          {heuresRestantes}h restantes
        </div>
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}>
        <img
          src={story.photo}
          alt={story.vendeur.nomBoutique}
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
            borderRadius: "12px",
          }}
        />
      </div>

      <div style={{ padding: "20px 16px 30px 16px", color: "white" }}>
        {story.legende && (
          <p style={{
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "14px",
            textAlign: "center",
            lineHeight: 1.4,
          }}>
            {story.legende}
          </p>
        )}

        <Link
          href={`/acheteur/boutique/${story.vendeurId}`}
          style={{
            display: "block",
            backgroundColor: "white",
            color: "#0F172A",
            padding: "12px",
            borderRadius: "12px",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: "800",
            textDecoration: "none",
          }}
        >
          🏪 Voir la boutique : {story.vendeur.nomBoutique}
        </Link>
      </div>
    </div>
  );
        }
