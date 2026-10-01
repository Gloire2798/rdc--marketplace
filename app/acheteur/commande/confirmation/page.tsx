"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";

function ContenuConfirmation() {
  const searchParams = useSearchParams();
  const commandeId = searchParams.get("commande");

  const [copie, setCopie] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!commandeId) {
      setChargement(false);
      return;
    }

    // Récupérer le token QR de la commande
    fetch(`/api/client/commande/qr?commande=${commandeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.succes && data.qrToken) {
          QRCode.toDataURL(data.qrToken, {
            width: 300,
            margin: 2,
            color: {
              dark: "#0F172A",
              light: "#FFFFFF",
            },
          })
            .then((url) => {
              setQrImage(url);
              setChargement(false);
            })
            .catch(() => setChargement(false));
        } else {
          setChargement(false);
        }
      })
      .catch(() => setChargement(false));
  }, [commandeId]);

  const copierId = () => {
    if (commandeId) {
      navigator.clipboard.writeText(commandeId);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    }
  };

  return (
    <div style={{ padding: "20px 14px", maxWidth: "500px", margin: "0 auto", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "10px" }}>🎉</p>
        <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", marginBottom: "4px" }}>
          Commande enregistrée !
        </h1>
        <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
          Votre commande a été transmise au vendeur.
        </p>
      </div>

      {commandeId && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "14px",
          border: "1px solid #E8DFC8",
        }}>
          <p style={{ fontSize: "10.5px", color: "#64748b", marginBottom: "3px", fontWeight: "700" }}>
            Numéro de commande
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            <p style={{ fontSize: "13px", fontWeight: "800", wordBreak: "break-all", color: "#0F172A" }}>
              #{commandeId.slice(0, 12)}...
            </p>
            <button
              onClick={copierId}
              style={{
                padding: "5px 10px",
                fontSize: "10.5px",
                backgroundColor: copie ? "#16a34a" : "#F1ECE0",
                color: copie ? "white" : "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "700",
                flexShrink: 0,
              }}
            >
              {copie ? "✅ Copié" : "📋 Copier"}
            </button>
          </div>
        </div>
      )}

      {/* QR CODE */}
      {qrImage && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "14px",
          border: "1px solid #E8DFC8",
          textAlign: "center",
        }}>
          <p style={{
            fontSize: "10.5px",
            color: "#1E3A5F",
            marginBottom: "10px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            🎫 Votre QR code de retrait
          </p>

          <img
            src={qrImage}
            alt="QR Code"
            style={{
              width: "220px",
              height: "220px",
              display: "block",
              margin: "0 auto",
              borderRadius: "8px",
              backgroundColor: "white",
            }}
          />

          <p style={{
            fontSize: "10px",
            color: "#64748b",
            marginTop: "10px",
            fontWeight: "600",
            lineHeight: 1.4,
          }}>
            Présentez ce QR au vendeur lors du retrait.
            <br />
            Il ne peut être utilisé qu&apos;une seule fois.
          </p>
        </div>
      )}

      {chargement && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "14px",
          border: "1px solid #E8DFC8",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
            ⏳ Chargement du QR code...
          </p>
        </div>
      )}

      <div style={{
        backgroundColor: "#FEF3C7",
        color: "#78350F",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "16px",
        border: "1px solid #FDE68A",
      }}>
        <p style={{ fontWeight: "800", marginBottom: "4px", fontSize: "11.5px" }}>
          ⏳ En attente de validation
        </p>
        <p style={{ fontSize: "10.5px", fontWeight: "500", lineHeight: 1.4 }}>
          Le vendeur va vérifier votre paiement et valider la commande.
          Vous recevrez le statut "Prêt" pour venir récupérer.
        </p>
      </div>

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
    <Suspense fallback={
      <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
        <p>Chargement...</p>
      </div>
    }>
      <ContenuConfirmation />
    </Suspense>
  );
    }
