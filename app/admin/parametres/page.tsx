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
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1.5px solid #0F172A",
    fontSize: "13px",
    fontFamily: "inherit",
    backgroundColor: "white",
    color: "#0F172A",
    fontWeight: "700" as const,
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    marginBottom: "6px",
    fontSize: "11px",
    fontWeight: "900" as const,
    color: "#0F172A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
  };

  const carteStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "16px",
    border: "1px solid #D4C5A0",
    marginBottom: "14px",
    boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
  };

  const titreSection = {
    fontSize: "12px",
    fontWeight: "900" as const,
    color: "#0F172A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.6px",
    marginBottom: "14px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
  };

  const traitOrange = {
    display: "inline-block",
    width: "3px",
    height: "13px",
    backgroundColor: "#EA580C",
    borderRadius: "2px",
  };

  if (chargement) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#F5EAD2",
        padding: "60px 16px",
        textAlign: "center",
      }}>
        <Loader2
          size={28}
          color="#EA580C"
          strokeWidth={2.8}
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p style={{
          marginTop: "10px",
          fontSize: "12px",
          color: "#57534E",
          fontWeight: "800",
        }}>
          Chargement...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5EAD2", padding: "16px 12px 90px" }}>
      {/* TOAST */}
      {toast && (
        <div
          style={{
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
          }}
        >
          {toast.type === "ok" ? <Check size={14} strokeWidth={3} /> : <AlertCircle size={14} strokeWidth={3} />}
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{ marginBottom: "18px" }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: "900",
          color: "#0F172A",
          letterSpacing: "-0.4px",
          marginBottom: "3px",
        }}>
          Paramètres
        </h1>
        <p style={{
          fontSize: "11.5px",
          color: "#57534E",
          fontWeight: "700",
        }}>
          Configuration du complexe commercial
        </p>
      </div>

      {/* Section : Infos du complexe */}
      <div style={carteStyle}>
        <p style={titreSection}>
          <span style={traitOrange} />
          <Building2 size={14} strokeWidth={2.8} color="#EA580C" />
          Infos du complexe
        </p>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>
            <Building2 size={11} strokeWidth={2.8} />
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

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>
            <MapPin size={11} strokeWidth={2.8} />
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
            <Phone size={11} strokeWidth={2.8} />
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
        <p style={titreSection}>
          <span style={traitOrange} />
          <Wallet size={14} strokeWidth={2.8} color="#EA580C" />
          Montants & Échéances
        </p>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>
            <Wallet size={11} strokeWidth={2.8} />
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

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>
            <Wallet size={11} strokeWidth={2.8} />
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
            <Calendar size={11} strokeWidth={2.8} />
            Jour d&apos;échéance (1-28)
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
        <p style={titreSection}>
          <span style={traitOrange} />
          <Smartphone size={14} strokeWidth={2.8} color="#EA580C" />
          Paiement & Outils
        </p>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>
            <Smartphone size={11} strokeWidth={2.8} />
            Numéro Mobile Money
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
            <BarChart3 size={11} strokeWidth={2.8} />
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
          backgroundColor: "#0F172A",
          color: "white",
          padding: "16px",
          borderRadius: "26px",
          border: "none",
          fontWeight: "900",
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          opacity: enregistrement ? 0.6 : 1,
          marginTop: "6px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
          letterSpacing: "-0.2px",
          fontFamily: "inherit",
        }}
      >
        {enregistrement ? (
          <Loader2 size={16} strokeWidth={2.8} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Save size={16} strokeWidth={2.8} />
        )}
        {enregistrement ? "Enregistrement..." : "Enregistrer les paramètres"}
      </button>
    </div>
  );
    }
