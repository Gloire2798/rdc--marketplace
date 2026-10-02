"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";

const INTERVALLE_POLLING = 5000;

function ContenuConfirmation() {
  const searchParams = useSearchParams();
  const commandeId = searchParams.get("commande");

  const [copie, setCopie] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [statut, setStatut] = useState<string>("EN_ATTENTE");
  const [retireAt, setRetireAt] = useState<string | null>(null);
  const [nomBoutique, setNomBoutique] = useState<string>("");
  const [chargement, setChargement] = useState(true);

  const chargerQR = async () => {
    if (!commandeId) return;

    try {
      const res = await fetch(`/api/client/commande/qr?commande=${commandeId}`);
      const data = await res.json();

      if (!data.succes) {
        setChargement(false);
        return;
      }

      setStatut(data.statut || "EN_ATTENTE");
      setRetireAt(data.retireAt || null);
      setNomBoutique(data.nomBoutique || "");

      if (data.statut === "RETIRE" || !data.qrToken) {
        setQrImage("");
        setChargement(false);
        return;
      }

      const url = await QRCode.toDataURL(data.qrToken, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      });
      setQrImage(url);
      setChargement(false);
    } catch {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerQR();

    const interval = setInterval(() => {
      chargerQR();
    }, INTERVALLE_POLLING);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandeId]);

  const copierId = () => {
    if (commandeId) {
      navigator.clipboard.writeText(commandeId);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    }
  };

  const configStatut = {
    EN_ATTENTE: {
      titre: "⏳ En attente de validation",
      texte:
        "Le vendeur va vérifier votre paiement et valider la commande. Vous recevrez le statut \"Prêt\" pour venir récupérer.",
      bg: "#FEF3C7",
      color: "#78350F",
      border: "#FDE68A",
      emoji: "🎉",
      titrePage: "Commande enregistrée !",
      sousTitre: "Votre commande a été transmise au vendeur.",
    },
    PAYE: {
      titre: "✅ Paiement validé",
      texte: "Votre paiement a été confirmé. Le vendeur prépare votre commande.",
      bg: "#DBEAFE",
      color: "#1E40AF",
      border: "#BFDBFE",
      emoji: "✅",
      titrePage: "Paiement validé !",
      sousTitre: "Votre commande est en préparation.",
    },
    PRET: {
      titre: "🟢 Prêt pour le retrait !",
      texte:
        "Votre commande est prête. Présentez votre QR code au vendeur pour la récupérer.",
      bg: "#DCFCE7",
      color: "#15803D",
      border: "#BBF7D0",
      emoji: "🟢",
      titrePage: "Commande prête !",
      sousTitre: "Vous pouvez venir la récupérer.",
    },
    RETIRE: {
      titre: "🎉 Commande retirée",
      texte:
        "Votre commande a bien été retirée. Merci pour votre achat sur GK Sensei !",
      bg: "#DBEAFE",
      color: "#1E40AF",
      border: "#BFDBFE",
      emoji: "🎉",
      titrePage: "Commande retirée !",
      sousTitre: "Merci pour votre achat.",
    },
  };

  const config =
    configStatut[statut as keyof typeof configStatut] ||
    configStatut.EN_ATTENTE;

  return (
    <div
      style={{
        padding: "20px 14px",
        maxWidth: "500px",
        margin: "0 auto",
        backgroundColor: "#FAF5E8",
        minHeight: "100vh",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "10px" }}>{config.emoji}</p>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "4px",
          }}
        >
          {config.titrePage}
        </h1>
        <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
          {config.sousTitre}
        </p>
      </div>

      {commandeId && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "14px",
            border: "1px solid #E8DFC8",
          }}
        >
          <p
            style={{
              fontSize: "10.5px",
              color: "#64748b",
              marginBottom: "3px",
              fontWeight: "700",
            }}
          >
            Numéro de commande
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: "800",
                wordBreak: "break-all",
                color: "#0F172A",
              }}
            >
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

      {qrImage && statut !== "RETIRE" && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "14px",
            border: "1px solid #E8DFC8",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "10.5px",
              color: "#1E3A5F",
              marginBottom: "10px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
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

          <p
            style={{
              fontSize: "10px",
              color: "#64748b",
              marginTop: "10px",
              fontWeight: "600",
              lineHeight: 1.4,
            }}
          >
            Présentez ce QR au vendeur lors du retrait.
            <br />
            Il ne peut être utilisé qu&apos;une seule fois.
          </p>
        </div>
      )}

      {statut === "RETIRE" && retireAt && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px 16px",
            marginBottom: "14px",
            border: "2px solid #BBF7D0",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "40px", marginBottom: "8px" }}>✅</p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#15803D",
              marginBottom: "4px",
            }}
          >
            Commande retirée avec succès
          </p>
          {nomBoutique && (
            <p
              style={{
                fontSize: "11.5px",
                color: "#475569",
                fontWeight: "600",
                marginBottom: "2px",
              }}
            >
              chez <strong>{nomBoutique}</strong>
            </p>
          )}
          <p style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600" }}>
            le{" "}
            {new Date(retireAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}

      {chargement && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "14px",
            border: "1px solid #E8DFC8",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
            ⏳ Chargement...
          </p>
        </div>
      )}

      <div
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "12px",
          borderRadius: "10px",
          marginBottom: "16px",
          border: `1px solid ${config.border}`,
        }}
      >
        <p style={{ fontWeight: "800", marginBottom: "4px", fontSize: "11.5px" }}>
          {config.titre}
        </p>
        <p style={{ fontSize: "10.5px", fontWeight: "500", lineHeight: 1.4 }}>
          {config.texte}
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
    <Suspense
      fallback={
        <div
          style={{
            padding: "60px 16px",
            textAlign: "center",
            backgroundColor: "#FAF5E8",
            minHeight: "100vh",
          }}
        >
          <p>Chargement...</p>
        </div>
      }
    >
      <ContenuConfirmation />
    </Suspense>
  );
      }
