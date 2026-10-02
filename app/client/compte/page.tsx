import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CarteQR from "@/app/acheteur/commande/confirmation/CarteQR";

export default async function CompteClient() {
  const session = await getSession();

  if (!session) {
    redirect("/vendeur/connexion");
  }

  if (session.role !== "ACHETEUR") {
    if (session.role === "VENDEUR") redirect("/vendeur/dashboard");
    if (session.role === "ADMIN") redirect("/admin/dashboard");
  }

  const commandes = await prisma.commande.findMany({
    where: { acheteurId: session.id },
    include: {
      vendeur: true,
      items: {
        include: {
          produit: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") return `${prix.toFixed(2)} $`;
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  const formaterDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Kinshasa",
    });
  };

  const configStatut: Record<string, { label: string; bg: string; color: string }> = {
    EN_ATTENTE: { label: "⏳ En attente", bg: "#FEF3C7", color: "#78350F" },
    PAYE: { label: "✅ Payé", bg: "#DBEAFE", color: "#1E40AF" },
    PRET: { label: "🟢 Prêt", bg: "#DCFCE7", color: "#15803D" },
    RETIRE: { label: "🎉 Retiré", bg: "#DBEAFE", color: "#1E40AF" },
    ANNULE: { label: "❌ Annulé", bg: "#FEE2E2", color: "#991B1B" },
  };

  return (
    <div style={{
      padding: "20px 14px 100px 14px",
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#FAF5E8",
      minHeight: "100vh",
    }}>
      <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", marginBottom: "4px" }}>
        Bonjour {session.nom || "Client"}
      </h1>
      <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "18px" }}>
        Bienvenue dans votre espace GK Sensei
      </p>

      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "12px 14px",
        border: "1px solid #E8DFC8",
        marginBottom: "18px",
      }}>
        <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", marginBottom: "3px", textTransform: "uppercase" }}>
          Téléphone
        </p>
        <p style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>
          📞 {session.telephone}
        </p>
      </div>

      <h2 style={{
        fontSize: "15px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "12px",
      }}>
        Mes commandes ({commandes.length})
      </h2>

      {commandes.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "50px 20px",
          textAlign: "center",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "44px", marginBottom: "12px" }}>🛍️</p>
          <p style={{ fontSize: "14px", fontWeight: "800", marginBottom: "6px", color: "#0F172A" }}>
            Aucune commande
          </p>
          <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "11.5px", fontWeight: "500" }}>
            Découvrez nos boutiques et faites votre première commande.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              backgroundColor: "#1D4ED8",
              color: "white",
              padding: "10px 20px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "12.5px",
              textDecoration: "none",
            }}
          >
            Voir les boutiques
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {commandes.map((c) => {
            let totalFC = 0;
            let totalUSD = 0;

            c.items.forEach((item) => {
              const montant = item.prixUnitaire * item.quantite;
              if (item.produit.devise === "USD") {
                totalUSD += montant;
              } else {
                totalFC += montant;
              }
            });

            const conf = configStatut[c.statut] || configStatut.EN_ATTENTE;
            const qrVisible = c.statut === "EN_ATTENTE" || c.statut === "PAYE" || c.statut === "PRET";

            return (
              <div
                key={c.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "14px",
                  border: "1px solid #E8DFC8",
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "10px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #F1ECE0",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", marginBottom: "2px" }}>
                      Commande #{c.id.slice(0, 8)}
                    </p>
                    <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A" }}>
                      🏪 {c.vendeur.nomBoutique}
                    </p>
                    <p style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }}>
                      {formaterDate(c.createdAt)}
                    </p>
                  </div>
                  <span style={{
                    fontSize: "9.5px",
                    fontWeight: "800",
                    backgroundColor: conf.bg,
                    color: conf.color,
                    padding: "4px 8px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}>
                    {conf.label}
                  </span>
                </div>

                <div style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  marginBottom: "10px",
                }}>
                  {c.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        marginBottom: "3px",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "#334155", fontWeight: "600", minWidth: 0, flex: 1 }}>
                        {item.produit.nom} × {item.quantite}
                      </span>
                      <span style={{ color: "#64748b", fontWeight: "700", flexShrink: 0 }}>
                        {formaterPrix(item.prixUnitaire * item.quantite, item.produit.devise)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: "8px",
                  marginBottom: qrVisible ? "10px" : "0",
                }}>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: "#0F172A" }}>
                    TOTAL
                  </span>
                  <div style={{ textAlign: "right" }}>
                    {totalUSD > 0 && (
                      <p style={{ fontSize: "14px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.2 }}>
                        {formaterPrix(totalUSD, "USD")}
                      </p>
                    )}
                    {totalFC > 0 && (
                      <p style={{ fontSize: "14px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.2 }}>
                        {formaterPrix(totalFC, "FC")}
                      </p>
                    )}
                  </div>
                </div>

                {qrVisible && (
                  <div style={{ marginTop: "10px" }}>
                    <CarteQR
                      commandeId={c.id}
                      index={0}
                      total={1}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
        }
