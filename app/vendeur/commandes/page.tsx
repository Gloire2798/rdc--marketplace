import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CarteCommande from "./CarteCommande";

export default async function MesCommandes() {
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

  const commandes = await prisma.commande.findMany({
    where: {
      vendeurId: vendeur.id,
      statut: { not: "ANNULE" },
    },
    include: {
      acheteur: true,
      items: {
        include: {
          produit: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formaterCommande = (c: typeof commandes[0]) => {
    // Calculer les totaux séparés par devise
    let totalFC = 0;
    let totalUSD = 0;

    const itemsFormates = c.items.map((i) => {
      const montant = i.prixUnitaire * i.quantite;

      if (i.produit.devise === "USD") {
        totalUSD += montant;
      } else {
        totalFC += montant;
      }

      return {
        nom: i.produit.nom,
        quantite: i.quantite,
        prixUnitaire: i.prixUnitaire,
        devise: i.produit.devise,
      };
    });

    return {
      id: c.id,
      statut: c.statut,
      totalFC,
      totalUSD,
      mode: c.mode,
      adresse: c.adresse,
      createdAt: c.createdAt.toISOString(),
      nomClient: c.nomClient || c.acheteur?.nom || "Client",
      telephoneClient: c.telephoneClient || c.acheteur?.telephone || "—",
      items: itemsFormates,
    };
  };

  const enAttente = commandes.filter((c) => c.statut === "EN_ATTENTE");
  const validees = commandes.filter((c) => c.statut === "PAYE" || c.statut === "PRET");
  const terminees = commandes.filter((c) => c.statut === "RETIRE");

  return (
    <div className="container" style={{ padding: "40px 16px" }}>
      <Link href="/vendeur/dashboard" style={{ color: "#2563eb", fontSize: "14px" }}>
        ← Retour au tableau de bord
      </Link>

      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px", marginTop: "16px" }}>
        Mes commandes
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Gérez les commandes de vos clients.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "12px",
        marginBottom: "32px",
      }}>
        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "13px" }}>⏳ En attente</p>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#d97706", marginTop: "4px" }}>
            {enAttente.length}
          </h2>
        </div>
        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "13px" }}>✅ Validées</p>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb", marginTop: "4px" }}>
            {validees.length}
          </h2>
        </div>
        <div className="card">
          <p style={{ color: "#6b7280", fontSize: "13px" }}>📦 Terminées</p>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#16a34a", marginTop: "4px" }}>
            {terminees.length}
          </h2>
        </div>
      </div>

      {commandes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>📦</p>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            Aucune commande pour le moment
          </p>
          <p style={{ color: "#6b7280" }}>
            Vos commandes apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          {enAttente.length > 0 && (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#d97706" }}>
                ⏳ En attente de validation ({enAttente.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                {enAttente.map((c) => (
                  <CarteCommande key={c.id} commande={formaterCommande(c)} />
                ))}
              </div>
            </>
          )}

          {validees.length > 0 && (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#2563eb" }}>
                ✅ Validées ({validees.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                {validees.map((c) => (
                  <CarteCommande key={c.id} commande={formaterCommande(c)} />
                ))}
              </div>
            </>
          )}

          {terminees.length > 0 && (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#16a34a" }}>
                📦 Terminées ({terminees.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {terminees.map((c) => (
                  <CarteCommande key={c.id} commande={formaterCommande(c)} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
        }
