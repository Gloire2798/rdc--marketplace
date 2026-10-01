import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LienVendeur from "../Dashboard/LienVendeur";

export default async function BoutiquesAdmin() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const vendeurs = await prisma.vendeur.findMany({
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
          Gestion de toutes les boutiques
        </p>
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
              Aucune boutique enregistrée.
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
