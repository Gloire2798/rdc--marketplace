import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LienVendeur from "../dashboard/LienVendeur";

export default async function BoutiquesAdmin() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const vendeurs = await prisma.vendeur.findMany({
    where: { actif: true },
    include: {
      user: true,
      _count: {
        select: {
          produits: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalArchivees = await prisma.vendeur.count({
    where: { actif: false },
  });

  const formaterVendeur = (v: typeof vendeurs[0]) => ({
    id: v.id,
    nomBoutique: v.nomBoutique,
    description: v.description,
    adresse: v.adresse,
    telephone: v.telephone,
    numMobileMoney: v.numMobileMoney,
    nomProprietaire: v.user.nom,
    actif: v.actif,
    nombreProduits: v._count.produits,
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F1F5F9",
        padding: "16px 12px 90px",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#0F172A",
          }}
        >
          Boutiques
        </h1>

        <p
          style={{
            fontSize: "11px",
            color: "#64748B",
            fontWeight: "600",
            marginTop: "3px",
          }}
        >
          Gestion des boutiques actives
        </p>
      </div>

      {/* Filtres */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "14px",
        }}
      >
        <Link
          href="/admin/boutiques"
          style={{
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "700",
            backgroundColor: "#1D4ED8",
            color: "white",
            textDecoration: "none",
            border: "1px solid #1D4ED8",
          }}
        >
          Actives ({vendeurs.length})
        </Link>

        <Link
          href="/admin/boutiques/archivees"
          style={{
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "700",
            backgroundColor: "white",
            color: "#475569",
            textDecoration: "none",
            border: "1px solid #E2E8F0",
          }}
        >
          Archivées ({totalArchivees})
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {vendeurs.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "30px 20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                fontWeight: "600",
              }}
            >
              Aucune boutique active.
            </p>
          </div>
        ) : (
          vendeurs.map((vendeur) => (
            <LienVendeur
              key={vendeur.id}
              vendeur={formaterVendeur(vendeur)}
            />
          ))
        )}
      </div>
    </main>
  );
}
