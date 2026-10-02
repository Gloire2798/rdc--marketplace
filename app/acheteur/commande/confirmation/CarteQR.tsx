"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  commandeId: string;
  index: number;
  total: number;
}

interface DataCommande {
  statut: string;
  qrImage: string;
  retireAt: string | null;
  nomBoutique: string;
}

export default function CarteQR({ commandeId, index, total }: Props) {
  const [data, setData] = useState<DataCommande | null>(null);
  const [chargement, setChargement] = useState(true);

  const chargerQR = async () => {
    try {
      const res = await fetch(`/api/client/commande/qr?commande=${commandeId}`);
      const json = await res.json();

      if (!json.succes) {
        setChargement(false);
        return;
      }

      if (json.statut === "RETIRE" || !json.qrToken) {
        setData({
          statut: json.statut,
          qrImage: "",
          retireAt: json.retireAt,
          nomBoutique: json.nomBoutique || "",
        });
        setChargement(false);
        return;
      }

      const url = await QRCode.toDataURL(json.qrToken, {
        width: 260,
        margin: 2,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      });

      setData({
        statut: json.statut,
        qrImage: url,
        retireAt: json.retireAt,
        nomBoutique: json.nomBoutique || "",
      });
      setChargement(false);
    } catch {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerQR();
    const interval = setInterval(chargerQR, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandeId]);

  if (chargement) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "14px",
        border: "1px solid #E8DFC8",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
          ⏳ Chargement du QR {index + 1}...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const configStatut = {
    EN_ATTENTE: { titre: "⏳ En attente", bg: "#FEF3C7", color: "#78350F" },
    PAYE: { titre: "✅ Payé", bg: "#DBEAFE", color: "#1E40AF" },
    PRET: { titre: "🟢 Prêt", bg: "#DCFCE7", color: "#15803D" },
    RETIRE: { titre: "🎉 Retiré", bg: "#DBEAFE", color: "#1E40AF" },
  };
  const conf = configStatut[data.statut as keyof typeof configStatut] || configStatut.EN_ATTENTE;

  const numeroOrdre = index + 1;

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "14px",
      marginBottom: "14px",
      border: "1px solid #E8DFC8",
      textAlign: "center",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
        paddingBottom: "8px",
        borderBottom: "1px solid #F1ECE0",
        gap: "6px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, flex: 1 }}>
          <span style={{
            fontSize: "10px",
            fontWeight: "900",
            backgroundColor: "#1D4ED8",
            color: "white",
            padding: "3px 8px",
            borderRadius: "10px",
            flexShrink: 0,
          }}>
            #{numeroOrdre}
          </span>
          <p style={{
            fontSize: "10.5px",
            color: "#64748b",
            fontWeight: "700",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            🏪 {data.nomBoutique || "Boutique"}
          </p>
        </div>
        <span style={{
          fontSize: "9.5px",
          fontWeight: "800",
          backgroundColor: conf.bg,
          color: conf.color,
          padding: "3px 8px",
          borderRadius: "10px",
          flexShrink: 0,
        }}>
          {conf.titre}
        </span>
      </div>

      {total > 1 && (
        <p style={{
          fontSize: "10px",
          fontWeight: "800",
          color: "#1E3A5F",
          marginBottom: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Commande {numeroOrdre} sur {total}
        </p>
      )}

      {data.statut === "RETIRE" && data.retireAt ? (
        <div style={{ padding: "16px 8px" }}>
          <p style={{ fontSize: "32px", marginBottom: "6px" }}>✅</p>
          <p style={{ fontSize: "12.5px", fontWeight: "800", color: "#15803D", marginBottom: "3px" }}>
            Commande retirée
          </p>
          <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>
            {new Date(data.retireAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ) : data.qrImage ? (
        <>
          <img
            src={data.qrImage}
            alt="QR Code"
            style={{
              width: "190px",
              height: "190px",
              display: "block",
              margin: "0 auto",
              backgroundColor: "white",
            }}
          />
          <p style={{
            fontSize: "9.5px",
            color: "#64748b",
            marginTop: "8px",
            fontWeight: "600",
          }}>
            Présentez ce QR au vendeur de {data.nomBoutique || "cette boutique"}.
          </p>
        </>
      ) : null}
    </div>
  );
      }
