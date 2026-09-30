"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InscriptionVendeur() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    motDePasse: "",
    nomBoutique: "",
    description: "",
    adresse: "",
    numMpesa: "",
    numOrange: "",
    numAirtel: "",
  });

  const changer = (champ: string, valeur: string) => {
    setForm({ ...form, [champ]: valeur });
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setSucces("");

    if (!form.numMpesa && !form.numOrange && !form.numAirtel) {
      setErreur("Vous devez renseigner au moins un numéro Mobile Money");
      return;
    }

    setChargement(true);

    try {
      const res = await fetch("/api/vendeur/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          numMobileMoney: form.numMpesa || form.numOrange || form.numAirtel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Une erreur est survenue");
        setChargement(false);
        return;
      }

      setSucces(data.message);
      setChargement(false);

      setTimeout(() => {
        router.push("/vendeur/connexion");
      }, 3000);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setChargement(false);
    }
  };

  const champStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    marginBottom: "16px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600" as const,
    fontSize: "14px",
  };

  const champMobileStyle = {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    marginBottom: "0",
  };

  const logoBoxStyle = {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: "4px",
    boxSizing: "border-box" as const,
    overflow: "hidden",
  };

  const logoImgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
  };

  return (
    <div className="container" style={{ maxWidth: "600px", padding: "40px 16px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
        Devenir vendeur sur GK Sensei
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Créez votre boutique en ligne en quelques minutes.
      </p>

      {erreur && (
        <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
          {erreur}
        </div>
      )}

      {succes && (
        <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
          {succes}
        </div>
      )}

      <form onSubmit={soumettre}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
          Vos informations
        </h2>

        <label style={labelStyle}>Nom complet *</label>
        <input
          type="text"
          style={champStyle}
          value={form.nom}
          onChange={(e) => changer("nom", e.target.value)}
          required
        />

        <label style={labelStyle}>Numéro de téléphone *</label>
        <input
          type="tel"
          placeholder="0812345678"
          style={champStyle}
          value={form.telephone}
          onChange={(e) => changer("telephone", e.target.value)}
          required
        />

        <label style={labelStyle}>Mot de passe * (min. 6 caractères)</label>
        <input
          type="password"
          style={champStyle}
          value={form.motDePasse}
          onChange={(e) => changer("motDePasse", e.target.value)}
          required
          minLength={6}
        />

        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", marginTop: "24px" }}>
          Votre boutique
        </h2>

        <label style={labelStyle}>Nom de la boutique *</label>
        <input
          type="text"
          placeholder="Ex: Mode Kin"
          style={champStyle}
          value={form.nomBoutique}
          onChange={(e) => changer("nomBoutique", e.target.value)}
          required
        />

        <label style={labelStyle}>Description (optionnel)</label>
        <textarea
          style={{ ...champStyle, minHeight: "80px" }}
          value={form.description}
          onChange={(e) => changer("description", e.target.value)}
        />

        <label style={labelStyle}>Adresse physique (optionnel)</label>
        <input
          type="text"
          placeholder="Ex: Avenue du Commerce, Gombe"
          style={champStyle}
          value={form.adresse}
          onChange={(e) => changer("adresse", e.target.value)}
        />

        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", marginTop: "24px" }}>
          Numéros Mobile Money
        </h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "16px" }}>
          Renseignez au moins un numéro pour recevoir les paiements de vos clients.
        </p>

        <label style={labelStyle}>M-Pesa (Vodacom)</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <div style={logoBoxStyle}>
            <img src="https://i.ibb.co/NndcrT1d/m-pesa.jpg" alt="M-Pesa" style={logoImgStyle} />
          </div>
          <input
            type="tel"
            placeholder="Ex: 0812345678"
            style={champMobileStyle}
            value={form.numMpesa}
            onChange={(e) => changer("numMpesa", e.target.value)}
          />
        </div>

        <label style={labelStyle}>Orange Money</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <div style={logoBoxStyle}>
            <img src="https://i.ibb.co/pvr5LPxN/orange.jpg" alt="Orange Money" style={logoImgStyle} />
          </div>
          <input
            type="tel"
            placeholder="Ex: 0891234567"
            style={champMobileStyle}
            value={form.numOrange}
            onChange={(e) => changer("numOrange", e.target.value)}
          />
        </div>

        <label style={labelStyle}>Airtel Money</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <div style={logoBoxStyle}>
            <img src="https://i.ibb.co/spmBgLvg/airtel.jpg" alt="Airtel Money" style={logoImgStyle} />
          </div>
          <input
            type="tel"
            placeholder="Ex: 0991234567"
            style={champMobileStyle}
            value={form.numAirtel}
            onChange={(e) => changer("numAirtel", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={chargement}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "16px", opacity: chargement ? 0.6 : 1 }}
        >
          {chargement ? "Création en cours..." : "Créer ma boutique"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#6b7280" }}>
        Déjà inscrit ?{" "}
        <a href="/vendeur/connexion" style={{ color: "#2563eb", fontWeight: "600" }}>
          Se connecter
        </a>
      </p>
    </div>
  );
                 }
