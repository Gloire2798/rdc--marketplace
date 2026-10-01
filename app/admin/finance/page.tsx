"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
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
  // Afficher un toast
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
  // Marquer TOUT payé pour un vendeur
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
  // Filtrer les vendeurs
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
  // Stats globales
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

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 pb-24">
      {/* ---------- TOAST ---------- */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 ${
            toast.type === "ok"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "ok" ? <Check size={16} /> : <XCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-4xl">

        {/* ---------- EN-TÊTE ---------- */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Finance
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Gestion des frais d'inscription et des loyers
          </p>
        </div>

        {/* ---------- STATS 2x2 ---------- */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          <StatCard
            label="Inscriptions"
            value={formatFC(inscriptionsEncaissees)}
            icon={<Wallet size={18} className="text-blue-700" />}
            iconBg="bg-blue-100"
          />
          <StatCard
            label="Loyers"
            value={formatFC(loyersEncaissees)}
            icon={<Wallet size={18} className="text-orange-700" />}
            iconBg="bg-orange-100"
          />
          <StatCard
            label="Total encaissé"
            value={formatFC(totalCollecte)}
            icon={<TrendingUp size={18} className="text-green-700" />}
            iconBg="bg-green-100"
            valueColor="text-green-700"
          />
          <StatCard
            label="À collecter"
            value={formatFC(totalACollecter)}
            icon={<TrendingDown size={18} className="text-red-700" />}
            iconBg="bg-red-100"
            valueColor="text-red-700"
          />
        </div>

        {/* ---------- FILTRES ---------- */}
        <div className="flex items-center gap-2 mt-7 mb-4 overflow-x-auto">
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
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-700" />
            <p className="mt-3 text-sm text-slate-500 font-medium">
              Chargement...
            </p>
          </div>
        )}

        {/* ---------- ERREUR ---------- */}
        {erreur && !chargement && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-sm text-red-700 font-medium">
            <AlertCircle size={18} />
            {erreur}
          </div>
        )}

        {/* ---------- LISTE VENDEURS ---------- */}
        {!chargement && !erreur && (
          <>
            {vendeursFiltres.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <Store size={36} className="mx-auto text-slate-400 mb-2" />
                <p className="text-base font-semibold text-slate-900">
                  Aucun vendeur
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {filtre === "TOUT"
                    ? "Aucun vendeur enregistré."
                    : "Aucun vendeur dans ce filtre."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
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
      </div>
    </main>
  );
}

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

function StatCard({
  label,
  value,
  icon,
  iconBg,
  valueColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <p className="text-xs font-medium text-slate-500 sm:text-sm truncate">
          {label}
        </p>
      </div>
      <p className={`text-lg font-bold sm:text-2xl ${valueColor || "text-slate-900"} truncate`}>
        {value}
      </p>
    </div>
  );
}

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
  let actifClass = "bg-blue-700 text-white border-blue-700";
  if (couleur === "red") actifClass = "bg-red-600 text-white border-red-600";
  if (couleur === "green") actifClass = "bg-green-600 text-white border-green-600";

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap border ${
        actif
          ? actifClass
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
      }`}
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

  const bordCouleur = toutPaye
    ? "border-l-4 border-l-green-500"
    : "border-l-4 border-l-red-500";

  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${bordCouleur} shadow-sm overflow-hidden`}>
      {/* ---------- EN-TÊTE CARTE ---------- */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Store size={14} className="text-blue-700 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {vendeur.nomBoutique}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {vendeur.userNom || vendeur.userEmail || "—"}
            </p>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <Phone size={10} />
              {vendeur.telephone}
            </p>
          </div>
          {toutPaye ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
              <CheckCircle2 size={12} />
              À JOUR
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              <AlertCircle size={12} />
              IMPAYÉ
            </span>
          )}
        </div>
      </div>

      {/* ---------- LIGNES PAIEMENTS ---------- */}
      <div className="px-4 py-3 space-y-2">
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

      {/* ---------- TOTAL + ACTION GLOBALE ---------- */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">
            Total dû
          </p>
          <p className={`text-base font-bold ${toutPaye ? "text-green-700" : "text-red-700"}`}>
            {formatFC(totalDu)}
          </p>
        </div>

        {!toutPaye && (
          <button
            onClick={() => onToutMarquerPaye(vendeur)}
            disabled={enCours !== null && enCours.startsWith(vendeur.id)}
            className="px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition disabled:opacity-60 shrink-0"
          >
            <Check size={14} />
            Tout marquer payé
          </button>
        )}
      </div>
    </div>
  );
}

function LignePaiement({
  label,
  montant,
  paye,
  enCours,
  onMarquer,
}: {
  label: string;
  montant: number;
  paye: boolean;
  enCours: boolean;
  onMarquer: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 truncate">{label}</p>
        <p className="text-xs font-medium text-slate-500">
          {formatFC(montant)}
        </p>
      </div>

      {paye ? (
        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
          <Check size={11} />
          Payé
        </span>
      ) : (
        <button
          onClick={onMarquer}
          disabled={enCours}
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 active:scale-95 transition disabled:opacity-60"
        >
          {enCours ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <XCircle size={12} />
          )}
          {enCours ? "..." : "Marquer payé"}
        </button>
      )}
    </div>
  );
      }
