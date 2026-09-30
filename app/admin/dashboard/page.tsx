import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MenuBurger from "./MenuBurger";
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

  // Calcul du chiffre d'affaires total
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
      <header style={{
        backgroundColor: "#1E3A5F",
        color: "white",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <MenuBurger />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "24px" }}>🛒</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "bold", lineHeight: 1 }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "10px", opacity: 0.8 }}>
              Complexe Commercial
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "20px" }}>🔍</span>
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: "20px" }}>🔔</span>
            {enAttente.length > 0 && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-6px",
                backgroundColor: "#dc2626",
                color: "white",
                fontSize: "10px",
                fontWeight: "bold",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {enAttente.length}
              </span>
            )}
          </div>
        </div>
      </header>

      <div style={{
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
        padding: "20px 16px 100px 16px",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "8px",
        }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>
              Tableau de bord
            </h1>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              Bienvenue, voici l&apos;activité en temps réel
            </p>
          </div>
          <div style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "12px",
            color: "#374151",
            fontWeight: "500",
          }}>
            📅 {dateAujourdhui}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "20px",
        }}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{
              backgroundColor: "#DBEAFE",
              padding: "12px",
              display: "flex",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: "28px" }}>🏪</span>
            </div>
            <div style={{ padding: "10px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "2px" }}>
                Total boutiques
              </p>
              <p style={{ fontSize: "26px", fontWeight: "bold", color: "#111827" }}>
                {vendeurs.length}
              </p>
              <p style={{ fontSize: "10px", color: "#16a34a", fontWeight: "600", marginTop: "2px" }}>
                +{actifs.length} actives
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{
              backgroundColor: "#FED7AA",
              padding: "12px",
              display: "flex",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: "28px" }}>⏳</span>
            </div>
            <div style={{ padding: "10px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "2px" }}>
                En attente
              </p>
              <p style={{ fontSize: "26px", fontWeight: "bold", color: "#111827" }}>
                {enAttente.length}
              </p>
              {enAttente.length > 0 && (
                <p style={{ fontSize: "10px", color: "#d97706", fontWeight: "600", marginTop: "2px" }}>
                  À traiter
                </p>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{
              backgroundColor: "#BBF7D0",
              padding: "12px",
              display: "flex",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: "28px" }}>✅</span>
            </div>
            <div style={{ padding: "10px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "2px" }}>
                Boutiques actives
              </p>
              <p style={{ fontSize: "26px", fontWeight: "bold", color: "#111827" }}>
                {actifs.length}
              </p>
              <p style={{ fontSize: "10px", color: "#16a34a", fontWeight: "600", marginTop: "2px" }}>
                {vendeurs.length > 0 ? Math.round((actifs.length / vendeurs.length) * 100) : 0}% du total
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{
              backgroundColor: "#DBEAFE",
              padding: "12px",
              display: "flex",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: "28px" }}>💰</span>
            </div>
            <div style={{ padding: "10px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "2px" }}>
                Chiffre d&apos;affaires
              </p>
              <p style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}>
                {formaterCA(chiffreAffaires)}
              </p>
              <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
                {commandes.filter((c) => c.statut !== "ANNULE").length} commandes
              </p>
            </div>
          </div>
        </div>

        {enAttente.length > 0 && (
          <>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              Boutiques en attente
              <span style={{
                backgroundColor: "#FED7AA",
                color: "#92400e",
                fontSize: "11px",
                fontWeight: "600",
                padding: "2px 8px",
                borderRadius: "10px",
              }}>
                {enAttente.length}
              </span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {enAttente.map((v) => (
                <LienVendeur key={v.id} vendeur={formaterVendeur(v)} />
              ))}
            </div>
          </>
        )}

        <h2 style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#111827",
          marginBottom: "12px",
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
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
