import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoutonSuivre from "@/app/components/BoutonSuivre";

export default async function MesAbonnements() {
  const session = await getSession();

  if (!session || session.role !== "ACHETEUR") {
    redirect("/vendeur/connexion");
  }

  const abonnements = await prisma.abonnement.findMany({
    where: { userId: session.id },
    include: {
      vendeur: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{
      padding: "20px 14px 100px 14px",
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#FAF5E8",
      minHeight: "100vh",
    }}>
      <Link href="/client/compte" style={{ color: "#1D4ED8", fontSize: "11px", fontWeight: "700" }}>
        ← Retour
      </Link>

      <h1 style={{
        fontSize: "20px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "4px",
        marginTop: "12px",
      }}>
        Mes boutiques suivies
      </h1>
      <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "18px" }}>
        {abonnements.length} boutique{abonnements.length > 1 ? "s" : ""} suivie{abonnements.length > 1 ? "s" : ""}
      </p>

      {abonnements.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "50px 20px",
          textAlign: "center",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "44px", marginBottom: "12px" }}>💙</p>
          <p style={{ fontSize: "14px", fontWeight: "800", marginBottom: "6px", color: "#0F172A" }}>
            Aucune boutique suivie
          </p>
          <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "11.5px", fontWeight: "500" }}>
            Suivez des boutiques pour recevoir leurs nouveautés.
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
            Découvrir les boutiques
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {abonnements.map((a) => (
            <div
              key={a.id}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "12px",
                border: "1px solid #E8DFC8",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {a.vendeur.logo ? (
                <img
                  src={a.vendeur.logo}
                  alt={a.vendeur.nomBoutique}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    flexShrink: 0,
                    backgroundColor: "#F8FAFC",
                  }}
                />
              ) : (
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "10px",
                  backgroundColor: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                }}>
                  🏪
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/acheteur/boutique/${a.vendeur.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <p style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#0F172A",
                    marginBottom: "2px",
                  }}>
                    {a.vendeur.nomBoutique}
                  </p>
                  {a.vendeur.adresse && (
                    <p style={{
                      fontSize: "10px",
                      color: "#78716C",
                      fontWeight: "600",
                      marginBottom: "2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      📍 {a.vendeur.adresse}
                    </p>
                  )}
                </Link>

                <BoutonSuivre
                  vendeurId={a.vendeur.id}
                  estConnecte={true}
                  estClient={true}
                  suiviInitial={true}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
                  }
