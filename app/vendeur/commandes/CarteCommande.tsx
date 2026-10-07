"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, MapPin, Truck, Store, CheckCircle, XCircle, Package, Clock, Wallet, Copy } from "lucide-react";

interface Item {
  nom: string;
  quantite: number;
  prixUnitaire: number;
  devise: string;
}

interface Commande {
  id: string;
  statut: string;
  totalFC: number;
  totalUSD: number;
  mode: string;
  adresse: string | null;
  createdAt: string;
  nomClient: string | null;
  telephoneClient: string;
  reference: string | null;
  items: Item[];
}

export default function CarteCommande({ commande }: { commande: Commande }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [copie, setCopie] = useState(false);

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") {
      return `${prix.toFixed(2)} $`;
    }
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  const copierReference = () => {
    if (!commande.reference) return;
    navigator.clipboard.writeText(commande.reference);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const changerStatut = async (nouveauStatut: string) => {
    setChargement(true);
    try {
      const res = await fetch(`/api/vendeur/commandes/${commande.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: nouveauStatut }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch {
      alert("Erreur réseau");
    }
    setChargement(false);
  };

  const couleurBordure = () => {
    if (commande.statut === "EN_ATTENTE") return "#B45309";
    if (commande.statut === "PAYE" || commande.statut === "PRET") return "#1D4ED8";
    if (commande.statut === "RETIRE") return "#16A34A";
    return "#9CA3AF";
  };

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "14px",
      padding: "10px 11px",
      border: "1px solid #D4C5A0",
      borderLeftWidth: "3px",
      borderLeftColor: couleurBordure(),
      boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
    }}>
      {/* En-tête compact */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px", marginBottom: "6px" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: "9px",
            color: "#94A3B8",
            fontWeight: "800",
            marginBottom: "2px",
            letterSpacing: "0.2px",
          }}>
            #{commande.id.slice(0, 8)}
          </p>
          <p style={{
            fontSize: "12px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <User size={11} strokeWidth={2.8} />
            {commande.nomClient || "Client"}
          </p>
          <p style={{
            fontSize: "10px",
            color: "#57534E",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <Phone size={10} strokeWidth={2.8} />
            {commande.telephoneClient}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {commande.totalUSD > 0 && (
            <p style={{ fontSize: "13px", fontWeight: "900", color: "#EA580C", lineHeight: 1.15, letterSpacing: "-0.2px" }}>
              {formaterPrix(commande.totalUSD, "USD")}
            </p>
          )}
          {commande.totalFC > 0 && (
            <p style={{ fontSize: "13px", fontWeight: "900", color: "#EA580C", lineHeight: 1.15, letterSpacing: "-0.2px" }}>
              {formaterPrix(commande.totalFC, "FC")}
            </p>
          )}
          <p style={{
            fontSize: "9px",
            color: "#57534E",
            fontWeight: "800",
            marginTop: "3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "3px",
          }}>
            {commande.mode === "LIVRAISON" ? (
              <>
                <Truck size={9} strokeWidth={2.8} />
                Livraison
              </>
            ) : (
              <>
                <Store size={9} strokeWidth={2.8} />
                Retrait
              </>
            )}
          </p>
        </div>
      </div>

      {commande.mode === "LIVRAISON" && commande.adresse && (
        <p style={{
          fontSize: "10px",
          color: "#57534E",
          fontWeight: "700",
          marginBottom: "6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <MapPin size={10} strokeWidth={2.8} />
          {commande.adresse}
        </p>
      )}

      {/* RÉFÉRENCE DE PAIEMENT — visible uniquement EN_ATTENTE */}
      {commande.statut === "EN_ATTENTE" && commande.reference && (
        <div style={{
          backgroundColor: "white",
          border: "1.5px solid #0F172A",
          borderRadius: "12px",
          padding: "8px 10px",
          marginBottom: "8px",
          boxShadow: "2px 2px 0 #EA580C",
        }}>
          <p style={{
            fontSize: "9px",
            fontWeight: "900",
            color: "#57534E",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: "5px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <Wallet size={10} strokeWidth={2.8} color="#EA580C" />
            Référence de paiement
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              flex: 1,
              fontSize: "12px",
              fontWeight: "900",
              color: "#0F172A",
              letterSpacing: "0.4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "monospace",
              minWidth: 0,
            }}>
              {commande.reference}
            </span>
            <button
              type="button"
              onClick={copierReference}
              style={{
                padding: "5px 9px",
                fontSize: "10px",
                backgroundColor: copie ? "#16A34A" : "#0F172A",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              <Copy size={10} strokeWidth={3} />
              {copie ? "Copié" : "Copier"}
            </button>
          </div>
          <p style={{
            fontSize: "9.5px",
            color: "#57534E",
            fontWeight: "700",
            marginTop: "5px",
            lineHeight: 1.4,
          }}>
            Vérifiez la réception de l&apos;acompte avant de valider ou refuser.
          </p>
        </div>
      )}

      {/* Articles compacts */}
      <div style={{
        backgroundColor: "#F5EAD2",
        borderRadius: "10px",
        padding: "6px 8px",
        marginBottom: "8px",
        border: "1px solid #D4C5A0",
      }}>
        {commande.items.map((item, index) => (
          <div key={index} style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10.5px",
            marginBottom: index < commande.items.length - 1 ? "3px" : "0",
            gap: "6px",
          }}>
            <span style={{
              color: "#0F172A",
              fontWeight: "800",
              minWidth: 0,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {item.nom} × {item.quantite}
            </span>
            <span style={{ color: "#57534E", fontWeight: "800", flexShrink: 0 }}>
              {formaterPrix(item.prixUnitaire * item.quantite, item.devise)}
            </span>
          </div>
        ))}
      </div>

      {/* Boutons compacts */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {commande.statut === "EN_ATTENTE" && (
          <>
            <button
              onClick={() => changerStatut("PAYE")}
              disabled={chargement}
              style={{
                flex: 1,
                minWidth: "80px",
                backgroundColor: "#16A34A",
                color: "white",
                padding: "8px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "900",
                fontSize: "11px",
                cursor: "pointer",
                opacity: chargement ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                fontFamily: "inherit",
              }}
            >
              <CheckCircle size={12} strokeWidth={3} />
              Valider
            </button>
            <button
              onClick={() => changerStatut("ANNULE")}
              disabled={chargement}
              style={{
                flex: 1,
                minWidth: "80px",
                backgroundColor: "white",
                color: "#DC2626",
                padding: "8px",
                borderRadius: "20px",
                border: "1.5px solid #DC2626",
                fontWeight: "900",
                fontSize: "11px",
                cursor: "pointer",
                opacity: chargement ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                fontFamily: "inherit",
              }}
            >
              <XCircle size={12} strokeWidth={3} />
              Refuser
            </button>
          </>
        )}

        {commande.statut === "PAYE" && (
          <button
            onClick={() => changerStatut("PRET")}
            disabled={chargement}
            style={{
              flex: 1,
              backgroundColor: "#0F172A",
              color: "white",
              padding: "8px",
              borderRadius: "20px",
              border: "none",
              fontWeight: "900",
              fontSize: "11px",
              cursor: "pointer",
              opacity: chargement ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              fontFamily: "inherit",
            }}
          >
            <Package size={12} strokeWidth={3} />
            Marquer comme prêt
          </button>
        )}

        {commande.statut === "PRET" && (
          <div style={{
            flex: 1,
            backgroundColor: "#DCFCE7",
            color: "#15803D",
            padding: "8px",
            borderRadius: "20px",
            textAlign: "center",
            fontWeight: "900",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}>
            <Clock size={12} strokeWidth={3} />
            En attente du client
          </div>
        )}

        {commande.statut === "RETIRE" && (
          <div style={{
            flex: 1,
            backgroundColor: "#DCFCE7",
            color: "#15803D",
            padding: "8px",
            borderRadius: "20px",
            textAlign: "center",
            fontWeight: "900",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}>
            <CheckCircle size={12} strokeWidth={3} />
            Commande terminée
          </div>
        )}

        {commande.statut === "ANNULE" && (
          <div style={{
            flex: 1,
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            padding: "8px",
            borderRadius: "20px",
            textAlign: "center",
            fontWeight: "900",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}>
            <XCircle size={12} strokeWidth={3} />
            Commande annulée
          </div>
        )}
      </div>
    </div>
  );
        }
