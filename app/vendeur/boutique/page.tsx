import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FormulaireBoutique from "./FormulaireBoutique";

export default async function PageBoutiqueVendeur() {
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

  return (
    <div className="container" style={{ padding: "20px 14px" }}>
      <Link href="/vendeur/dashboard" style={{ color: "#1D4ED8", fontSize: "12px", fontWeight: "700" }}>
        ← Retour au tableau de bord
      </Link>

      <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginTop: "12px", marginBottom: "4px" }}>
        Ma boutique
      </h1>
      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px", fontWeight: "600" }}>
        Gérez les informations et photos de votre boutique
      </p>

      <FormulaireBoutique
        vendeur={{
          id: vendeur.id,
          nomBoutique: vendeur.nomBoutique,
          description: vendeur.description,
          adresse: vendeur.adresse,
          photoCouverture: vendeur.photoCouverture,
          photo2: vendeur.photo2,
          photo3: vendeur.photo3,
          telephone: vendeur.telephone,
        }}
      />
    </div>
  );
}
