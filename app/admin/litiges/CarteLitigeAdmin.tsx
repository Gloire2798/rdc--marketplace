"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, User, Store, CheckCircle, XCircle, MessageSquare, Send } from "lucide-react";

const LABELS_RAISON: Record<string, string> = {
  PRODUIT_DIFFERENT: "Produit différent",
  PRODUIT_CASSE: "Produit cassé",
  NON_RECU: "Non reçu",
  AUTRE: "Autre",
};

interface CarteProps {
  litige: any;
}

export default function CarteLitigeAdmin({ litige }: CarteProps) {
  const router = useRouter();
  const [decision, setDecision] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const formaterDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Kinshasa",
    });
  };

  const traiter = async (statut: "RESOLU" | "REJETE") => {
    setErreur("");

    if (decision.trim().length < 5) {
      setErreur("Expliquez votre décision (min 5 caractères)");
      return;
    }

    setEnvoi(true);

    try {
      const res = await fetch(`/api/admin/litiges/${litige.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut, decisionAdmin: decision.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur lors du traitement");
        setEnvoi(false);
        return;
      }

      router.refresh();
    } catch {
      setErreur("Impossible de contacter le serveur");
      setEnvoi(false);
    }
  };

  const couleurBordure =
    litige.statut === "OUVERT" ? "#B45309" :
    litige.statut === "RESOLU" ? "#16A34A" :
    "#DC2626";

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "16px",
      padding: "14px",
      border: "1px solid #D4C5A0",
      borderLeftWidth: "4px",
      borderLeftColor: couleurBordure,
      boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "8px",
        marginBottom: "10px",
        paddingBottom: "10px",
        borderBottom: "1px dashed #D4C5A0",
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: "9.5px",
            color: "#94A3B8",
            fontWeight: "800",
            marginBottom: "3px",
          }}>
            #{litige.commandeId.slice(0, 8)} · {formaterDate(litige.createdAt)}
          </p>
          <p style={{
            fontSize: "12.5px",
            fontWeight: "900",
            color: "#0F172A",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "2px",
          }}>
            <AlertTriangle size={12} strokeWidth={2.8} color="#DC2626" />
            {LABELS_RAISON[litige.raison] || litige.raison}
          </p>
          <p style={{
            fontSize: "10.5px",
            fontWeight: "700",
            color: "#57534E",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <User size={10} strokeWidth={2.8} />
            {litige.client.nom || "Client"} ·{" "}
            <Store size={10} strokeWidth={2.8} />
            {litige.vendeur.nomBoutique}
          </p>
        </div>
        <span style={{
          fontSize: "9.5px",
          fontWeight: "900",
          padding: "3px 9px",
          borderRadius: "9px",
          backgroundColor:
            litige.statut === "OUVERT" ? "#FEF3C7" :
            litige.statut === "RESOLU" ? "#DCFCE7" : "#FEE2E2",
          color: couleurBordure,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
          letterSpacing: "0.3px",
        }}>
          {litige.statut === "OUVERT" ? "À traiter" :
           litige.statut === "RESOLU" ? "Résolu" : "Rejeté"}
        </span>
      </div>

      {/* Description du client */}
      <div style={{
        backgroundColor: "#F5EAD2",
        borderRadius: "10px",
        padding: "10px 12px",
        marginBottom: "10px",
        border: "1px solid #D4C5A0",
      }}>
        <p style={{
          fontSize: "9.5px",
          fontWeight: "900",
          color: "#57534E",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          marginBottom: "5px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <MessageSquare size={10} strokeWidth={2.8} />
          Description du client
        </p>
        <p style={{
          fontSize: "11.5px",
          fontWeight: "700",
          color: "#0F172A",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
        }}>
          {litige.description}
        </p>
        {litige.photoUrl && (
          <a
            href={litige.photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "8px",
              fontSize: "10.5px",
              fontWeight: "900",
              color: "#1D4ED8",
              textDecoration: "underline",
            }}
          >
            Voir la photo →
          </a>
        )}
      </div>

      {/* Décision admin (si déjà traitée) */}
      {litige.decisionAdmin && (
        <div style={{
          backgroundColor: litige.statut === "RESOLU" ? "#DCFCE7" : "#FEE2E2",
          borderRadius: "10px",
          padding: "10px 12px",
          marginBottom: "10px",
          border: `1px solid ${litige.statut === "RESOLU" ? "#16A34A" : "#DC2626"}`,
        }}>
          <p style={{
            fontSize: "9.5px",
            fontWeight: "900",
            color: litige.statut === "RESOLU" ? "#15803D" : "#991B1B",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: "5px",
          }}>
            Votre décision
          </p>
          <p style={{
            fontSize: "11.5px",
            fontWeight: "700",
            color: "#0F172A",
            lineHeight: 1.5,
          }}>
            {litige.decisionAdmin}
          </p>
        </div>
      )}

      {/* Formulaire de décision (uniquement si OUVERT) */}
      {litige.statut === "OUVERT" && (
        <div>
          <label style={{
            display: "block",
            fontSize: "9.5px",
            fontWeight: "900",
            color: "#0F172A",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: "5px",
          }}>
            Votre décision (expliquez le verdict)
          </label>
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Ex : Le vendeur reconnaît le défaut, remboursement effectué..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "12px",
              border: "1.5px solid #0F172A",
              fontSize: "11.5px",
              fontFamily: "inherit",
              fontWeight: "600",
              color: "#0F172A",
              backgroundColor: "white",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              marginBottom: "10px",
            }}
          />

          {erreur && (
            <div style={{
              backgroundColor: "#FEE2E2",
              color: "#991B1B",
              padding: "8px 10px",
              borderRadius: "10px",
              fontSize: "10.5px",
              fontWeight: "800",
              border: "1px solid #DC2626",
              marginBottom: "10px",
            }}>
              {erreur}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => traiter("RESOLU")}
              disabled={envoi}
              style={{
                flex: 1,
                backgroundColor: "#16A34A",
                color: "white",
                padding: "10px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "900",
                fontSize: "11.5px",
                cursor: envoi ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                fontFamily: "inherit",
                opacity: envoi ? 0.6 : 1,
              }}
            >
              <CheckCircle size={13} strokeWidth={3} />
              Résoudre
            </button>
            <button
              onClick={() => traiter("REJETE")}
              disabled={envoi}
              style={{
                flex: 1,
                backgroundColor: "white",
                color: "#DC2626",
                padding: "10px",
                borderRadius: "20px",
                border: "1.5px solid #DC2626",
                fontWeight: "900",
                fontSize: "11.5px",
                cursor: envoi ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                fontFamily: "inherit",
                opacity: envoi ? 0.6 : 1,
              }}
            >
              <XCircle size={13} strokeWidth={3} />
              Rejeter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
