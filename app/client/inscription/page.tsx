"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InscriptionClient() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    motDePasse: "",
  });

  const changer = (champ: string, valeur: string) => {
    setForm({ ...form, [champ]: valeur });
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setChargement(true);

    try {
      const res = await fetch("/api/client/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Une erreur est survenue");
        setChargement(false);
        return;
      }

      setSucces("Compte créé ! Vous allez être redirigé...");
      setChargement(false);

      setTimeout(() => {
        router.push("/vendeur/connexion");
      }, 2000);
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

  return (
    <div className="container" style={{ maxWidth: "500px", padding: "60px 16px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
        Créer un compte client
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Commandez plus vite et suivez vos achats.
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
        <label style={labelStyle}>Nom complet *</label>
        <input
          type="text"
          placeholder="Ex: Jean Mukendi"
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

        <button
          type="submit"
          disabled={chargement}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "8px", opacity: chargement ? 0.6 : 1 }}
        >
          {chargement ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#6b7280" }}>
        Déjà un compte ?{" "}
        <a href="/vendeur/connexion" style={{ color: "#2563eb", fontWeight: "600" }}>
          Se connecter
        </a>
      </p>
    </div>
  );
                                       }
