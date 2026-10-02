"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CarteQR from "./CarteQR";

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
      padding: "20px 14px",
      maxWidth: "500px",
      margin: "0 auto",
      backgroundColor: "#FAF5E8",
      minHeight: "100vh",
    }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "10px" }}>🎉</p>
        <h1 style={{
          fontSize: "20px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "4px",
        }}>
          {estMulti ? "Commandes enregistrées !" : "Commande enregistrée !"}
        </h1>
        <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
          {estMulti
            ? `Vos ${commandesIds.length} commandes ont été transmises aux vendeurs.`
            : "Votre commande a été transmise au vendeur."}
        </p>
      </div>

      {estMulti && (
        <div style={{
          backgroundColor: "#FEF3C7",
          color: "#78350F",
          padding: "10px 12px",
          borderRadius: "10px",
          marginBottom: "14px",
          border: "1px solid #FDE68A",
        }}>
          <p style={{ fontWeight: "800", fontSize: "11.5px", marginBottom: "3px" }}>
            📦 {commandesIds.length} commandes à retirer
          </p>
          <p style={{ fontSize: "10.5px", fontWeight: "500", lineHeight: 1.4 }}>
            Chaque commande a son propre QR. Présentez-les au bon vendeur dans l&apos;ordre indiqué.
          </p>
        </div>
      )}

      {commandesIds.length === 0 && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px 16px",
          textAlign: "center",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</p>
          <p style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>
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
      ))}

      <Link
        href="/"
        style={{
          display: "block",
          backgroundColor: "#1D4ED8",
          color: "white",
          padding: "12px",
          borderRadius: "10px",
          textAlign: "center",
          textDecoration: "none",
          fontWeight: "800",
          fontSize: "12.5px",
          marginBottom: "8px",
          marginTop: "16px",
        }}
      >
        🏪 Retour à l&apos;accueil
      </Link>

      <Link
        href="/client/compte"
        style={{
          display: "block",
          textAlign: "center",
          color: "#1D4ED8",
          fontSize: "11.5px",
          fontWeight: "700",
          textDecoration: "none",
        }}
      >
        Voir mes commandes
      </Link>
    </div>
  );
}

export default function PageConfirmation() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
          <p>Chargement...</p>
        </div>
      }
    >
      <ContenuConfirmation />
    </Suspense>
  );
        }
