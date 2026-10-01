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
      maxHeight: "100vh",
      background: "linear-gradient(180deg, #FAF5E8 0%, #F5EAD2 100%)",
      padding: "16px 14px 20px 14px",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Skyline décoratif en bas */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "180px",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        {/* Bâtiments */}
        <svg
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id="ville" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#1E3A5F" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <path
            d="M0 120 L0 90 L20 90 L20 70 L35 70 L35 85 L50 85 L50 55 L65 55 L65 75 L80 75 L80 40 L95 40 L95 65 L110 65 L110 80 L130 80 L130 50 L145 50 L145 70 L165 70 L165 30 L180 30 L180 60 L200 60 L200 45 L220 45 L220 75 L240 75 L240 55 L260 55 L260 80 L280 80 L280 60 L295 60 L295 90 L320 90 L320 65 L340 65 L340 85 L360 85 L360 70 L380 70 L380 90 L400 90 L400 120 Z"
            fill="url(#ville)"
          />
        </svg>

        {/* Coucher de soleil */}
        <div style={{
          position: "absolute",
          bottom: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
        }} />
      </div>

      {/* Header haut : logo + slogan */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "16px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <img
            src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg"
            alt="GK Sensei"
            style={{
              height: "50px",
              width: "auto",
              mixBlendMode: "multiply",
              marginBottom: "2px",
            }}
          />
          <p style={{
            fontSize: "9px",
            color: "#78716C",
            fontWeight: "700",
            letterSpacing: "0.3px",
          }}>
            Le commerce en un clic
          </p>
        </div>

        <div style={{ textAlign: "right", maxWidth: "130px" }}>
          <p style={{
            fontSize: "10px",
            color: "#1E3A5F",
            fontWeight: "800",
            lineHeight: 1.3,
          }}>
            Plus proche de vos besoins, partout à Kinshasa.
          </p>
          <div style={{
            height: "2px",
            width: "26px",
            background: "#F97316",
            marginLeft: "auto",
            marginTop: "3px",
            borderRadius: "2px",
          }} />
        </div>
      </div>

      {/* Carte connexion */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "18px",
        padding: "18px 14px 18px 14px",
        boxShadow: "0 6px 24px rgba(120, 100, 60, 0.10)",
        border: "1px solid #F1ECE0",
        maxWidth: "400px",
        width: "100%",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        <h1 style={{
          fontSize: "17px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "4px",
          letterSpacing: "-0.3px",
        }}>
          Connectez-vous
        </h1>
        <p style={{
          fontSize: "10.5px",
          color: "#78716C",
          fontWeight: "500",
          marginBottom: "14px",
          lineHeight: 1.4,
        }}>
          Connectez-vous ou créez un compte.
        </p>

        {erreur && (
          <div style={{
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            padding: "7px 10px",
            borderRadius: "8px",
            marginBottom: "10px",
            fontSize: "10.5px",
            fontWeight: "600",
          }}>
            {erreur}
          </div>
        )}

        <form onSubmit={soumettre}>
          {/* Téléphone */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid #E5E0D5",
            borderRadius: "10px",
            padding: "7px 10px",
            marginBottom: "8px",
            backgroundColor: "#FEFCF8",
          }}>
            <Phone size={13} color="#78716C" strokeWidth={2.2} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "8px", color: "#94a3b8", fontWeight: "700" }}>
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
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#0F172A",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid #E5E0D5",
            borderRadius: "10px",
            padding: "7px 10px",
            marginBottom: "4px",
            backgroundColor: "#FEFCF8",
          }}>
            <Lock size={13} color="#78716C" strokeWidth={2.2} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "8px", color: "#94a3b8", fontWeight: "700" }}>
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
                  fontSize: "12px",
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
                padding: "2px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {voirMdp ? (
                <EyeOff size={13} color="#78716C" strokeWidth={2.2} />
              ) : (
                <Eye size={13} color="#78716C" strokeWidth={2.2} />
              )}
            </button>
          </div>

          <div style={{ textAlign: "right", marginBottom: "12px" }}>
            <Link
              href="/mot-de-passe-oublie"
              style={{
                color: "#1D4ED8",
                fontSize: "10px",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={chargement}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)",
              color: "white",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              fontWeight: "800",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              opacity: chargement ? 0.6 : 1,
            }}
          >
            {chargement ? (
              "Connexion..."
            ) : (
              <>
                Se connecter
                <ArrowRight size={13} strokeWidth={2.8} />
              </>
            )}
          </button>
        </form>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          margin: "12px 0",
        }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E0D5" }} />
          <span style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: "700" }}>
            Ou
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E0D5" }} />
        </div>

        <Link
          href="/client/inscription"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            border: "1.5px solid #1D4ED8",
            borderRadius: "10px",
            padding: "9px",
            textDecoration: "none",
            color: "#1D4ED8",
            fontSize: "11.5px",
            fontWeight: "800",
          }}
        >
          <UserPlus size={13} strokeWidth={2.8} />
          Créer un compte client
        </Link>

        <p style={{
          textAlign: "center",
          fontSize: "10.5px",
          color: "#78716C",
          fontWeight: "600",
          marginTop: "10px",
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
