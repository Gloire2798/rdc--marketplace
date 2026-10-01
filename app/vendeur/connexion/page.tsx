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
      background: "linear-gradient(180deg, #FAF5E8 0%, #FAF5E8 60%, #F0E4CE 100%)",
      padding: "20px 14px 30px 14px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Skyline décoratif en bas */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "120px",
        background: "linear-gradient(180deg, transparent 0%, rgba(30, 58, 95, 0.06) 100%)",
        pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50px",
          background: "linear-gradient(180deg, transparent 0%, #1E3A5F 100%)",
          opacity: 0.08,
          clipPath: "polygon(0 60%, 5% 40%, 10% 55%, 15% 30%, 20% 50%, 25% 35%, 30% 60%, 35% 45%, 40% 65%, 45% 50%, 50% 70%, 55% 55%, 60% 75%, 65% 60%, 70% 45%, 75% 65%, 80% 40%, 85% 55%, 90% 35%, 95% 50%, 100% 40%, 100% 100%, 0 100%)",
        }} />
      </div>

      {/* Header haut : logo + slogan */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "24px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <img
            src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg"
            alt="GK Sensei"
            style={{
              height: "56px",
              width: "auto",
              mixBlendMode: "multiply",
              marginBottom: "2px",
            }}
          />
          <p style={{
            fontSize: "9.5px",
            color: "#78716C",
            fontWeight: "700",
            letterSpacing: "0.3px",
          }}>
            Le commerce en un clic
          </p>
        </div>

        <div style={{ textAlign: "right", maxWidth: "120px" }}>
          <p style={{
            fontSize: "10.5px",
            color: "#1E3A5F",
            fontWeight: "800",
            lineHeight: 1.3,
          }}>
            Plus proche de vos besoins, partout à Kinshasa.
          </p>
          <div style={{
            height: "2px",
            width: "30px",
            background: "#F97316",
            marginLeft: "auto",
            marginTop: "4px",
            borderRadius: "2px",
          }} />
        </div>
      </div>

      {/* Carte connexion */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "20px 16px 22px 16px",
        boxShadow: "0 6px 24px rgba(120, 100, 60, 0.10)",
        border: "1px solid #F1ECE0",
        maxWidth: "400px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        <h1 style={{
          fontSize: "18px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "4px",
          letterSpacing: "-0.3px",
        }}>
          Connectez-vous
        </h1>
        <p style={{
          fontSize: "11px",
          color: "#78716C",
          fontWeight: "500",
          marginBottom: "16px",
          lineHeight: 1.4,
        }}>
          Connectez-vous ou créez un compte.
        </p>

        {erreur && (
          <div style={{
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            padding: "8px 10px",
            borderRadius: "8px",
            marginBottom: "12px",
            fontSize: "11px",
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
            padding: "8px 12px",
            marginBottom: "10px",
            backgroundColor: "#FEFCF8",
          }}>
            <Phone size={14} color="#78716C" strokeWidth={2.2} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "8.5px", color: "#94a3b8", fontWeight: "700", marginBottom: "0px" }}>
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
                  fontSize: "12.5px",
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
            padding: "8px 12px",
            marginBottom: "6px",
            backgroundColor: "#FEFCF8",
          }}>
            <Lock size={14} color="#78716C" strokeWidth={2.2} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "8.5px", color: "#94a3b8", fontWeight: "700", marginBottom: "0px" }}>
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
                  fontSize: "12.5px",
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
                <EyeOff size={14} color="#78716C" strokeWidth={2.2} />
              ) : (
                <Eye size={14} color="#78716C" strokeWidth={2.2} />
              )}
            </button>
          </div>

          <div style={{ textAlign: "right", marginBottom: "14px" }}>
            <Link
              href="/mot-de-passe-oublie"
              style={{
                color: "#1D4ED8",
                fontSize: "10.5px",
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
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              fontWeight: "800",
              fontSize: "12.5px",
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
                <ArrowRight size={14} strokeWidth={2.8} />
              </>
            )}
          </button>
        </form>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          margin: "14px 0",
        }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E0D5" }} />
          <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700" }}>
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
            padding: "10px",
            textDecoration: "none",
            color: "#1D4ED8",
            fontSize: "12px",
            fontWeight: "800",
          }}
        >
          <UserPlus size={14} strokeWidth={2.8} />
          Créer un compte client
        </Link>

        <p style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#78716C",
          fontWeight: "600",
          marginTop: "12px",
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
