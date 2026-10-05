"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, TrendingUp, TrendingDown, AlertCircle, Check, XCircle, Store, Loader2 } from "lucide-react";
import CarteVendeur from "./CarteVendeur";
import FiltreBouton from "./FiltreBouton";

interface PaiementFinance {
  id: string;
  type: string;
  periode: string;
  montant: number;
  statut: string;
  datePaiement: string | null;
}

export interface VendeurFinance {
  id: string;
  nomBoutique: string;
  telephone: string;
  userNom: string | null;
  userEmail: string | null;
  createdAt: string;
  paiementsFinance: PaiementFinance[];
}

type Filtre = "TOUT" | "IMPAYES" | "AJOUR";

const FRAIS_INSCRIPTION = 25000;
const LOYER_MENSUEL = 15000;

function formatFC(montant: number) {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FC";
}

function getMoisActuel(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function FinancePage() {
  const router = useRouter();
  const [vendeurs, setVendeurs] = useState<VendeurFinance[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("TOUT");
  const [enCours, setEnCours] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "ok" | "err" } | null>(null);

  const moisActuel = getMoisActuel();

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

  const afficherToast = (message: string, type: "ok" | "err" = "ok") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const marquerPaye = async (vendeurId: string, type: string, periode: string) => {
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

  const toutMarquerPaye = async (vendeur: VendeurFinance) => {
    const inscription = vendeur.paiementsFinance.find((p) => p.type === "INSCRIPTION");
    const loyer = vendeur.paiementsFinance.find(
      (p) => p.type === "LOYER" && p.periode === moisActuel
    );

    const taches: Promise<void>[] = [];
    if (inscription?.statut !== "PAYE") taches.push(marquerPaye(vendeur.id, "INSCRIPTION", "INSCRIPTION"));
    if (loyer?.statut !== "PAYE") taches.push(marquerPaye(vendeur.id, "LOYER", moisActuel));

    await Promise.all(taches);
  };

  const vendeursFiltres = vendeurs.filter((v) => {
    if (filtre === "TOUT") return true;
    const inscription = v.paiementsFinance.find((p) => p.type === "INSCRIPTION");
    const loyer = v.paiementsFinance.find((p) => p.type === "LOYER" && p.periode === moisActuel);
    const inscriptionPayee = inscription?.statut === "PAYE";
    const loyerPaye = loyer?.statut === "PAYE";

    if (filtre === "IMPAYES") return !inscriptionPayee || !loyerPaye;
    if (filtre === "AJOUR") return inscriptionPayee && loyerPaye;
    return true;
  });

  let inscriptionsEncaissees = 0;
  let loyersEncaissees = 0;
  vendeurs.forEach((v) => {
    const i = v.paiementsFinance.find((p) => p.type === "INSCRIPTION");
    const l = v.paiementsFinance.find((p) => p.type === "LOYER" && p.periode === moisActuel);
    if (i?.statut === "PAYE") inscriptionsEncaissees += FRAIS_INSCRIPTION;
    if (l?.statut === "PAYE") loyersEncaissees += LOYER_MENSUEL;
  });

  const totalCollecte = inscriptionsEncaissees + loyersEncaissees;
  const totalACollecter = vendeurs.length * (FRAIS_INSCRIPTION + LOYER_MENSUEL) - totalCollecte;

  const stats = [
    { label: "Inscriptions", valeur: formatFC(inscriptionsEncaissees), Icon: Wallet, bg: "#DBEAFE", iconColor: "#1D4ED8", valueColor: "#0F172A" },
    { label: "Loyers", valeur: formatFC(loyersEncaissees), Icon: Wallet, bg: "#FEF3C7", iconColor: "#B45309", valueColor: "#0F172A" },
    { label: "Encaissé", valeur: formatFC(totalCollecte), Icon: TrendingUp, bg: "#DCFCE7", iconColor: "#16A34A", valueColor: "#16A34A" },
    { label: "À collecter", valeur: formatFC(totalACollecter), Icon: TrendingDown, bg: "#FEE2E2", iconColor: "#DC2626", valueColor: "#DC2626" },
  ];

  return (
    <div style={{ backgroundColor: "#F5EAD2", minHeight: "100vh", padding: "16px 12px 90px 12px" }}>
      {toast && (
        <div style={{
          position: "fixed",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          backgroundColor: toast.type === "ok" ? "#16A34A" : "#DC2626",
          color: "white",
          padding: "10px 16px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "900",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.20)",
        }}>
          {toast.type === "ok" ? <Check size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
          {toast.message}
        </div>
      )}

      <div style={{ marginBottom: "18px" }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "3px",
          letterSpacing: "-0.4px",
        }}>
          Finance
        </h1>
        <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700" }}>
          Gestion des frais d&apos;inscription et des loyers
        </p>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        {stats.map((stat) => {
          const Icon = stat.Icon;
          return (
            <div key={stat.label} style={{
              backgroundColor: "white",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
              border: "1px solid #D4C5A0",
            }}>
              <div style={{ backgroundColor: stat.bg, padding: "8px", display: "flex", justifyContent: "center" }}>
                <Icon size={16} color={stat.iconColor} strokeWidth={2.8} />
              </div>
              <div style={{ padding: "8px 6px 10px 6px", textAlign: "center" }}>
                <p style={{
                  fontSize: "9.5px",
                  color: "#57534E",
                  marginBottom: "3px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}>
                  {stat.label}
                </p>
                <p style={{
                  fontSize: "13px",
                  fontWeight: "900",
                  color: stat.valueColor,
                  lineHeight: 1.1,
                  letterSpacing: "-0.3px",
                }}>
                  {stat.valeur}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTRES */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", overflowX: "auto" }}>
        <FiltreBouton actif={filtre === "TOUT"} onClick={() => setFiltre("TOUT")} label={`Tout (${vendeurs.length})`} couleur="blue" />
        <FiltreBouton actif={filtre === "IMPAYES"} onClick={() => setFiltre("IMPAYES")} label="Impayés" couleur="red" />
        <FiltreBouton actif={filtre === "AJOUR"} onClick={() => setFiltre("AJOUR")} label="À jour" couleur="green" />
      </div>

      {chargement && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 size={28} color="#EA580C" strokeWidth={2.8} />
          <p style={{ marginTop: "10px", fontSize: "12px", color: "#57534E", fontWeight: "800" }}>Chargement...</p>
        </div>
      )}

      {erreur && !chargement && (
        <div style={{
          backgroundColor: "#FEE2E2",
          border: "1.5px solid #DC2626",
          borderRadius: "14px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          color: "#B91C1C",
          fontWeight: "800",
        }}>
          <AlertCircle size={16} strokeWidth={2.8} />
          {erreur}
        </div>
      )}

      {!chargement && !erreur && (
        <>
          {vendeursFiltres.length === 0 ? (
            <div style={{
              backgroundColor: "white",
              borderRadius: "20px",
              border: "1.5px solid #0F172A",
              padding: "40px 20px",
              textAlign: "center",
              boxShadow: "4px 4px 0 #EA580C",
            }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#F5EAD2",
                marginBottom: "10px",
              }}>
                <Store size={26} color="#EA580C" strokeWidth={2} />
              </div>
              <p style={{ fontSize: "13px", fontWeight: "900", color: "#0F172A" }}>Aucun vendeur</p>
              <p style={{ fontSize: "11px", color: "#57534E", marginTop: "4px", fontWeight: "700" }}>
                {filtre === "TOUT" ? "Aucun vendeur enregistré." : "Aucun vendeur dans ce filtre."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
  );
    }
