import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LienVendeur from "./LienVendeur";

export default async function DashboardAdmin() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const vendeurs = await prisma.vendeur.findMany({
    include: {
      user: true,
      _count: { select: { produits: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const enAttente = vendeurs.filter((v) => !v.actif);
  const actifs = vendeurs.filter((v) => v.actif);

  const formatVendeur = (v: typeof vendeurs[0]) => ({
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
    <div className="container" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
        Espace Administrateur
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Gérez les boutiques du complexe GK Sensei.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "40px",
      }}>
        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Total boutiques</p>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", marginTop: "4px" }}>
            {vendeurs.length}
          </h2>
        </div>
        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "14px" }}>⏳ En attente</p>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", marginTop: "4px", color: "#d97706" }}>
            {enAttente.length}
          </h2>
        </div>
        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "14px" }}>✅ Actives</p>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", marginTop: "4px", color: "#16a34a" }}>
            {actifs.length}
          </h2>
        </div>
      </div>

      {enAttente.length > 0 && (
        <>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
            ⏳ Boutiques en attente de validation
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
            {enAttente.map((v) => (
              <LienVendeur key={v.id} vendeur={formatVendeur(v)} />
            ))}
          </div>
        </>
      )}

      <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
        ✅ Boutiques actives
      </h2>
      {actifs.length === 0 ? (
        <p style={{ color: "#6b7280" }}>Aucune boutique active pour le moment.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {actifs.map((v) => (
            <LienVendeur key={v.id} vendeur={formatVendeur(v)} />
          ))}
        </div>
      )}
    </div>
  );
      }
