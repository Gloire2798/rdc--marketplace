"use client";

import React from "react";
import { Store, Phone, CheckCircle, AlertCircle, Check, XCircle, Loader2 } from "lucide-react";
import type { VendeurFinance } from "./page";

const FRAIS_INSCRIPTION = 25000;
const LOYER_MENSUEL = 15000;

function formatFC(montant: number) {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FC";
}

function getMoisLisible(periode: string): string {
  if (periode === "INSCRIPTION") return "Inscription";
  const [annee, mois] = periode.split("-");
  const moisNoms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  return `Loyer ${moisNoms[parseInt(mois) - 1]} ${annee}`;
}

// Date d'échéance = 5 du mois SUIVANT la période
function getDateEcheance(periode: string): string {
  if (periode === "INSCRIPTION") return "";
  const [annee, mois] = periode.split("-").map(Number);
  const dateEcheance = new Date(annee, mois, 5);
  return dateEcheance.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

interface Props {
  vendeur: VendeurFinance;
  moisActuel: string;
  enCours: string | null;
  onMarquerPaye: (vendeurId: string, type: string, periode: string) => void;
  onToutMarquerPaye: (vendeur: VendeurFinance) => void;
}

export default function CarteVendeur({ vendeur, moisActuel, enCours, onMarquerPaye, onToutMarquerPaye }: Props) {
  // ----- Inscription -----
  const inscription = vendeur.paiementsFinance.find((p) => p.type === "INSCRIPTION");
  const inscriptionPayee = inscription?.statut === "PAYE";

  // ----- Tous les loyers, triés du plus récent au plus ancien -----
  const loyers = vendeur.paiementsFinance
    .filter((p) => p.type === "LOYER")
    .sort((a, b) => b.periode.localeCompare(a.periode));

  // ----- Loyers impayés -----
  const loyersImpayes = loyers.filter((l) => l.statut === "IMPAYE");

  // ----- Total dû -----
  const totalDu =
    (inscriptionPayee ? 0 : FRAIS_INSCRIPTION) +
    loyersImpayes.reduce((sum, l) => sum + LOYER_MENSUEL, 0);

  const toutPaye = inscriptionPayee && loyersImpayes.length === 0;
  const bordCouleur = toutPaye ? "#16a34a" : "#dc2626";

  // Nombre de mois de retard
  const moisDeRetard = loyersImpayes.length;
  const enRetardCritique = moisDeRetard >= 2;

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "10px",
      border: "1px solid #E2E8F0",
      borderLeft: `4px solid ${bordCouleur}`,
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
      overflow: "hidden",
    }}>
      {/* En-tête */}
      <div style={{
        padding: "12px 14px 10px 14px",
        borderBottom: "1px solid #F1F5F9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "8px",
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
            <Store size={13} color="#1D4ED8" strokeWidth={2.5} />
            <h3 style={{
              fontSize: "13px",
              fontWeight: "800",
              color: "#0F172A",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {vendeur.nomBoutique}
            </h3>
          </div>
          <p style={{
            fontSize: "10.5px",
            color: "#64748b",
            fontWeight: "600",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {vendeur.userNom || vendeur.userEmail || "—"}
          </p>
          <p style={{
            fontSize: "10px",
            color: "#94a3b8",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            marginTop: "2px",
          }}>
            <Phone size={9} />
            {vendeur.telephone}
          </p>
        </div>

        {toutPaye ? (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "3px 8px",
            borderRadius: "12px",
            backgroundColor: "#DCFCE7",
            color: "#15803d",
            fontSize: "9px",
            fontWeight: "800",
            whiteSpace: "nowrap",
          }}>
            <CheckCircle size={10} strokeWidth={2.5} />
            À JOUR
          </span>
        ) : enRetardCritique ? (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "3px 8px",
            borderRadius: "12px",
            backgroundColor: "#DC2626",
            color: "white",
            fontSize: "9px",
            fontWeight: "800",
            whiteSpace: "nowrap",
          }}>
            <AlertCircle size={10} strokeWidth={2.5} />
            {moisDeRetard} MOIS
          </span>
        ) : (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "3px 8px",
            borderRadius: "12px",
            backgroundColor: "#FEE2E2",
            color: "#b91c1c",
            fontSize: "9px",
            fontWeight: "800",
            whiteSpace: "nowrap",
          }}>
            <AlertCircle size={10} strokeWidth={2.5} />
            IMPAYÉ
          </span>
        )}
      </div>

      {/* Toutes les lignes de paiement */}
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Inscription */}
        <LignePaiement
          label="Inscription"
          montant={FRAIS_INSCRIPTION}
          paye={inscriptionPayee}
          enRetard={false}
          enCours={enCours === `${vendeur.id}-INSCRIPTION-INSCRIPTION`}
          onMarquer={() => onMarquerPaye(vendeur.id, "INSCRIPTION", "INSCRIPTION")}
        />

        {/* Tous les loyers (payés ET impayés) */}
        {loyers.map((l) => {
          const estImpaye = l.statut !== "PAYE";
          const estAncien = l.periode !== moisActuel;

          return (
            <LignePaiement
              key={l.id}
              label={getMoisLisible(l.periode)}
              sousLabel={estImpaye ? `À payer avant le ${getDateEcheance(l.periode)}` : undefined}
              montant={LOYER_MENSUEL}
              paye={!estImpaye}
              enRetard={estImpaye && estAncien}
              enCours={enCours === `${vendeur.id}-LOYER-${l.periode}`}
              onMarquer={() => onMarquerPaye(vendeur.id, "LOYER", l.periode)}
            />
          );
        })}

        {/* Si aucun loyer enregistré */}
        {loyers.length === 0 && (
          <div style={{
            fontSize: "10.5px",
            color: "#94a3b8",
            fontWeight: "600",
            textAlign: "center",
            padding: "8px",
            backgroundColor: "#F8FAFC",
            borderRadius: "8px",
          }}>
            Aucun loyer enregistré
          </div>
        )}
      </div>

      {/* Total + action globale */}
      <div style={{
        padding: "10px 14px",
        backgroundColor: "#F8FAFC",
        borderTop: "1px solid #F1F5F9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px",
      }}>
        <div>
          <p style={{
            fontSize: "9.5px",
            fontWeight: "700",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}>
            Total dû
          </p>
          <p style={{
            fontSize: "15px",
            fontWeight: "800",
            color: toutPaye ? "#15803d" : "#b91c1c",
            lineHeight: 1.1,
          }}>
            {formatFC(totalDu)}
          </p>
        </div>

        {!toutPaye && (
          <button
            onClick={() => onToutMarquerPaye(vendeur)}
            disabled={enCours !== null && enCours.startsWith(vendeur.id)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              backgroundColor: "#1D4ED8",
              color: "white",
              fontSize: "11px",
              fontWeight: "800",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              cursor: "pointer",
              opacity: enCours !== null && enCours.startsWith(vendeur.id) ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            <Check size={12} strokeWidth={3} />
            Tout marquer payé
          </button>
        )}
      </div>
    </div>
  );
}

function LignePaiement({
  label,
  sousLabel,
  montant,
  paye,
  enRetard,
  enCours,
  onMarquer,
}: {
  label: string;
  sousLabel?: string;
  montant: number;
  paye: boolean;
  enRetard: boolean;
  enCours: boolean;
  onMarquer: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{
          fontSize: "12px",
          fontWeight: "700",
          color: enRetard ? "#dc2626" : "#0F172A",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {label}
        </p>
        <p style={{ fontSize: "10.5px", fontWeight: "600", color: "#64748b" }}>
          {formatFC(montant)}
          {sousLabel && (
            <span style={{
              marginLeft: "6px",
              color: enRetard ? "#dc2626" : "#94a3b8",
              fontWeight: "700",
            }}>
              · {sousLabel}
            </span>
          )}
        </p>
      </div>

      {paye ? (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "3px 8px",
          borderRadius: "12px",
          backgroundColor: "#DCFCE7",
          color: "#15803d",
          fontSize: "10px",
          fontWeight: "800",
          whiteSpace: "nowrap",
        }}>
          <Check size={10} strokeWidth={3} />
          Payé
        </span>
      ) : (
        <button
          onClick={onMarquer}
          disabled={enCours}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "5px 10px",
            borderRadius: "14px",
            backgroundColor: enRetard ? "#FEF2F2" : "#FEF3C7",
            color: enRetard ? "#b91c1c" : "#92400e",
            fontSize: "10px",
            fontWeight: "800",
            border: enRetard ? "1px solid #FECACA" : "1px solid #FDE68A",
            cursor: "pointer",
            opacity: enCours ? 0.6 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {enCours ? <Loader2 size={10} /> : <XCircle size={10} strokeWidth={2.5} />}
          {enCours ? "..." : "Marquer payé"}
        </button>
      )}
    </div>
  );
                }
