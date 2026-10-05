import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LienVendeur from "../dashboard/LienVendeur";
import { Store } from "lucide-react";

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
        backgroundColor: "#F5EAD2",
        padding: "16px 12px 90px",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "18px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "900",
            color: "#0F172A",
            letterSpacing: "-0.4px",
            marginBottom: "3px",
          }}
        >
          Boutiques
        </h1>

        <p
          style={{
            fontSize: "11.5px",
            color: "#57534E",
            fontWeight: "700",
          }}
        >
          Gestion des boutiques actives
        </p>
      </div>

      {/* FILTRES */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "16px",
        }}
      >
        <Link
          href="/admin/boutiques"
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "900",
            backgroundColor: "#0F172A",
            color: "white",
            textDecoration: "none",
            border: "1.5px solid #0F172A",
            boxShadow: "2px 2px 0 #EA580C",
          }}
        >
          Actives ({vendeurs.length})
        </Link>

        <Link
          href="/admin/boutiques/archivees"
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "900",
            backgroundColor: "white",
            color: "#57534E",
            textDecoration: "none",
            border: "1.5px solid #D4C5A0",
          }}
        >
          Archivées ({totalArchivees})
        </Link>
      </div>

      {/* LISTE */}
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
              borderRadius: "20px",
              padding: "40px 20px",
              textAlign: "center",
              border: "1.5px solid #0F172A",
              boxShadow: "4px 4px 0 #EA580C",
            }}
          >
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#F5EAD2",
              marginBottom: "10px",
            }}>
              <Store size={26} color="#EA580C" strokeWidth={2} />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#57534E",
                fontWeight: "800",
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
