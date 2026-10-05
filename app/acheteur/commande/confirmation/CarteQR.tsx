"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Clock, CheckCircle, Package, Store, XCircle } from "lucide-react";

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
        borderRadius: "20px",
        padding: "20px",
        marginBottom: "14px",
        border: "1.5px solid #0F172A",
        textAlign: "center",
        boxShadow: "4px 4px 0 #EA580C",
      }}>
        <p style={{
          fontSize: "11px",
          color: "#57534E",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}>
          <Clock size={13} strokeWidth={2.5} />
          Chargement du QR {index + 1}...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const configStatut = {
    EN_ATTENTE: {
      titre: "En attente",
      bg: "#FEF3C7",
      color: "#78350F",
      Icon: Clock,
    },
    PAYE: {
      titre: "Payé",
      bg: "#DBEAFE",
      color: "#1E40AF",
      Icon: CheckCircle,
    },
    PRET: {
      titre: "Prêt",
      bg: "#DCFCE7",
      color: "#15803D",
      Icon: Package,
    },
    RETIRE: {
      titre: "Retiré",
      bg: "#DBEAFE",
      color: "#1E40AF",
      Icon: CheckCircle,
    },
  };
  const conf =
    configStatut[data.statut as keyof typeof configStatut] ||
    configStatut.EN_ATTENTE;
  const IconeStatut = conf.Icon;

  const numeroOrdre = index + 1;

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "20px",
      padding: "16px 14px",
      marginBottom: "14px",
      border: "1.5px solid #0F172A",
      boxShadow: "4px 4px 0 #EA580C",
      textAlign: "center",
    }}>
      {/* HEADER CARTE */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        paddingBottom: "10px",
        borderBottom: "1px dashed #D4C5A0",
        gap: "6px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, flex: 1 }}>
          <span style={{
            fontSize: "10.5px",
            fontWeight: "900",
            backgroundColor: "#0F172A",
            color: "white",
            padding: "4px 9px",
            borderRadius: "10px",
            flexShrink: 0,
          }}>
            #{numeroOrdre}
          </span>
          <p style={{
            fontSize: "11px",
            color: "#0F172A",
            fontWeight: "800",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <Store size={11} strokeWidth={2.5} />
            {data.nomBoutique || "Boutique"}
          </p>
        </div>
        <span style={{
          fontSize: "10px",
          fontWeight: "900",
          backgroundColor: conf.bg,
          color: conf.color,
          padding: "4px 10px",
          borderRadius: "10px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <IconeStatut size={11} strokeWidth={2.8} />
          {conf.titre}
        </span>
      </div>

      {total > 1 && (
        <p style={{
          fontSize: "10px",
          fontWeight: "900",
          color: "#57534E",
          marginBottom: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Commande {numeroOrdre} sur {total}
        </p>
      )}

      {data.statut === "RETIRE" && data.retireAt ? (
        <div style={{ padding: "20px 8px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#DCFCE7",
            border: "2px solid #16A34A",
            marginBottom: "10px",
          }}>
            <CheckCircle size={34} color="#16A34A" strokeWidth={2.5} />
          </div>
          <p style={{
            fontSize: "13px",
            fontWeight: "900",
            color: "#15803D",
            marginBottom: "4px",
          }}>
            Commande retirée
          </p>
          <p style={{
            fontSize: "10.5px",
            color: "#57534E",
            fontWeight: "700",
          }}>
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
              width: "200px",
              height: "200px",
              display: "block",
              margin: "0 auto",
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "6px",
              boxSizing: "border-box",
              border: "1px solid #D4C5A0",
            }}
          />
          <p style={{
            fontSize: "10px",
            color: "#57534E",
            marginTop: "10px",
            fontWeight: "700",
          }}>
            Présentez ce QR au vendeur de {data.nomBoutique || "cette boutique"}.
          </p>
        </>
      ) : null}
    </div>
  );
      }
