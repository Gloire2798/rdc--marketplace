import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoutonRestaurer from "./BoutonRestaurer";

export default async function BoutiquesArchivees() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const vendeurs = await prisma.vendeur.findMany({
    where: { actif: false },
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

  const totalActives = await prisma.vendeur.count({
    where: { actif: true },
  });

  const formaterVendeur = (v: typeof vendeurs[0]) => ({
    id: v.id,
    nomBoutique: v.nomBoutique,
    description: v.description,
    adresse: v.adresse,
    telephone: v.telephone,
    numMobileMoney: v.numMobileMoney,
    nomProprietaire: v.user.nom,
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
          Boutiques archivées
        </h1>

        <p
          style={{
            fontSize: "11px",
            color: "#64748B",
            fontWeight: "600",
            marginTop: "3px",
          }}
        >
          Boutiques désactivées · Restaurez-les pour les réactiver
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
            backgroundColor: "white",
            color: "#475569",
            textDecoration: "none",
            border: "1px solid #E2E8F0",
          }}
        >
          Actives ({totalActives})
        </Link>

        <Link
          href="/admin/boutiques/archivees"
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
          Archivées ({vendeurs.length})
        </Link>
      </div>

      {/* Liste */}
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
            <p style={{ fontSize: "32px", marginBottom: "8px" }}>📦</p>
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                fontWeight: "600",
              }}
            >
              Aucune boutique archivée.
            </p>
          </div>
        ) : (
          vendeurs.map((v) => (
            <div
              key={v.id}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "12px",
                border: "1px solid #E2E8F0",
                borderLeft: "4px solid #94A3B8",
              }}
            >
              {/* En-tête */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "13.5px",
                      fontWeight: "800",
                      color: "#0F172A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🏪 {v.nomBoutique}
                  </h3>
                  <p
                    style={{
                      fontSize: "10.5px",
                      color: "#64748B",
                      fontWeight: "600",
                      marginTop: "2px",
                    }}
                  >
                    👤 {v.user.nom || v.user.telephone}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#94A3B8",
                      fontWeight: "600",
                      marginTop: "1px",
                    }}
                  >
                    📞 {v.telephone} · {v._count.produits} produits
                  </p>
                </div>

                <span
                  style={{
                    fontSize: "9.5px",
                    fontWeight: "800",
                    backgroundColor: "#E2E8F0",
                    color: "#475569",
                    padding: "3px 8px",
                    borderRadius: "10px",
                    flexShrink: 0,
                  }}
                >
                  ARCHIVÉE
                </span>
              </div>

              {/* Bouton restaurer */}
              <BoutonRestaurer vendeurId={v.id} nomBoutique={v.nomBoutique} />
            </div>
          ))
        )}
      </div>
    </main>
  );
    }
