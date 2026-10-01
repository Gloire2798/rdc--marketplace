import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCommandes() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const commandes = await prisma.commande.findMany({
    where: { statut: { not: "ANNULE" } },
    include: {
      vendeur: true,
      acheteur: true,
      items: { include: { produit: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") return `${prix.toFixed(2)} $`;
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  const enAttente = commandes.filter((c) => c.statut === "EN_ATTENTE");
  const validees = commandes.filter((c) => c.statut === "PAYE" || c.statut === "PRET");
  const terminees = commandes.filter((c) => c.statut === "RETIRE");

  const renderCard = (c: typeof commandes[0], couleur: string) => {
    const devise = c.items[0]?.produit.devise || "FC";
    return (
      <div key={c.id} style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "12px",
        border: "1px solid #F1F5F9",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        borderLeft: `4px solid ${couleur}`,
        marginBottom: "8px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <div>
            <p style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "700" }}>
              #{c.id.slice(0, 8)}
            </p>
            <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginTop: "2px" }}>
              👤 {c.nomClient || c.acheteur?.nom || "Client"}
            </p>
            <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
              📞 {c.telephoneClient || c.acheteur?.telephone || "—"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "15px", fontWeight: "900", color: "#1D4ED8" }}>
              {formaterPrix(c.total, devise)}
            </p>
            <p style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px", fontWeight: "600" }}>
              {c.mode === "LIVRAISON" ? "🚚 Livraison" : "🏪 Retrait"}
            </p>
          </div>
        </div>

        <p style={{ fontSize: "11px", color: "#1E3A5F", fontWeight: "800", marginBottom: "6px" }}>
          🏪 {c.vendeur.nomBoutique}
        </p>

        {c.mode === "LIVRAISON" && c.adresse && (
          <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
            📍 {c.adresse}
          </p>
        )}

        <div style={{
          backgroundColor: "#F9FAFB",
          borderRadius: "8px",
          padding: "6px 8px",
        }}>
          {c.items.map((i, idx) => (
            <div key={idx} style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              marginBottom: idx < c.items.length - 1 ? "3px" : "0",
            }}>
              <span>{i.produit.nom} × {i.quantite}</span>
              <span style={{ color: "#64748b" }}>
                {formaterPrix(i.prixUnitaire * i.quantite, devise)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: "#F3F4F6", minHeight: "100vh", padding: "18px 14px 90px 14px" }}>
      <h1 style={{
        fontSize: "20px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "4px",
        letterSpacing: "-0.4px",
      }}>
        Commandes
      </h1>
      <p style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600", marginBottom: "18px" }}>
        Toutes les commandes du complexe
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px",
        marginBottom: "18px",
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "10px",
          border: "1px solid #F1F5F9",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", marginBottom: "3px" }}>
            ⏳ En attente
          </p>
          <p style={{ fontSize: "18px", fontWeight: "900", color: "#d97706" }}>
            {enAttente.length}
          </p>
        </div>
        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "10px",
          border: "1px solid #F1F5F9",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", marginBottom: "3px" }}>
            ✅ Validées
          </p>
          <p style={{ fontSize: "18px", fontWeight: "900", color: "#1D4ED8" }}>
            {validees.length}
          </p>
        </div>
        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "10px",
          border: "1px solid #F1F5F9",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", marginBottom: "3px" }}>
            📦 Terminées
          </p>
          <p style={{ fontSize: "18px", fontWeight: "900", color: "#16a34a" }}>
            {terminees.length}
          </p>
        </div>
      </div>

      {commandes.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "40px 20px",
          borderRadius: "12px",
          border: "1px solid #F1F5F9",
        }}>
          <p style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
            Aucune commande
          </p>
          <p style={{ color: "#64748b", fontSize: "11px" }}>
            Les commandes apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          {enAttente.length > 0 && (
            <>
              <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#d97706", marginBottom: "8px", textTransform: "uppercase" }}>
                ⏳ En attente ({enAttente.length})
              </h2>
              <div style={{ marginBottom: "18px" }}>
                {enAttente.map((c) => renderCard(c, "#d97706"))}
              </div>
            </>
          )}

          {validees.length > 0 && (
            <>
              <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#1D4ED8", marginBottom: "8px", textTransform: "uppercase" }}>
                ✅ Validées ({validees.length})
              </h2>
              <div style={{ marginBottom: "18px" }}>
                {validees.map((c) => renderCard(c, "#1D4ED8"))}
              </div>
            </>
          )}

          {terminees.length > 0 && (
            <>
              <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#16a34a", marginBottom: "8px", textTransform: "uppercase" }}>
                📦 Terminées ({terminees.length})
              </h2>
              <div>
                {terminees.map((c) => renderCard(c, "#16a34a"))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
              }
