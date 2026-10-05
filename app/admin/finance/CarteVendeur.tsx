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
  const inscription = vendeur.paiementsFinance.find((p) => p.type === "INSCRIPTION");
  const inscriptionPayee = inscription?.statut === "PAYE";

  const loyers = vendeur.paiementsFinance
    .filter((p) => p.type === "LOYER")
    .sort((a, b) => b.periode.localeCompare(a.periode));

  const loyersImpayes = loyers.filter((l) => l.statut === "IMPAYE");

  const totalDu =
    (inscriptionPayee ? 0 : FRAIS_INSCRIPTION) +
    loyersImpayes.reduce((sum, l) => sum + LOYER_MENSUEL, 0);

  const toutPaye = inscriptionPayee && loyersImpayes.length === 0;
  const bordCouleur = toutPaye ? "#16A34A" : "#DC2626";

  const moisDeRetard = loyersImpayes.length;
  const enRetardCritique = moisDeRetard >= 2;

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "16px",
      border: "1px solid #D4C5A0",
      borderLeft: `3px solid ${bordCouleur}`,
      boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
      overflow: "hidden",
    }}>
      {/* En-tête */}
      <div style={{
        padding: "12px 12px 10px 12px",
        borderBottom: "1px dashed #D4C5A0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "8px",
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
            <Store size={13} color="#EA580C" strokeWidth={2.8} />
            <h3 style={{
              fontSize: "13px",
              fontWeight: "900",
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
            color: "#57534E",
            fontWeight: "700",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {vendeur.userNom || vendeur.userEmail || "—"}
          </p>
          <p style={{
            fontSize: "10px",
            color: "#57534E",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            marginTop: "2px",
          }}>
            <Phone size={9} strokeWidth={2.8} />
            {vendeur.telephone}
          </p>
        </div>

        {toutPaye ? (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "4px 10px",
            borderRadius: "12px",
            backgroundColor: "#DCFCE7",
            color: "#15803D",
            fontSize: "9.5px",
            fontWeight: "900",
            whiteSpace: "nowrap",
            border: "1px solid #16A34A",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}>
            <CheckCircle size={10} strokeWidth={3} />
            À jour
          </span>
        ) : enRetardCritique ? (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "4px 10px",
            borderRadius: "12px",
            backgroundColor: "#DC2626",
            color: "white",
            fontSize: "9.5px",
            fontWeight: "900",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}>
            <AlertCircle size={10} strokeWidth={3} />
            {moisDeRetard} mois
          </span>
        ) : (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "4px 10px",
            borderRadius: "12px",
            backgroundColor: "#FEE2E2",
            color: "#B91C1C",
            fontSize: "9.5px",
            fontWeight: "900",
            whiteSpace: "nowrap",
            border: "1px solid #DC2626",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}>
            <AlertCircle size={10} strokeWidth={3} />
            Impayé
          </span>
        )}
      </div>

      {/* Lignes de paiement */}
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <LignePaiement
          label="Inscription"
          montant={FRAIS_INSCRIPTION}
          paye={inscriptionPayee}
          enRetard={false}
          enCours={enCours === `${vendeur.id}-INSCRIPTION-INSCRIPTION`}
          onMarquer={() => onMarquerPaye(vendeur.id, "INSCRIPTION", "INSCRIPTION")}
        />

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

        {loyers.length === 0 && (
          <div style={{
            fontSize: "10.5px",
            color: "#57534E",
            fontWeight: "700",
            textAlign: "center",
            padding: "8px",
            backgroundColor: "#F5EAD2",
            borderRadius: "10px",
            border: "1px solid #D4C5A0",
          }}>
            Aucun loyer enregistré
          </div>
        )}
      </div>

      {/* Total + action */}
      <div style={{
        padding: "10px 12px",
        backgroundColor: "#F5EAD2",
        borderTop: "1px solid #D4C5A0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px",
      }}>
        <div>
          <p style={{
            fontSize: "9.5px",
            fontWeight: "900",
            color: "#57534E",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}>
            Total dû
          </p>
          <p style={{
            fontSize: "15px",
            fontWeight: "900",
            color: toutPaye ? "#16A34A" : "#DC2626",
            lineHeight: 1.1,
            letterSpacing: "-0.3px",
          }}>
            {formatFC(totalDu)}
          </p>
        </div>

        {!toutPaye && (
          <button
            onClick={() => onToutMarquerPaye(vendeur)}
            disabled={enCours !== null && enCours.startsWith(vendeur.id)}
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              backgroundColor: "#0F172A",
              color: "white",
              fontSize: "11px",
              fontWeight: "900",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              cursor: "pointer",
              opacity: enCours !== null && enCours.startsWith(vendeur.id) ? 0.6 : 1,
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            <Check size={12} strokeWidth={3} />
            Tout payé
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
          fontWeight: "900",
          color: enRetard ? "#DC2626" : "#0F172A",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {label}
        </p>
        <p style={{ fontSize: "10.5px", fontWeight: "700", color: "#57534E" }}>
          {formatFC(montant)}
          {sousLabel && (
            <span style={{
              marginLeft: "6px",
              color: enRetard ? "#DC2626" : "#94A3B8",
              fontWeight: "800",
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
          padding: "4px 9px",
          borderRadius: "12px",
          backgroundColor: "#DCFCE7",
          color: "#15803D",
          fontSize: "10px",
          fontWeight: "900",
          whiteSpace: "nowrap",
          border: "1px solid #16A34A",
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
            padding: "6px 11px",
            borderRadius: "16px",
            backgroundColor: enRetard ? "white" : "#0F172A",
            color: enRetard ? "#DC2626" : "white",
            fontSize: "10px",
            fontWeight: "900",
            border: enRetard ? "1.5px solid #DC2626" : "none",
            cursor: "pointer",
            opacity: enCours ? 0.6 : 1,
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          {enCours ? <Loader2 size={10} /> : <Check size={10} strokeWidth={3} />}
          {enCours ? "..." : "Marquer payé"}
        </button>
      )}
    </div>
  );
      }
