"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ContenuConfirmation() {
  const searchParams = useSearchParams();
  const commandeId = searchParams.get("commande");

  const [copie, setCopie] = useState(false);

  const copierId = () => {
    if (commandeId) {
      navigator.clipboard.writeText(commandeId);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 16px", maxWidth: "600px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <p style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</p>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
          Commande enregistrée !
        </h1>
        <p style={{ color: "#6b7280" }}>
          Votre commande a bien été transmise au vendeur.
        </p>
      </div>

      {commandeId && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
            Numéro de commande
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            <p style={{ fontSize: "16px", fontWeight: "600", wordBreak: "break-all" }}>
              {commandeId.slice(0, 12)}...
            </p>
            <button
              onClick={copierId}
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                backgroundColor: copie ? "#16a34a" : "#e5e7eb",
                color: copie ? "white" : "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                flexShrink: 0,
              }}
            >
              {copie ? "✅ Copié" : "📋 Copier"}
            </button>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: "#fef3c7",
        color: "#92400e",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "24px",
      }}>
        <p style={{ fontWeight: "600", marginBottom: "8px" }}>
          ⏳ En attente de validation
        </p>
        <p style={{ fontSize: "14px" }}>
          Le vendeur va vérifier votre paiement et valider la commande.
          Vous serez contacté par téléphone ou WhatsApp.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
          Prochaines étapes
        </h2>
        <ol style={{ paddingLeft: "20px", fontSize: "14px", lineHeight: "1.8", color: "#374151" }}>
          <li>Le vendeur vérifie votre acompte</li>
          <li>Il valide la commande</li>
          <li>Vous recevez un QR code par SMS/WhatsApp</li>
          <li>Vous récupérez le produit et payez le reste</li>
        </ol>
      </div>

      <Link
        href="/"
        className="btn btn-primary"
        style={{ display: "block", textAlign: "center" }}
      >
        🏪 Retour à l'accueil
      </Link>

      <Link
        href="/client/compte"
        style={{
          display: "block",
          textAlign: "center",
          marginTop: "12px",
          color: "#2563eb",
          fontSize: "14px",
        }}
      >
        Voir mes commandes
      </Link>
    </div>
  );
}

export default function PageConfirmation() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: "60px 16px", textAlign: "center" }}>
        <p>Chargement...</p>
      </div>
    }>
      <ContenuConfirmation />
    </Suspense>
  );
      }
