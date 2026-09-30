"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnexionVendeur() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const [form, setForm] = useState({ telephone: "", motDePasse: "" });

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

      router.push(data.redirection || "/vendeur/dashboard");
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
        Connexion
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Accédez à votre espace GK Sensei.
      </p>

      {erreur && (
        <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
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

        <div style={{ textAlign: "right", marginBottom: "16px" }}>
          <a
            href="/mot-de-passe-oublie"
            style={{ color: "#6b7280", fontSize: "13px" }}
          >
            Mot de passe oublié ?
          </a>
        </div>

        <button
          type="submit"
          disabled={chargement}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "8px", opacity: chargement ? 0.6 : 1 }}
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div style={{
        marginTop: "32px",
        paddingTop: "24px",
        borderTop: "1px solid #e5e7eb",
        textAlign: "center",
      }}>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "12px" }}>
          Pas encore de compte ?
        </p>

        <a
          href="/client/inscription"
          style={{
            display: "block",
            backgroundColor: "white",
            color: "#2563eb",
            border: "1px solid #2563eb",
            padding: "10px",
            borderRadius: "8px",
            fontWeight: "600",
            textDecoration: "none",
            marginBottom: "8px",
          }}
        >
          Créer un compte client
        </a>

        <a
          href="/vendeur/inscription"
          style={{
            display: "block",
            color: "#6b7280",
            fontSize: "14px",
            textDecoration: "underline",
          }}
        >
          Vous voulez vendre ? Devenir vendeur
        </a>
      </div>
    </div>
  );
      }
