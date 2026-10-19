import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CarteLitigeAdmin from "./CarteLitigeAdmin";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default async function AdminLitiges() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const litiges = await prisma.litige.findMany({
    include: {
      client: true,
      vendeur: true,
      commande: {
        include: {
          items: {
            include: { produit: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const ouverts = litiges.filter((l) => l.statut === "OUVERT");
  const traites = litiges.filter((l) => l.statut !== "OUVERT");

  return (
    <div style={{ padding: "16px 12px 40px 12px", maxWidth: "800px", margin: "0 auto", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
      <Link
        href="/admin/dashboard"
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
        Retour au dashboard
      </Link>

      <h1 style={{
        fontSize: "22px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "3px",
        marginTop: "12px",
        letterSpacing: "-0.4px",
      }}>
        Litiges
      </h1>
      <p style={{ color: "#57534E", fontSize: "11.5px", fontWeight: "700", marginBottom: "18px" }}>
        Gérez les signalements clients et vendeurs.
      </p>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "6px",
        marginBottom: "20px",
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 8px",
          border: "1px solid #D4C5A0",
          textAlign: "center",
        }}>
          <Clock size={16} color="#B45309" strokeWidth={2.8} style={{ marginBottom: "4px" }} />
          <p style={{ color: "#57534E", fontSize: "9.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>
            À traiter
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#B45309", lineHeight: 1 }}>
            {ouverts.length}
          </h2>
        </div>
        <div style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 8px",
          border: "1px solid #D4C5A0",
          textAlign: "center",
        }}>
          <CheckCircle size={16} color="#16A34A" strokeWidth={2.8} style={{ marginBottom: "4px" }} />
          <p style={{ color: "#57534E", fontSize: "9.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>
            Résolus
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#16A34A", lineHeight: 1 }}>
            {litiges.filter((l) => l.statut === "RESOLU").length}
          </h2>
        </div>
        <div style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 8px",
          border: "1px solid #D4C5A0",
          textAlign: "center",
        }}>
          <AlertTriangle size={16} color="#DC2626" strokeWidth={2.8} style={{ marginBottom: "4px" }} />
          <p style={{ color: "#57534E", fontSize: "9.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>
            Rejetés
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#DC2626", lineHeight: 1 }}>
            {litiges.filter((l) => l.statut === "REJETE").length}
          </h2>
        </div>
      </div>

      {litiges.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "50px 20px",
          borderRadius: "20px",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#F5EAD2",
            marginBottom: "10px",
          }}>
            <CheckCircle size={26} color="#16A34A" strokeWidth={2} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "900", marginBottom: "4px", color: "#0F172A" }}>
            Aucun litige
          </p>
          <p style={{ color: "#57534E", fontSize: "11px", fontWeight: "600" }}>
            Tout va bien pour le moment.
          </p>
        </div>
      ) : (
        <>
          {ouverts.length > 0 && (
            <>
              <h2 style={{
                fontSize: "12px",
                fontWeight: "900",
                marginBottom: "8px",
                color: "#B45309",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span style={{ display: "inline-block", width: "3px", height: "12px", backgroundColor: "#B45309", borderRadius: "2px" }} />
                À traiter ({ouverts.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {ouverts.map((l) => (
                  <CarteLitigeAdmin key={l.id} litige={l} />
                ))}
              </div>
            </>
          )}

          {traites.length > 0 && (
            <>
              <h2 style={{
                fontSize: "12px",
                fontWeight: "900",
                marginBottom: "8px",
                color: "#57534E",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span style={{ display: "inline-block", width: "3px", height: "12px", backgroundColor: "#57534E", borderRadius: "2px" }} />
                Historique ({traites.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {traites.map((l) => (
                  <CarteLitigeAdmin key={l.id} litige={l} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
      }
