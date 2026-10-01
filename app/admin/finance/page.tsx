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
  Filter,
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

      // Mettre à jour localement (pas besoin de recharger)
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

      afficherToast("✅ Paiement marqué comme payé");
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
    <main className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* ---------- TOAST ---------- */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-[12.5px] font-bold flex items-center gap-2 ${
            toast.type === "ok"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "ok" ? <Check size={16} /> : <XCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pt-5">
        {/* ---------- EN-TÊTE ---------- */}
        <div className="mb-5">
          <h1 className="text-[24px] font-black text-[#0F172A] tracking-tight">
            Finance
          </h1>
          <p className="text-[12px] text-[#64748B] font-semibold mt-0.5">
            Gestion des frais d'inscription et des loyers
          </p>
        </div>

        {/* ---------- STATS 2x2 ---------- */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <StatCard
            label="Inscriptions"
            value={formatFC(inscriptionsEncaissees)}
            icon={<Wallet size={16} className="text-blue-600" />}
            bg="bg-blue-50"
          />
          <StatCard
            label="Loyers"
            value={formatFC(loyersEncaissees)}
            icon={<Wallet size={16} className="text-orange-600" />}
            bg="bg-orange-50"
          />
          <StatCard
            label="Total encaissé"
            value={formatFC(totalCollecte)}
            icon={<TrendingUp size={16} className="text-emerald-600" />}
            bg="bg-emerald-50"
            highlight="emerald"
          />
          <StatCard
            label="À collecter"
            value={formatFC(totalACollecter)}
            icon={<TrendingDown size={16} className="text-red-600" />}
            bg="bg-red-50"
            highlight="red"
          />
        </div>

        {/* ---------- FILTRES ---------- */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-1 text-[#64748B] shrink-0">
            <Filter size={13} strokeWidth={2.5} />
          </div>
          <FiltreBouton
            actif={filtre === "TOUT"}
            onClick={() => setFiltre("TOUT")}
            label={`Tout (${vendeurs.length})`}
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
            couleur="emerald"
          />
        </div>

        {/* ---------- CHARGEMENT ---------- */}
        {chargement && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#1E3A8A]" />
            <p className="mt-3 text-[12px] text-[#64748B] font-semibold">
              Chargement...
            </p>
          </div>
        )}

        {/* ---------- ERREUR ---------- */}
        {erreur && !chargement && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-2 text-[12.5px] text-red-700 font-semibold">
            <AlertCircle size={16} />
            {erreur}
          </div>
        )}

        {/* ---------- LISTE VENDEURS ---------- */}
        {!chargement && !erreur && (
          <>
            {vendeursFiltres.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8DFC8] p-8 text-center">
                <Store size={32} className="mx-auto text-[#94A3B8] mb-2" />
                <p className="text-[13px] font-bold text-[#0F172A]">
                  Aucun vendeur
                </p>
                <p className="text-[11.5px] text-[#64748B] mt-1">
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
  bg,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  highlight?: "emerald" | "red";
}) {
  const valueColor =
    highlight === "emerald"
      ? "text-emerald-600"
      : highlight === "red"
      ? "text-red-600"
      : "text-[#0F172A]";

  return (
    <div className="bg-white rounded-2xl border border-[#E8DFC8] p-3 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <p className="text-[10.5px] font-bold text-[#64748B] uppercase tracking-wide truncate">
          {label}
        </p>
      </div>
      <p className={`text-[14px] font-black ${valueColor} truncate`}>{value}</p>
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
  couleur?: "red" | "emerald";
}) {
  const base =
    "px-3 py-1.5 rounded-full text-[11.5px] font-bold transition whitespace-nowrap border";

  let actifClass = "bg-[#1E3A8A] text-white border-[#1E3A8A]";
  if (couleur === "red") actifClass = "bg-red-500 text-white border-red-500";
  if (couleur === "emerald")
    actifClass = "bg-emerald-500 text-white border-emerald-500";

  return (
    <button
      onClick={onClick}
      className={`${base} ${
        actif
          ? actifClass
          : "bg-white text-[#64748B] border-[#E8DFC8] hover:border-[#1E3A8A]"
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
    ? "border-l-emerald-500"
    : "border-l-red-500";

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E8DFC8] border-l-4 ${bordCouleur} shadow-sm overflow-hidden`}
    >
      {/* ---------- EN-TÊTE CARTE ---------- */}
      <div className="px-3.5 pt-3.5 pb-3 border-b border-[#F1ECE0]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Store size={13} className="text-[#1E3A8A] shrink-0" strokeWidth={2.5} />
              <h3 className="text-[13.5px] font-black text-[#0F172A] truncate">
                {vendeur.nomBoutique}
              </h3>
            </div>
            <p className="text-[11px] text-[#64748B] font-semibold truncate mt-0.5">
              👤 {vendeur.userNom || vendeur.userEmail || "—"}
            </p>
            <p className="text-[10.5px] text-[#94A3B8] font-semibold flex items-center gap-1 mt-0.5">
              <Phone size={9} strokeWidth={2.5} />
              {vendeur.telephone}
            </p>
          </div>
          {toutPaye ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
              <CheckCircle2 size={11} strokeWidth={3} />
              À JOUR
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black">
              <AlertCircle size={11} strokeWidth={3} />
              IMPAYÉ
            </span>
          )}
        </div>
      </div>

      {/* ---------- LIGNES PAIEMENTS ---------- */}
      <div className="px-3.5 py-3 space-y-2">
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
      <div className="px-3.5 py-3 bg-[#FAF6EE] border-t border-[#F1ECE0] flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide">
            Total dû
          </p>
          <p
            className={`text-[15px] font-black ${
              toutPaye ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatFC(totalDu)}
          </p>
        </div>

        {!toutPaye && (
          <button
            onClick={() => onToutMarquerPaye(vendeur)}
            disabled={enCours !== null && enCours.startsWith(vendeur.id)}
            className="px-3 py-2 rounded-xl bg-[#1E3A8A] text-white text-[11.5px] font-black flex items-center gap-1.5 active:scale-95 transition disabled:opacity-60 shrink-0"
          >
            <Check size={13} strokeWidth={3} />
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
        <p className="text-[12px] font-bold text-[#0F172A] truncate">{label}</p>
        <p className="text-[11px] font-semibold text-[#64748B]">
          {formatFC(montant)}
        </p>
      </div>

      {paye ? (
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
          <Check size={10} strokeWidth={3} />
          Payé
        </span>
      ) : (
        <button
          onClick={onMarquer}
          disabled={enCours}
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-50 text-red-700 text-[10.5px] font-black border border-red-100 active:scale-95 transition disabled:opacity-60"
        >
          {enCours ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <XCircle size={11} strokeWidth={3} />
          )}
          {enCours ? "..." : "Marquer payé"}
        </button>
      )}
    </div>
  );
        }
