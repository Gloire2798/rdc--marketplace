import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FormulaireBoutique from "./FormulaireBoutique";
import { ArrowLeft } from "lucide-react";

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
        Ma boutique
      </h1>
      <p style={{ fontSize: "11.5px", color: "#57534E", marginBottom: "18px", fontWeight: "700" }}>
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
