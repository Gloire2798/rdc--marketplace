"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Wallet,
  Calendar,
  Smartphone,
  BarChart3,
  Save,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

interface Parametres {
  nomComplexe: string;
  adresse: string | null;
  telephone: string | null;
  fraisInscription: number;
  loyerMensuel: number;
  jourEcheance: number;
  numMobileMoney: string | null;
  lienAnalytics: string | null;
}

export default function ParametresPage() {
  const [params, setParams] = useState<Parametres>({
    nomComplexe: "GK Sensei",
    adresse: "",
    telephone: "",
    fraisInscription: 25000,
    loyerMensuel: 15000,
    jourEcheance: 15,
    numMobileMoney: "",
    lienAnalytics: "",
  });

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const afficherToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Charger les paramètres
  useEffect(() => {
    fetch("/api/admin/parametres")
      .then((res) => res.json())
      .then((data) => {
        if (data.succes && data.parametre) {
          setParams({
            nomComplexe: data.parametre.nomComplexe || "GK Sensei",
            adresse: data.parametre.adresse || "",
            telephone: data.parametre.telephone || "",
            fraisInscription: data.parametre.fraisInscription ?? 25000,
            loyerMensuel: data.parametre.loyerMensuel ?? 15000,
            jourEcheance: data.parametre.jourEcheance ?? 15,
            numMobileMoney: data.parametre.numMobileMoney || "",
            lienAnalytics: data.parametre.lienAnalytics || "",
          });
        }
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, []);

  const enregistrer = async () => {
    setEnregistrement(true);
    try {
      const res = await fetch("/api/admin/parametres", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (res.ok && data.succes) {
        afficherToast("Paramètres enregistrés");
      } else {
        afficherToast(data.erreur || "Erreur", "err");
      }
    } catch {
      afficherToast("Erreur réseau", "err");
    }
    setEnregistrement(false);
  };

  const champStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #E2E8F0",
    fontSize: "13px",
    fontFamily: "inherit",
    backgroundColor: "white",
    color: "#0F172A",
    fontWeight: "600" as const,
    outline: "none",
  };

  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "6px",
    fontSize: "10.5px",
    fontWeight: "800" as const,
    color: "#475569",
    textTransform: "uppercase" as const,
    letterSpacing: "0.3px",
  };

  const carteStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "14px",
    border: "1px solid #E2E8F0",
    marginBottom: "12px",
  };

  if (chargement) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F1F5F9", padding: "60px 16px", textAlign: "center" }}>
        <Loader2 size={28} color="#1D4ED8" style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "10px", fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
          Chargement...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F1F5F9", padding: "16px 12px 90px" }}>
      {/* Toast */}
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
          {toast.type === "ok" ? <Check size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* En-tête */}
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A" }}>
          Paramètres
        </h1>
        <p style={{ fontSize: "11px", color: "#64748B", fontWeight: "600", marginTop: "3px" }}>
          Configuration du complexe commercial
        </p>
      </div>

      {/* Section : Infos du complexe */}
      <div style={carteStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          <Building2 size={14} color="#1D4ED8" strokeWidth={2.5} />
          <p style={{ fontSize: "11px", fontWeight: "800", color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.3px" }}>
            Infos du complexe
          </p>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={labelStyle}>
            <Building2 size={11} />
            Nom du complexe
          </label>
          <input
            type="text"
            value={params.nomComplexe}
            onChange={(e) => setParams({ ...params, nomComplexe: e.target.value })}
            style={champStyle}
            placeholder="GK Sensei"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={labelStyle}>
            <MapPin size={11} />
            Adresse
          </label>
          <input
            type="text"
            value={params.adresse || ""}
            onChange={(e) => setParams({ ...params, adresse: e.target.value })}
            style={champStyle}
            placeholder="Ex: Avenue du Commerce, Kinshasa"
          />
        </div>

        <div>
          <label style={labelStyle}>
            <Phone size={11} />
            Téléphone
          </label>
          <input
            type="tel"
            value={params.telephone || ""}
            onChange={(e) => setParams({ ...params, telephone: e.target.value })}
            style={champStyle}
            placeholder="Ex: 0822630873"
          />
        </div>
      </div>

      {/* Section : Montants */}
      <div style={carteStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          <Wallet size={14} color="#1D4ED8" strokeWidth={2.5} />
          <p style={{ fontSize: "11px", fontWeight: "800", color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.3px" }}>
            Montants & Échéances
          </p>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={labelStyle}>
            <Wallet size={11} />
            Frais d&apos;inscription (FC)
          </label>
          <input
            type="number"
            value={params.fraisInscription}
            onChange={(e) => setParams({ ...params, fraisInscription: parseInt(e.target.value) || 0 })}
            style={champStyle}
            min={0}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={labelStyle}>
            <Wallet size={11} />
            Loyer mensuel (FC)
          </label>
          <input
            type="number"
            value={params.loyerMensuel}
            onChange={(e) => setParams({ ...params, loyerMensuel: parseInt(e.target.value) || 0 })}
            style={champStyle}
            min={0}
          />
        </div>

        <div>
          <label style={labelStyle}>
            <Calendar size={11} />
            Jour d&apos;échéance du loyer (1-28)
          </label>
          <input
            type="number"
            value={params.jourEcheance}
            onChange={(e) => setParams({ ...params, jourEcheance: parseInt(e.target.value) || 1 })}
            style={champStyle}
            min={1}
            max={28}
          />
        </div>
      </div>

      {/* Section : Paiement & Analytics */}
      <div style={carteStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          <Smartphone size={14} color="#1D4ED8" strokeWidth={2.5} />
          <p style={{ fontSize: "11px", fontWeight: "800", color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.3px" }}>
            Paiement & Outils
          </p>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={labelStyle}>
            <Smartphone size={11} />
            Numéro Mobile Money du complexe
          </label>
          <input
            type="tel"
            value={params.numMobileMoney || ""}
            onChange={(e) => setParams({ ...params, numMobileMoney: e.target.value })}
            style={champStyle}
            placeholder="Ex: 0822630873"
          />
        </div>

        <div>
          <label style={labelStyle}>
            <BarChart3 size={11} />
            Lien Google Analytics
          </label>
          <input
            type="url"
            value={params.lienAnalytics || ""}
            onChange={(e) => setParams({ ...params, lienAnalytics: e.target.value })}
            style={champStyle}
            placeholder="https://analytics.google.com/..."
          />
        </div>
      </div>

      {/* Bouton Enregistrer */}
      <button
        onClick={enregistrer}
        disabled={enregistrement}
        style={{
          width: "100%",
          backgroundColor: "#1D4ED8",
          color: "white",
          padding: "13px",
          borderRadius: "12px",
          border: "none",
          fontWeight: "800",
          fontSize: "13px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          opacity: enregistrement ? 0.6 : 1,
          marginTop: "6px",
        }}
      >
        {enregistrement ? (
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Save size={16} strokeWidth={2.5} />
        )}
        {enregistrement ? "Enregistrement..." : "Enregistrer les paramètres"}
      </button>
    </div>
  );
            }
