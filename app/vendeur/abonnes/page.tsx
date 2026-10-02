import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; 
import Link from "next/link";
import BoutonRetirerAbonne from "./BoutonRetirerAbonne";

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
      padding: "20px 14px 100px 14px",
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#F3F4F6",
      minHeight: "100vh",
    }}>
      <Link href="/vendeur/dashboard" style={{ color: "#1D4ED8", fontSize: "11.5px", fontWeight: "700" }}>
        ← Retour
      </Link>

      <h1 style={{
        fontSize: "20px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "4px",
        marginTop: "12px",
      }}>
        Mes abonnés
      </h1>
      <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "18px" }}>
        {abonnes.length} client{abonnes.length > 1 ? "s" : ""} suit{abonnes.length > 1 ? "vent" : ""} votre boutique
      </p>

      {abonnes.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "50px 20px",
          textAlign: "center",
          border: "1px solid #E2E8F0",
        }}>
          <p style={{ fontSize: "44px", marginBottom: "12px" }}>💙</p>
          <p style={{ fontSize: "14px", fontWeight: "800", marginBottom: "6px", color: "#0F172A" }}>
            Aucun abonné
          </p>
          <p style={{ color: "#64748b", fontSize: "11.5px", fontWeight: "500" }}>
            Les clients qui suivent votre boutique apparaîtront ici.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {abonnes.map((a) => (
            <div
              key={a.id}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "12px",
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "#EFF6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
                fontWeight: "800",
                color: "#1D4ED8",
              }}>
                {(a.user.nom || "?").charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#0F172A",
                  marginBottom: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {a.user.nom || "Client"}
                </p>
                <p style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "600",
                }}>
                  📞 {a.user.telephone}
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
