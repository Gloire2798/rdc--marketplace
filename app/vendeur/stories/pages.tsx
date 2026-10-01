import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FormulaireStories from "./FormulaireStories";

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
    <div className="container" style={{ padding: "20px 14px" }}>
      <Link href="/vendeur/dashboard" style={{ color: "#1D4ED8", fontSize: "12px", fontWeight: "700" }}>
        ← Retour au tableau de bord
      </Link>

      <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginTop: "12px", marginBottom: "4px" }}>
        Mes stories
      </h1>
      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px", fontWeight: "600" }}>
        Partagez l&apos;actualité de votre boutique (visible 24h)
      </p>

      <FormulaireStories
        storiesExistantes={storiesFormatees}
        limite={10}
      />
    </div>
  );
    }
