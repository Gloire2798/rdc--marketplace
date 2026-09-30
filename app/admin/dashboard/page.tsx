import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NavigationBas from "./NavigationBas";
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

  const commandes = await prisma.commande.findMany({
    include: {
      items: { include: { produit: true } },
    },
  });

  const enAttente = vendeurs.filter((v) => !v.actif);
  const actifs = vendeurs.filter((v) => v.actif);

  const chiffreAffaires = commandes
    .filter((c) => c.statut !== "ANNULE")
    .reduce((acc, c) => {
      const devise = c.items[0]?.produit.devise || "FC";
      if (devise === "FC") return acc + c.total;
      return acc + c.total * 2800;
    }, 0);

  const formaterCA = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M FC`;
    }
    if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}k FC`;
    }
    return `${montant.toLocaleString("fr-FR")} FC`;
  };

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

  const dateAujourdhui = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div style={{
        backgroundColor: "#F3F4F6",
        minHeight: "100vh",
        padding: "24px 18px 100px 18px",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "10px",
        }}>
          <div>
            <h1 style={{ fontSize: "30px", fontWeight: "800", color: "#0F172A", marginBottom: "4px", letterSpacing: "-0.5px" }}>
              Tableau de bord
            </h1>
            <p style={{ fontSize: "14px", color: "#475569", fontWeight: "500" }}>
              Bienvenue, voici l&apos;activité en temps réel
            </p>
          </div>
          <div style={{
            backgroundColor: "white",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "13px",
            color: "#0F172A",
            fontWeight: "600",
          }}>
            📅 {dateAujourdhui}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "24px",
        }}>
          <div style={{ backgroundColor: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ backgroundColor: "#DBEAFE", padding: "14px", display: "flex", justifyContent: "center" }}>
              <span style={{ fontSize: "32px" }}>🏪</span>
            </div>
            <div style={{ padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#475569", marginBottom: "4px", fontWeight: "600" }}>
                Total boutiques
              </p>
              <p style={{ fontSize: "30px", fontWeight: "800", color: "#0F172A", lineHeight: 1 }}>
                {vendeurs.length}
              </p>
              <p style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", marginTop: "4px" }}>
                +{actifs.length} actives
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ backgroundColor: "#FED7AA", padding: "14px", display: "flex", justifyContent: "center" }}>
              <span style={{ fontSize: "32px" }}>⏳</span>
            </div>
            <div style={{ padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#475569", marginBottom: "4px", fontWeight: "600" }}>
                En attente
              </p>
              <p style={{ fontSize: "30px", fontWeight: "800", color: "#0F172A", lineHeight: 1 }}>
                {enAttente.length}
              </p>
              {enAttente.length > 0 && (
                <p style={{ fontSize: "11px", color: "#d97706", fontWeight: "700", marginTop: "4px" }}>
                  À traiter
                </p>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ backgroundColor: "#BBF7D0", padding: "14px", display: "flex", justifyContent: "center" }}>
              <span style={{ fontSize: "32px" }}>✅</span>
            </div>
            <div style={{ padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#475569", marginBottom: "4px", fontWeight: "600" }}>
                Boutiques actives
              </p>
              <p style={{ fontSize: "30px", fontWeight: "800", color: "#0F172A", lineHeight: 1 }}>
                {actifs.length}
              </p>
              <p style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", marginTop: "4px" }}>
                {vendeurs.length > 0 ? Math.round((actifs.length / vendeurs.length) * 100) : 0}% du total
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ backgroundColor: "#DBEAFE", padding: "14px", display: "flex", justifyContent: "center" }}>
              <span style={{ fontSize: "32px" }}>💰</span>
            </div>
            <div style={{ padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#475569", marginBottom: "4px", fontWeight: "600" }}>
                Chiffre d&apos;affaires
              </p>
              <p style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", lineHeight: 1.1 }}>
                {formaterCA(chiffreAffaires)}
              </p>
              <p style={{ fontSize: "11px", color: "#475569", marginTop: "4px", fontWeight: "600" }}>
                {commandes.filter((c) => c.statut !== "ANNULE").length} commandes
              </p>
            </div>
          </div>
        </div>

        {enAttente.length > 0 && (
          <>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "#0F172A",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              Boutiques en attente
              <span style={{
                backgroundColor: "#FED7AA",
                color: "#92400e",
                fontSize: "12px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "12px",
              }}>
                {enAttente.length}
              </span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {enAttente.map((v) => (
                <LienVendeur key={v.id} vendeur={formaterVendeur(v)} />
              ))}
            </div>
          </>
        )}

        <h2 style={{
          fontSize: "20px",
          fontWeight: "800",
          color: "#0F172A",
          marginBottom: "14px",
        }}>
          Boutiques actives
        </h2>
        {actifs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: "36px", marginBottom: "8px" }}>🏪</p>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Aucune boutique active.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {actifs.map((v) => (
              <LienVendeur key={v.id} vendeur={formaterVendeur(v)} />
            ))}
          </div>
        )}
      </div>

      <NavigationBas />
    </>
  );
                         }
