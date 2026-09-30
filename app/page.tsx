import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoBoutique from "./components/LogoBoutique";

export const dynamic = "force-dynamic";

export default async function Home() {
  const vendeurs = await prisma.vendeur.findMany({
    where: { actif: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container" style={{ padding: "24px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0F172A", marginBottom: "6px" }}>
          Bienvenue sur GK Sensei
        </h1>
        <p style={{ fontSize: "13px", color: "#475569", fontWeight: "600", marginBottom: "4px" }}>
          Complexe Commercial
        </p>
        <p style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
          &quot;Toutes vos boutiques préférées, en un seul endroit.&quot;
        </p>
      </div>

      <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", marginBottom: "14px" }}>
        Nos boutiques
      </h2>

      {vendeurs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "40px", marginBottom: "10px" }}>🛒</p>
          <p style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>
            Aucune boutique disponible pour le moment
          </p>
          <p style={{ color: "#64748b", fontSize: "12px" }}>
            Les boutiques apparaîtront ici dès qu&apos;elles seront validées.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "10px",
        }}>
          {vendeurs.map((boutique) => (
            <Link
              key={boutique.id}
              href={`/acheteur/boutique/${boutique.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "12px",
                textDecoration: "none",
                color: "inherit",
                border: "1px solid #F1F5F9",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
              }}
            >
              <LogoBoutique nom={boutique.nomBoutique} taille={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#0F172A",
                  marginBottom: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {boutique.nomBoutique}
                </h3>
                <p style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {boutique.description || "Boutique en ligne"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
                           }
