import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CarteQR from "@/app/acheteur/commande/confirmation/CarteQR";
import { Phone, Heart, ShoppingBag, Store, ChevronRight, Clock, CheckCircle, Package, XCircle } from "lucide-react";

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

  const nombreAbonnements = await prisma.abonnement.count({
    where: { userId: session.id },
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

  const configStatut: Record<string, { label: string; bg: string; color: string; Icon: any }> = {
    EN_ATTENTE: { label: "En attente", bg: "#FEF3C7", color: "#B45309", Icon: Clock },
    PAYE: { label: "Payé", bg: "#DBEAFE", color: "#1E40AF", Icon: CheckCircle },
    PRET: { label: "Prêt", bg: "#DCFCE7", color: "#15803D", Icon: Package },
    RETIRE: { label: "Retiré", bg: "#DCFCE7", color: "#15803D", Icon: CheckCircle },
    ANNULE: { label: "Annulé", bg: "#FEE2E2", color: "#991B1B", Icon: XCircle },
  };

  return (
    <div style={{
      padding: "16px 12px 100px 12px",
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#F5EAD2",
      minHeight: "100vh",
    }}>
      <h1 style={{
        fontSize: "24px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "3px",
        letterSpacing: "-0.5px",
      }}>
        Bonjour {session.nom || "Client"}
      </h1>
      <p style={{ color: "#57534E", fontSize: "12px", fontWeight: "700", marginBottom: "18px" }}>
        Bienvenue dans votre espace GK Sensei
      </p>

      {/* Carte téléphone */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "14px",
        border: "1px solid #D4C5A0",
        marginBottom: "12px",
        boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
      }}>
        <p style={{
          fontSize: "10px",
          color: "#57534E",
          fontWeight: "900",
          marginBottom: "5px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Téléphone
        </p>
        <p style={{
          fontSize: "14px",
          fontWeight: "900",
          color: "#0F172A",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <Phone size={14} strokeWidth={2.8} />
          {session.telephone}
        </p>
      </div>

      {/* Carte "Mes boutiques suivies" */}
      <Link
        href="/client/abonnements"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "14px",
          border: "1px solid #D4C5A0",
          marginBottom: "20px",
          textDecoration: "none",
          color: "inherit",
          boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
        }}
      >
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          backgroundColor: "#0F172A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Heart size={20} color="white" strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: "13.5px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "3px",
          }}>
            Mes boutiques suivies
          </p>
          <p style={{
            fontSize: "11px",
            color: "#57534E",
            fontWeight: "700",
          }}>
            {nombreAbonnements === 0
              ? "Aucune boutique suivie"
              : `${nombreAbonnements} boutique${nombreAbonnements > 1 ? "s" : ""} suivie${nombreAbonnements > 1 ? "s" : ""}`}
          </p>
        </div>
        <ChevronRight size={18} color="#57534E" strokeWidth={2.8} />
      </Link>

      {/* Titre section commandes */}
      <h2 style={{
        fontSize: "12px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <span style={{ display: "inline-block", width: "3px", height: "14px", backgroundColor: "#EA580C", borderRadius: "2px" }} />
        Mes commandes ({commandes.length})
      </h2>

      {commandes.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "50px 20px",
          textAlign: "center",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#F5EAD2",
            marginBottom: "12px",
          }}>
            <ShoppingBag size={28} color="#EA580C" strokeWidth={2.2} />
          </div>
          <p style={{
            fontSize: "15px",
            fontWeight: "900",
            marginBottom: "6px",
            color: "#0F172A",
          }}>
            Aucune commande
          </p>
          <p style={{
            color: "#57534E",
            marginBottom: "20px",
            fontSize: "11.5px",
            fontWeight: "600",
            lineHeight: 1.5,
          }}>
            Découvrez nos boutiques et faites votre première commande.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0F172A",
              color: "white",
              padding: "12px 20px",
              borderRadius: "24px",
              fontWeight: "900",
              fontSize: "12.5px",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.20)",
            }}
          >
            <Store size={14} strokeWidth={2.8} />
            Voir les boutiques
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
            const IconeStatut = conf.Icon;
            const qrVisible = c.statut === "EN_ATTENTE" || c.statut === "PAYE" || c.statut === "PRET";

            return (
              <div
                key={c.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "20px",
                  padding: "14px",
                  border: "1px solid #D4C5A0",
                  boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
                }}
              >
                {/* Header carte */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "10px",
                  paddingBottom: "10px",
                  borderBottom: "1px dashed #D4C5A0",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontSize: "9.5px",
                      color: "#94A3B8",
                      fontWeight: "800",
                      marginBottom: "3px",
                      letterSpacing: "0.2px",
                    }}>
                      #{c.id.slice(0, 8)}
                    </p>
                    <p style={{
                      fontSize: "13px",
                      fontWeight: "900",
                      color: "#0F172A",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "3px",
                    }}>
                      <Store size={12} strokeWidth={2.8} />
                      {c.vendeur.nomBoutique}
                    </p>
                    <p style={{
                      fontSize: "9.5px",
                      color: "#57534E",
                      fontWeight: "700",
                    }}>
                      {formaterDate(c.createdAt)}
                    </p>
                  </div>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "900",
                    backgroundColor: conf.bg,
                    color: conf.color,
                    padding: "4px 10px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    <IconeStatut size={11} strokeWidth={2.8} />
                    {conf.label}
                  </span>
                </div>

                {/* Articles */}
                <div style={{
                  backgroundColor: "#F5EAD2",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  marginBottom: "10px",
                  border: "1px solid #D4C5A0",
                }}>
                  {c.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11.5px",
                        marginBottom: "4px",
                        gap: "8px",
                      }}
                    >
                      <span style={{
                        color: "#0F172A",
                        fontWeight: "800",
                        minWidth: 0,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {item.produit.nom} × {item.quantite}
                      </span>
                      <span style={{ color: "#57534E", fontWeight: "800", flexShrink: 0 }}>
                        {formaterPrix(item.prixUnitaire * item.quantite, item.produit.devise)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: "8px",
                  marginBottom: qrVisible ? "10px" : "0",
                }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    color: "#57534E",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Total
                  </span>
                  <div style={{ textAlign: "right" }}>
                    {totalUSD > 0 && (
                      <p style={{
                        fontSize: "17px",
                        fontWeight: "900",
                        color: "#EA580C",
                        lineHeight: 1.2,
                        letterSpacing: "-0.3px",
                      }}>
                        {formaterPrix(totalUSD, "USD")}
                      </p>
                    )}
                    {totalFC > 0 && (
                      <p style={{
                        fontSize: "17px",
                        fontWeight: "900",
                        color: "#EA580C",
                        lineHeight: 1.2,
                        letterSpacing: "-0.3px",
                      }}>
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
