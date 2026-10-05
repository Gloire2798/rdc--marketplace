"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CarteQR from "./CarteQR";
import { CheckCircle, Package, AlertTriangle, Store } from "lucide-react";

function ContenuConfirmation() {
  const searchParams = useSearchParams();

  const commandeUnique = searchParams.get("commande");
  const commandesParam = searchParams.get("commandes");

  const commandesIds = commandeUnique
    ? [commandeUnique]
    : commandesParam
    ? commandesParam.split(",").filter((id) => id.trim())
    : [];

  const estMulti = commandesIds.length > 1;

  return (
    <div style={{
      padding: "20px 14px 30px 14px",
      maxWidth: "500px",
      margin: "0 auto",
      backgroundColor: "#F5EAD2",
      minHeight: "100vh",
    }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#DCFCE7",
          border: "2px solid #16A34A",
          marginBottom: "14px",
        }}>
          <CheckCircle size={44} color="#16A34A" strokeWidth={2.5} />
        </div>

        <h1 style={{
          fontSize: "22px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "6px",
          letterSpacing: "-0.4px",
        }}>
          {estMulti ? "Commandes enregistrées !" : "Commande enregistrée !"}
        </h1>
        <p style={{ color: "#57534E", fontSize: "12.5px", fontWeight: "700" }}>
          {estMulti
            ? `Vos ${commandesIds.length} commandes ont été transmises aux vendeurs.`
            : "Votre commande a été transmise au vendeur."}
        </p>
      </div>

      {estMulti && (
        <div style={{
          backgroundColor: "white",
          color: "#0F172A",
          padding: "12px 14px",
          borderRadius: "16px",
          marginBottom: "14px",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <p style={{
            fontWeight: "900",
            fontSize: "12px",
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            <Package size={14} strokeWidth={2.8} color="#EA580C" />
            {commandesIds.length} commandes à retirer
          </p>
          <p style={{ fontSize: "11px", fontWeight: "600", lineHeight: 1.5, color: "#57534E" }}>
            Chaque commande a son propre QR. Présentez-les au bon vendeur dans l&apos;ordre indiqué.
          </p>
        </div>
      )}

      {commandesIds.length === 0 && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "30px 16px",
          textAlign: "center",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <AlertTriangle size={40} color="#EA580C" strokeWidth={2} style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: "14px", fontWeight: "900", color: "#0F172A" }}>
            Aucune commande trouvée
          </p>
        </div>
      )}

      {commandesIds.map((id, index) => (
        <CarteQR
          key={id}
          commandeId={id}
          index={index}
          total={commandesIds.length}
        />
      ))}      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          backgroundColor: "#0F172A",
          color: "white",
          padding: "16px",
          borderRadius: "26px",
          textAlign: "center",
          textDecoration: "none",
          fontWeight: "900",
          fontSize: "13px",
          marginBottom: "12px",
          marginTop: "16px",
          letterSpacing: "-0.2px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.20)",
        }}
      >
        <Store size={16} strokeWidth={2.8} />
        Retour à l&apos;accueil
      </Link>

      <Link
        href="/client/compte"
        style={{
          display: "block",
          textAlign: "center",
          color: "#0F172A",
          fontSize: "12.5px",
          fontWeight: "800",
          textDecoration: "none",
          padding: "8px",
        }}
      >
        Voir mes commandes →
      </Link>
    </div>
  );
}

export default function PageConfirmation() {
  return (
    <Suspense
      fallback={
        <div style={{
          padding: "60px 16px",
          textAlign: "center",
          backgroundColor: "#F5EAD2",
          minHeight: "100vh",
        }}>
          <p style={{ color: "#57534E", fontWeight: "700" }}>Chargement...</p>
        </div>
      }
    >
      <ContenuConfirmation />
    </Suspense>
  );
          }
