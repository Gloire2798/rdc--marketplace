import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoutonRestaurer from "./BoutonRestaurer";
import { Store, User, Phone, Package, Archive } from "lucide-react";

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
          Boutiques archivées
        </h1>

        <p
          style={{
            fontSize: "11.5px",
            color: "#57534E",
            fontWeight: "700",
          }}
        >
          Boutiques désactivées · Restaurez-les pour les réactiver
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
            backgroundColor: "white",
            color: "#57534E",
            textDecoration: "none",
            border: "1.5px solid #D4C5A0",
          }}
        >
          Actives ({totalActives})
        </Link>

        <Link
          href="/admin/boutiques/archivees"
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
          Archivées ({vendeurs.length})
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
              <Archive size={26} color="#EA580C" strokeWidth={2} />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#57534E",
                fontWeight: "800",
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
                borderRadius: "16px",
                padding: "12px",
                border: "1px solid #D4C5A0",
                borderLeft: "4px solid #94A3B8",
                boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
              }}
            >
              {/* En-tête */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "13.5px",
                      fontWeight: "900",
                      color: "#0F172A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "4px",
                    }}
                  >
                    <Store size={13} strokeWidth={2.8} />
                    {v.nomBoutique}
                  </h3>
                  <p
                    style={{
                      fontSize: "10.5px",
                      color: "#57534E",
                      fontWeight: "700",
                      marginBottom: "3px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <User size={10} strokeWidth={2.8} />
                    {v.user.nom || v.user.telephone}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#57534E",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <Phone size={9} strokeWidth={2.8} />
                      {v.telephone}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <Package size={9} strokeWidth={2.8} />
                      {v._count.produits} produits
                    </span>
                  </p>
                </div>

                <span
                  style={{
                    fontSize: "9.5px",
                    fontWeight: "900",
                    backgroundColor: "#F5EAD2",
                    color: "#57534E",
                    padding: "4px 10px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    border: "1px solid #D4C5A0",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                  }}
                >
                  Archivée
                </span>
              </div>

              {/* Bouton restaurer/supprimer */}
              <BoutonRestaurer vendeurId={v.id} nomBoutique={v.nomBoutique} />
            </div>
          ))
        )}
      </div>
    </main>
  );
        }
