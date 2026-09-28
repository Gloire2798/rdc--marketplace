import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const vendeurs = await prisma.vendeur.findMany({
    where: { actif: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container" style={{ padding: "40px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "12px" }}>
          Bienvenue sur GK Sensei
        </h1>
        <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "8px" }}>
          Complexe Commercial
        </p>
        <p style={{ fontSize: "16px", color: "#9ca3af", fontStyle: "italic" }}>
          "Toutes vos boutiques préférées, en un seul endroit."
        </p>
      </div>

      <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>
        Nos boutiques
      </h2>

      {vendeurs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</p>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            Aucune boutique disponible pour le moment
          </p>
          <p style={{ color: "#6b7280" }}>
            Les boutiques apparaîtront ici dès qu'elles seront validées.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          {vendeurs.map((boutique) => (
            <Link
              key={boutique.id}
              href={`/acheteur/boutique/${boutique.id}`}
              className="card"
              style={{ display: "block", cursor: "pointer" }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏪</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
                {boutique.nomBoutique}
              </h3>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                {boutique.description || "Boutique en ligne"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
