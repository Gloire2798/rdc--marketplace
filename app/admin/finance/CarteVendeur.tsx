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

interface Props {
  vendeur: VendeurFinance;
  moisActuel: string;
  enCours: string | null;
  onMarquerPaye: (vendeurId: string, type: string, periode: string) => void;
  onToutMarquerPaye: (vendeur: VendeurFinance) => void;
}

export default function CarteVendeur({ vendeur, moisActuel, enCours, onMarquerPaye, onToutMarquerPaye }: Props) {
  const inscription = vendeur.paiementsFinance.find((p) => p.type === "INSCRIPTION");
  const loyer = vendeur.paiementsFinance.find((p) => p.type === "LOYER" && p.periode === moisActuel);

  const inscriptionPayee = inscription?.statut === "PAYE";
  const loyerPaye = loyer?.statut === "PAYE";
  const totalDu = (inscriptionPayee ? 0 : FRAIS_INSCRIPTION) + (loyerPaye ? 0 : LOYER_MENSUEL);
  const toutPaye = inscriptionPayee && loyerPaye;
  const bordCouleur = toutPaye ? "#16a34a" : "#dc2626";

  return (
    <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #E2E8F0", borderLeft: `4px solid ${bordCouleur}`, boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px 10px 14px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
            <Store size={13} color="#1D4ED8" strokeWidth={2.5} />
            <h3 style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendeur.nomBoutique}</h3>
          </div>
          <p style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendeur.userNom || vendeur.userEmail || "—"}</p>
          <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
            <Phone size={9} />
            {vendeur.telephone}
          </p>
        </div>

        {toutPaye ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "3px 8px", borderRadius: "12px", backgroundColor: "#DCFCE7", color: "#15803d", fontSize: "9px", fontWeight: "800", whiteSpace: "nowrap" }}>
            <CheckCircle size={10} strokeWidth={2.5} />
            À JOUR
          </span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "3px 8px", borderRadius: "12px", backgroundColor: "#FEE2E2", color: "#b91c1c", fontSize: "9px", fontWeight: "800", whiteSpace: "nowrap" }}>
            <AlertCircle size={10} strokeWidth={2.5} />
            IMPAYÉ
          </span>
        )}
      </div>

      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <LignePaiement
          label="Inscription"
          montant={FRAIS_INSCRIPTION}
          paye={inscriptionPayee}
          enCours={enCours === `${vendeur.id}-INSCRIPTION-INSCRIPTION`}
          onMarquer={() => onMarquerPaye(vendeur.id, "INSCRIPTION", "INSCRIPTION")}
        />
        <LignePaiement
          label={getMoisLisible(moisActuel)}
          montant={LOYER_MENSUEL}
          paye={loyerPaye}
          enCours={enCours === `${vendeur.id}-LOYER-${moisActuel}`}
          onMarquer={() => onMarquerPaye(vendeur.id, "LOYER", moisActuel)}
        />
      </div>

      <div style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <div>
          <p style={{ fontSize: "9.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>Total dû</p>
          <p style={{ fontSize: "15px", fontWeight: "800", color: toutPaye ? "#15803d" : "#b91c1c", lineHeight: 1.1 }}>{formatFC(totalDu)}</p>
        </div>

        {!toutPaye && (
          <button
            onClick={() => onToutMarquerPaye(vendeur)}
            disabled={enCours !== null && enCours.startsWith(vendeur.id)}
            style={{ padding: "8px 12px", borderRadius: "8px", backgroundColor: "#1D4ED8", color: "white", fontSize: "11px", fontWeight: "800", border: "none", display: "inline-flex", alignItems: "center", gap: "5px", cursor: "pointer", opacity: enCours !== null && enCours.startsWith(vendeur.id) ? 0.6 : 1, whiteSpace: "nowrap" }}
          >
            <Check size={12} strokeWidth={3} />
            Tout marquer payé
          </button>
        )}
      </div>
    </div>
  );
}

function LignePaiement({ label, montant, paye, enCours, onMarquer }: { label: string; montant: number; paye: boolean; enCours: boolean; onMarquer: () => void; }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: "12px", fontWeight: "700", color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</p>
        <p style={{ fontSize: "10.5px", fontWeight: "600", color: "#64748b" }}>{formatFC(montant)}</p>
      </div>

      {paye ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "3px 8px", borderRadius: "12px", backgroundColor: "#DCFCE7", color: "#15803d", fontSize: "10px", fontWeight: "800", whiteSpace: "nowrap" }}>
          <Check size={10} strokeWidth={3} />
          Payé
        </span>
      ) : (
        <button
          onClick={onMarquer}
          disabled={enCours}
          style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "5px 10px", borderRadius: "14px", backgroundColor: "#FEF2F2", color: "#b91c1c", fontSize: "10px", fontWeight: "800", border: "1px solid #FECACA", cursor: "pointer", opacity: enCours ? 0.6 : 1, whiteSpace: "nowrap" }}
        >
          {enCours ? <Loader2 size={10} /> : <XCircle size={10} strokeWidth={2.5} />}
          {enCours ? "..." : "Marquer payé"}
        </button>
      )}
    </div>
  );
                     }
