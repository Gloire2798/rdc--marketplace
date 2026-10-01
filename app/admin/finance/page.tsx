"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Store,
  Phone,
  Check,
  Loader2,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface PaiementFinance {
  id: string;
  type: string;
  periode: string;
  montant: number;
  statut: string;
  datePaiement: string | null;
}

interface VendeurFinance {
  id: string;
  nomBoutique: string;
  telephone: string;
  userNom: string | null;
  userEmail: string | null;
  createdAt: string;
  paiementsFinance: PaiementFinance[];
}

type Filtre = "TOUT" | "IMPAYES" | "AJOUR";

// ============================================================
// CONSTANTES
// ============================================================

const FRAIS_INSCRIPTION = 25000;
const LOYER_MENSUEL = 15000;

// ============================================================
// HELPERS
// ============================================================

function formatFC(montant: number) {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FC";
}

function getMoisActuel(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMoisLisible(periode: string): string {
  if (periode === "INSCRIPTION") return "Inscription";
  const [annee, mois] = periode.split("-");
  const moisNoms = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];
  return `Loyer ${moisNoms[parseInt(mois) - 1]} ${annee}`;
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function FinancePage() {
  const router = useRouter();
  const [vendeurs, setVendeurs] = useState<VendeurFinance[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("TOUT");
  const [enCours, setEnCours] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "ok" | "err" } | null>(null);

  const moisActuel = getMoisActuel();

  // ----------------------------------------------------------
  // Charger les données
  // ----------------------------------------------------------
  const chargerDonnees = async () => {
    setChargement(true);
    setErreur("");
    try {
      const res = await fetch("/api/admin/finance");
      if (res.status === 401 || res.status === 403) {
        router.push("/vendeur/connexion");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur || "Erreur de chargement");
        setChargement(false);
        return;
      }
      setVendeurs(data.vendeurs || []);
      setChargement(false);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------
  // Toast
  // ----------------------------------------------------------
  const afficherToast = (message: string, type: "ok" | "err" = "ok") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ----------------------------------------------------------
  // Marquer un paiement comme payé
  // ----------------------------------------------------------
  const marquerPaye = async (
    vendeurId: string,
    type: string,
    periode: string
  ) => {
    const key = `${vendeurId}-${type}-${periode}`;
    setEnCours(key);

    try {
      const res = await fetch("/api/admin/finance/marquer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendeurId, type, periode }),
      });

      const data = await res.json();

      if (!res.ok) {
        afficherToast(data.erreur || "Erreur", "err");
        setEnCours(null);
        return;
      }

      setVendeurs((prev) =>
        prev.map((v) => {
          if (v.id !== vendeurId) return v;
          const existe = v.paiementsFinance.find(
            (p) => p.type === type && p.periode === periode
          );
          if (existe) {
            return {
              ...v,
              paiementsFinance: v.paiementsFinance.map((p) =>
                p.type === type && p.periode === periode
                  ? { ...p, statut: "PAYE", datePaiement: new Date().toISOString() }
                  : p
              ),
            };
          }
          return {
            ...v,
            paiementsFinance: [
              ...v.paiementsFinance,
              {
                id: data.paiement?.id || `tmp-${Date.now()}`,
                type,
                periode,
                montant: data.paiement?.montant || 0,
                statut: "PAYE",
                datePaiement: new Date().toISOString(),
              },
            ],
          };
        })
      );

      afficherToast("Paiement marqué comme payé");
    } catch {
      afficherToast("Impossible de contacter le serveur", "err");
    }
    setEnCours(null);
  };

  // ----------------------------------------------------------
  // Tout marquer payé
  // ----------------------------------------------------------
  const toutMarquerPaye = async (vendeur: VendeurFinance) => {
    const inscription = vendeur.paiementsFinance.find(
      (p) => p.type === "INSCRIPTION"
    );
    const loyer = vendeur.paiementsFinance.find(
      (p) => p.type === "LOYER" && p.periode === moisActuel
    );

    const taches: Promise<void>[] = [];

    if (inscription?.statut !== "PAYE") {
      taches.push(marquerPaye(vendeur.id, "INSCRIPTION", "INSCRIPTION"));
    }
    if (loyer?.statut !== "PAYE") {
      taches.push(marquerPaye(vendeur.id, "LOYER", moisActuel));
    }

    await Promise.all(taches);
  };

  // ----------------------------------------------------------
  // Filtrer
  // ----------------------------------------------------------
  const vendeursFiltres = vendeurs.filter((v) => {
    if (filtre === "TOUT") return true;

    const inscription = v.paiementsFinance.find((p) => p.type === "INSCRIPTION");
    const loyer = v.paiementsFinance.find(
      (p) => p.type === "LOYER" && p.periode === moisActuel
    );

    const inscriptionPayee = inscription?.statut === "PAYE";
    const loyerPaye = loyer?.statut === "PAYE";

    if (filtre === "IMPAYES") {
      return !inscriptionPayee || !loyerPaye;
    }
    if (filtre === "AJOUR") {
      return inscriptionPayee && loyerPaye;
    }
    return true;
  });

  // ----------------------------------------------------------
  // Stats
  // ----------------------------------------------------------
  let inscriptionsEncaissees = 0;
  let loyersEncaissees = 0;

  vendeurs.forEach((v) => {
    const inscription = v.paiementsFinance.find((p) => p.type === "INSCRIPTION");
    const loyer = v.paiementsFinance.find(
      (p) => p.type === "LOYER" && p.periode === moisActuel
    );

    if (inscription?.statut === "PAYE") inscriptionsEncaissees += FRAIS_INSCRIPTION;
    if (loyer?.statut === "PAYE") loyersEncaissees += LOYER_MENSUEL;
  });

  const totalCollecte = inscriptionsEncaissees + loyersEncaissees;
  const totalACollecter =
    vendeurs.length * (FRAIS_INSCRIPTION + LOYER_MENSUEL) - totalCollecte;

  const stats = [
    {
      label: "Inscriptions",
      valeur: formatFC(inscriptionsEncaissees),
      Icon: Wallet,
      bg: "#DBEAFE",
      iconColor: "#1D4ED8",
      valueColor: "#0F172A",
    },
    {
      label: "Loyers",
      valeur: formatFC(loyersEncaissees),
      Icon: Wallet,
      bg: "#FED7AA",
      iconColor: "#c2410c",
      valueColor: "#0F172A",
    },
    {
      label: "Total encaissé",
      valeur: formatFC(totalCollecte),
      Icon: TrendingUp,
      bg: "#BBF7D0",
      iconColor: "#15803d",
      valueColor: "#15803d",
    },
    {
      label: "À collecter",
      valeur: formatFC(totalACollecter),
      Icon: TrendingDown,
      bg: "#FECACA",
      iconColor: "#b91c1c",
      valueColor: "#b91c1c",
    },
  ];

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div
      style={{
        backgroundColor: "#F1F5F9",
        minHeight: "100vh",
        padding: "16px 12px 90px 12px",
      }}
    >
      {/* ---------- TOAST ---------- */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            backgroundColor: toast.type === "ok" ? "#16a34a" : "#dc2626",
            color: "white",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "12.5px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {toast.type === "ok" ? <Check size={14} /> : <XCircle size={14} />}
          {toast.message}
        </div>
      )}

      {/* ---------- EN-TÊTE ---------- */}
      <div style={{ marginBottom: "16px" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#0F172A",
            marginBottom: "2px",
            letterSpacing: "-0.3px",
          }}
        >
          Finance
        </h1>
        <p style={{ fontSize: "11px", color: "#475569", fontWeight: "600" }}>
          Gestion des frais d'inscription et des loyers
        </p>
      </div>

      {/* ---------- STATS 2x2 ---------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.Icon;
          return (
            <div
              key={stat.label}
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                border: "1px solid #F1F5F9",
              }}
            >
              <div
                style={{
                  backgroundColor: stat.bg,
                  padding: "6px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Icon size={14} color={stat.iconColor} strokeWidth={2.5} />
              </div>
              <div style={{ padding: "6px 4px 8px 4px", textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "9.5px",
                    color: "#475569",
                    marginBottom: "2px",
                    fontWeight: "700",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: stat.valueColor,
                    lineHeight: 1.1,
                  }}
                >
                  {stat.valeur}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- FILTRES ---------- */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "12px",
          overflowX: "auto",
        }}
      >
        <FiltreBouton
          actif={filtre === "TOUT"}
          onClick={() => setFiltre("TOUT")}
          label={`Tout (${vendeurs.length})`}
          couleur="blue"
        />
        <FiltreBouton
          actif={filtre === "IMPAYES"}
          onClick={() => setFiltre("IMPAYES")}
          label="Impayés"
          couleur="red"
        />
        <FiltreBouton
          actif={filtre === "AJOUR"}
          onClick={() => setFiltre("AJOUR")}
          label="À jour"
          couleur="green"
        />
      </div>

      {/* ---------- CHARGEMENT ---------- */}
      {chargement && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 0",
          }}
        >
          <Loader2
            size={28}
            color="#1D4ED8"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: "#475569",
              fontWeight: "600",
            }}
          >
            Chargement...
          </p>
        </div>
      )}

      {/* ---------- ERREUR ---------- */}
      {erreur && !chargement && (
        <div
          style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#b91c1c",
            fontWeight: "600",
          }}
        >
          <AlertCircle size={16} />
          {erreur}
        </div>
      )}

      {/* ---------- LISTE VENDEURS ---------- */}
      {!chargement && !erreur && (
        <>
          {vendeursFiltres.length === 0 ? (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                padding: "32px 20px",
                textAlign: "center",
              }}
            >
              <Store
                size={36}
                color="#94a3b8"
                style={{ margin: "0 auto 8px auto", display: "block" }}
              />
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#0F172A",
                }}
              >
                Aucun vendeur
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  marginTop: "4px",
                }}
              >
                {filtre === "TOUT"
                  ? "Aucun vendeur enregistré."
                  : "Aucun vendeur dans ce filtre."}
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {vendeursFiltres.map((v) => (
                <CarteVendeur
                  key={v.id}
                  vendeur={v}
                  moisActuel={moisActuel}
                  enCours={enCours}
                  onMarquerPaye={marquerPaye}
                  onToutMarquerPaye={toutMarquerPaye}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Animation spinner CSS inline */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

function FiltreBouton({
  actif,
  onClick,
  label,
  couleur,
}: {
  actif: boolean;
  onClick: () => void;
  label: string;
  couleur: "blue" | "red" | "green";
}) {
  let bgActif = "#1D4ED8";
  if (couleur === "red") bgActif = "#dc2626";
  if (couleur === "green") bgActif = "#16a34a";

  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "700",
        whiteSpace: "nowrap",
        border: actif ? "1px solid transparent" : "1px solid #E2E8F0",
        backgroundColor: actif ? bgActif : "white",
        color: actif ? "white" : "#475569",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function CarteVendeur({
  vendeur,
  moisActuel,
  enCours,
  onMarquerPaye,
  onToutMarquerPaye,
}: {
  vendeur: VendeurFinance;
  moisActuel: string;
  enCours: string | null;
  onMarquerPaye: (vendeurId: string, type: string, periode: string) => void;
  onToutMarquerPaye: (vendeur: VendeurFinance) => void;
}) {
  const inscription = vendeur.paiementsFinance.find(
    (p) => p.type === "INSCRIPTION"
  );
  const loyer = vendeur.paiementsFinance.find(
    (p) => p.type === "LOYER" && p.periode === moisActuel
  );

  const inscriptionPayee = inscription?.statut === "PAYE";
  const loyerPaye = loyer?.statut === "PAYE";

  const totalDu =
    (inscriptionPayee ? 0 : FRAIS_INSCRIPTION) +
    (loyerPaye ? 0 : LOYER_MENSUEL);

  const toutPaye = inscriptionPayee && loyerPaye;
  const bordCouleur = toutPaye ? "#16a34a" : "#dc2626";

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "10px",
        border: "1px solid #E2E8F0",
        borderLeft: `4px solid ${bordCouleur}`,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        overflow: "hidden",
      }}
    >
      {/* En-tête */}
      <div
        style={{
          padding: "12px 14px 10px 14px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "8px",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "3px",
            }}
          >
            <Store size={13} color="#1D4ED8" strokeWidth={2.5} />
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "800",
                color: "#0F172A",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {vendeur.nomBoutique}
            </h3>
          </div>
          <p
            style={{
              fontSize: "10.5px",
              color: "#64748b",
              fontWeight: "600",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {vendeur.userNom || vendeur.userEmail || "—"}
          </p>
          <p
            style={{
              fontSize: "10px",
              color: "#94a3b8",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              marginTop: "2px",
            }}
          >
            <Phone size={9} />
            {vendeur.telephone}
          </p>
        </div>

        {toutPaye ? (
          <span
            style={{
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
            }}
          >
            <CheckCircle size={10} strokeWidth={2.5} />
            À JOUR
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              padding: "3px 8px",
              borderRadius: 
