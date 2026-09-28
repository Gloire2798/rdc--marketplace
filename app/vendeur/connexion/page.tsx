"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnexionVendeur() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const [form, setForm] = useState({
    telephone: "",
    motDePasse: "",
  });

  const changer = (champ: string, valeur: string) => {
    setForm({ ...form, [champ]: valeur });
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const res = await fetch("/api/vendeur/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Identifiants incorrects");
        setChargement(false);
        return;
      }

      // Redirection vers le tableau de bord vendeur
      router.push("/vendeur/dashboard");
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
        Connexion vendeur
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Accédez à votre tableau de bord GK Sensei.
      </p>

      {erreur && (
        <div style={{
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}>
          {erreur}
        </div>
      )}

      <form onSubmit={soumettre}>
        <label style={labelStyle}>Numéro de téléphone</label>
        <input
          type="tel"
          placeholder="0812345678"
          style={champStyle}
          value={form.telephone}
          onChange={(e) => changer("telephone", e.target.value)}
          required
        />

        <label style={labelStyle}>Mot de passe</label>
        <input
          type="password"
          style={champStyle}
          value={form.motDePasse}
          onChange={(e) => changer("motDePasse", e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={chargement}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "16px", opacity: chargement ? 0.6 : 1 }}
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#6b7280" }}>
        Pas encore de compte ?{" "}
        <a href="/vendeur/inscription" style={{ color: "#2563eb", fontWeight: "600" }}>
          Devenir vendeur
        </a>
      </p>
    </div>
  );
}
