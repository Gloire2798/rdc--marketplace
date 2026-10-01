"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Lock, Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react";

export default function Connexion() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);

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

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#FAF5E8",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Fond décoratif - forme orange en bas */}
      <div style={{
        position: "absolute",
        bottom: "-100px",
        left: "-50px",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
        opacity: 0.1,
      }} />
      <div style={{
        position: "absolute",
        bottom: "-80px",
        right: "-40px",
        width: "160px",
        height: "160px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)",
        opacity: 0.08,
      }} />

      {/* Logo en haut */}
      <div style={{ textAlign: "center", marginBottom: "24px", position: "relative", zIndex: 1 }}>
        <img
          src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg"
          alt="GK Sensei"
          style={{
            height: "70px",
            width: "auto",
            mixBlendMode: "multiply",
            marginBottom: "8px",
          }}
        />
        <p style={{
          fontSize: "11px",
          color: "#78716C",
          fontWeight: "700",
          letterSpacing: "0.5px",
        }}>
          Le commerce en un clic
        </p>
      </div>

      {/* Carte de connexion */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "22px 18px 24px 18px",
        boxShadow: "0 4px 20px rgba(120, 100, 60, 0.08)",
        border: "1px solid #F1ECE0",
        maxWidth: "420px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "6px",
          letterSpacing: "-0.3px",
        }}>
          Connectez-vous
        </h1>
        <p style={{
          fontSize: "12.5px",
          color: "#78716C",
          fontWeight: "500",
          marginBottom: "20px",
          lineHeight: 1.4,
        }}>
          Accédez à votre espace GK Sensei et continuez vos achats.
        </p>

        {erreur && (
          <div style={{
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            padding: "10px 12px",
            borderRadius: "10px",
            marginBottom: "14px",
            fontSize: "12px",
            fontWeight: "600",
          }}>
            {erreur}
          </div>
        )}

        <form onSubmit={soumettre}>
          {/* Champ téléphone */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1.5px solid #E5E0D5",
            borderRadius: "12px",
            padding: "10px 14px",
            marginBottom: "12px",
            backgroundColor: "#FEFCF8",
          }}>
            <Phone size={16} color="#78716C" strokeWidth={2.2} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: "700", marginBottom: "1px" }}>
                Numéro de téléphone
              </p>
              <input
                type="tel"
                placeholder="0812345678"
                value={form.telephone}
                onChange={(e) => changer("telephone", e.target.value)}
                required
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0F172A",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Champ mot de passe */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1.5px solid #E5E0D5",
            borderRadius: "12px",
            padding: "10px 14px",
            marginBottom: "8px",
            backgroundColor: "#FEFCF8",
          }}>
            <Lock size={16} color="#78716C" strokeWidth={2.2} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: "700", marginBottom: "1px" }}>
                Mot de passe
              </p>
              <input
                type={voirMdp ? "text" : "password"}
                value={form.motDePasse}
                onChange={(e) => changer("motDePasse", e.target.value)}
                required
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0F172A",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setVoirMdp(!voirMdp)}
              style={{
                background: "none",
                border: "none",
                padding: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {voirMdp ? (
                <EyeOff size={16} color="#78716C" strokeWidth={2.2} />
              ) : (
                <Eye size={16} color="#78716C" strokeWidth={2.2} />
              )}
            </button>
          </div>

          {/* Mot de passe oublié */}
          <div style={{ textAlign: "right", marginBottom: "18px" }}>
            <Link
              href="/mot-de-passe-oublie"
              style={{
                color: "#1D4ED8",
                fontSize: "11.5px",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={chargement}
            style={{
              width: "100%",
              backgroundColor: "#0F172A",
              color: "white",
              padding: "13px",
              borderRadius: "12px",
              border: "none",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: chargement ? 0.6 : 1,
            }}
          >
            {chargement ? (
              "Connexion..."
            ) : (
              <>
                Se connecter
                <ArrowRight size={16} strokeWidth={2.8} />
              </>
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: "18px 0",
        }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E0D5" }} />
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>
            Ou
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E0D5" }} />
        </div>

        {/* Créer un compte client */}
        <Link
          href="/client/inscription"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: "1.5px solid #1D4ED8",
            borderRadius: "12px",
            padding: "12px",
            textDecoration: "none",
            color: "#1D4ED8",
            fontSize: "13px",
            fontWeight: "800",
          }}
        >
          <UserPlus size={16} strokeWidth={2.8} />
          Créer un compte client
        </Link>

        {/* Devenir vendeur */}
        <p style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#78716C",
          fontWeight: "600",
          marginTop: "16px",
        }}>
          Vous vendez déjà ?{" "}
          <Link
            href="/vendeur/inscription"
            style={{
              color: "#1D4ED8",
              fontWeight: "800",
              textDecoration: "none",
            }}
          >
            Devenir vendeur →
          </Link>
        </p>
      </div>
    </div>
  );
                  }
