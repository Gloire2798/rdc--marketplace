import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FormulaireStories from "./FormulaireStories";
import { ArrowLeft } from "lucide-react";

export default async function PageStoriesVendeur() {
  const session = await getSession();

  if (!session || session.role !== "VENDEUR") {
    redirect("/vendeur/connexion");
  }

  const vendeur = await prisma.vendeur.findUnique({
    where: { userId: session.id },
  });

  if (!vendeur) {
    redirect("/vendeur/dashboard");
  }

  await prisma.story.deleteMany({
    where: {
      vendeurId: vendeur.id,
      expireAt: { lt: new Date() },
    },
  });

  const stories = await prisma.story.findMany({
    where: { vendeurId: vendeur.id },
    orderBy: { createdAt: "desc" },
  });

  const maintenant = new Date();

  const storiesFormatees = stories.map((s) => ({
    id: s.id,
    photo: s.photo,
    legende: s.legende,
    expireAt: s.expireAt.toISOString(),
    heuresRestantes: Math.max(
      0,
      Math.floor((s.expireAt.getTime() - maintenant.getTime()) / (1000 * 60 * 60))
    ),
  }));

  return (
    <div style={{ padding: "16px 12px 100px 12px", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
      <Link
        href="/vendeur/dashboard"
        style={{
          color: "#0F172A",
          fontSize: "11px",
          fontWeight: "800",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <ArrowLeft size={12} strokeWidth={2.8} />
        Retour au tableau de bord
      </Link>

      <h1 style={{
        fontSize: "22px",
        fontWeight: "900",
        color: "#0F172A",
        marginTop: "12px",
        marginBottom: "3px",
        letterSpacing: "-0.4px",
      }}>
        Mes stories
      </h1>
      <p style={{
        fontSize: "11.5px",
        color: "#57534E",
        marginBottom: "18px",
        fontWeight: "700",
      }}>
        Partagez l&apos;actualité de votre boutique (visible 24h)
      </p>

      <FormulaireStories
        storiesExistantes={storiesFormatees}
        limite={10}
      />
    </div>
  );
}
