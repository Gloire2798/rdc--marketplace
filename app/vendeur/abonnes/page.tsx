import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoutonRetirerAbonne from "./BoutonRetirerAbonne";
import { ArrowLeft, Heart, Phone } from "lucide-react";

export default async function MesAbonnes() {
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

  const abonnes = await prisma.abonnement.findMany({
    where: { vendeurId: vendeur.id },
    include: {
      user: {
        select: {
          id: true,
          nom: true,
          telephone: true,
        },
      },
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
        href="/vendeur/dashboard"
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
        Mes abonnés
      </h1>
      <p style={{ color: "#57534E", fontSize: "11.5px", fontWeight: "700", marginBottom: "18px" }}>
        {abonnes.length} client{abonnes.length > 1 ? "s" : ""} suit{abonnes.length > 1 ? "vent" : ""} votre boutique
      </p>

      {abonnes.length === 0 ? (
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
            Aucun abonné
          </p>
          <p style={{
            color: "#57534E",
            fontSize: "11.5px",
            fontWeight: "600",
            lineHeight: 1.5,
          }}>
            Les clients qui suivent votre boutique apparaîtront ici.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {abonnes.map((a) => (
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
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                backgroundColor: "#0F172A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
                fontWeight: "900",
                color: "white",
              }}>
                {(a.user.nom || "?").charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "13px",
                  fontWeight: "900",
                  color: "#0F172A",
                  marginBottom: "3px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {a.user.nom || "Client"}
                </p>
                <p style={{
                  fontSize: "11px",
                  color: "#57534E",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  <Phone size={10} strokeWidth={2.8} />
                  {a.user.telephone}
                </p>
              </div>

              <BoutonRetirerAbonne
                abonnementId={a.id}
                nomClient={a.user.nom || "Client"}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
                  }
