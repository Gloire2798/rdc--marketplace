import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoutonSuivre from "@/app/components/BoutonSuivre";
import { ArrowLeft, Heart, MapPin, Store } from "lucide-react";

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
      padding: "16px 12px 100px 12px",
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#F5EAD2",
      minHeight: "100vh",
    }}>
      <Link
        href="/client/compte"
        style={{
          color: "#0F172A",
          fontSize: "11px",
          fontWeight: "800",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <ArrowLeft size={12} strokeWidth={2.8} />
        Retour
      </Link>

      <h1 style={{
        fontSize: "22px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "3px",
        marginTop: "12px",
        letterSpacing: "-0.4px",
      }}>
        Mes boutiques suivies
      </h1>
      <p style={{ color: "#57534E", fontSize: "11.5px", fontWeight: "700", marginBottom: "18px" }}>
        {abonnements.length} boutique{abonnements.length > 1 ? "s" : ""} suivie{abonnements.length > 1 ? "s" : ""}
      </p>

      {abonnements.length === 0 ? (
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
            <Heart size={28} color="#EA580C" strokeWidth={2.2} />
          </div>
          <p style={{
            fontSize: "15px",
            fontWeight: "900",
            marginBottom: "6px",
            color: "#0F172A",
          }}>
            Aucune boutique suivie
          </p>
          <p style={{
            color: "#57534E",
            marginBottom: "20px",
            fontSize: "11.5px",
            fontWeight: "600",
            lineHeight: 1.5,
          }}>
            Suivez des boutiques pour recevoir leurs nouveautés.
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
                borderRadius: "16px",
                padding: "12px",
                border: "1px solid #D4C5A0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
              }}
            >
              {a.vendeur.logo && a.vendeur.logo.startsWith("http") ? (
                <img
                  src={a.vendeur.logo}
                  alt={a.vendeur.nomBoutique}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    objectFit: "contain",
                    flexShrink: 0,
                    backgroundColor: "#F5EAD2",
                    padding: "3px",
                    boxSizing: "border-box",
                    border: "1px solid #D4C5A0",
                  }}
                />
              ) : (
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  backgroundColor: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                  fontWeight: "900",
                  color: "white",
                }}>
                  {(a.vendeur.nomBoutique || "?").trim().charAt(0).toUpperCase()}
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
                    fontSize: "13.5px",
                    fontWeight: "900",
                    color: "#0F172A",
                    marginBottom: "3px",
                  }}>
                    {a.vendeur.nomBoutique}
                  </p>
                  {a.vendeur.adresse && (
                    <p style={{
                      fontSize: "10.5px",
                      color: "#57534E",
                      fontWeight: "700",
                      marginBottom: "6px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                      <MapPin size={10} strokeWidth={2.8} />
                      {a.vendeur.adresse}
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
