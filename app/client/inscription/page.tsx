"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, LogIn } from "lucide-react";

export default function InscriptionClient() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    motDePasse: "",
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

      setSucces("Compte créé ! Redirection...");
      setChargement(false);

      setTimeout(() => {
        router.push("/vendeur/connexion");
      }, 1500);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setChargement(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "linear-gradient(180deg, #FAF5E8 0%, #F5EAD2 100%)",
      padding: "16px 14px 20px 14px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* SKYLINE EN HAUT */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "160px",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        <div style={{
          position: "absolute",
          top: "30px",
          right: "40px",
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.25) 0%, rgba(249, 115, 22, 0.08) 50%, transparent 75%)",
        }} />
        <svg
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id="ville2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#1E3A5F" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path
            d="M0 100 L0 65 L15 65 L15 45 L28 45 L28 60 L42 60 L42 30 L55 30 L55 50 L70 50 L70 20 L85 20 L85 45 L100 45 L100 35 L115 35 L115 55 L130 55 L130 25 L148 25 L148 50 L165 50 L165 15 L180 15 L180 40 L198 40 L198 30 L215 30 L215 55 L232 55 L232 35 L250 35 L250 60 L268 60 L268 40 L285 40 L285 65 L302 65 L302 45 L320 45 L320 25 L338 25 L338 50 L355 50 L355 35 L372 35 L372 60 L388 60 L388 45 L400 45 L400 100 Z"
            fill="url(#ville2)"
          />
        </svg>
      </div>

      {/* Header : logo + slogan */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "20px",
        position: "relative",
        zIndex: 1,
        flexShrink: 0,
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

      {/* Carte inscription */}
      <div style={{
        backgroundColor: "white",
        borderTopLeftRadius: "40px",
        borderTopRightRadius: "12px",
        borderBottomLeftRadius: "12px",
        borderBottomRightRadius: "40px",
        padding: "18px 16px 16px 16px",
        boxShadow: "0 6px 24px rgba(120, 100, 60, 0.10)",
        border: "1px solid #F1ECE0",
        maxWidth: "400px",
        width: "100%",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        flexShrink: 0,
      }}>
        <h1 style={{
          fontSize: "17px",
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: "4px",
          letterSpacing: "-0.3px",
        }}>
          Créer un compte
        </h1>
        <p style={{
          fontSize: "10.5px",
          color: "#78716C",
          fontWeight: "500",
          marginBottom: "14px",
          lineHeight: 1.4,
        }}>
          Commandez plus vite et suivez vos achats.
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

        {succes && (
          <div style={{
            backgroundColor: "#DCFCE7",
            color: "#166534",
            padding: "7px 10px",
            borderRadius: "8px",
            marginBottom: "10px",
            fontSize: "10.5px",
            fontWeight: "700",
          }}>
            {succes}
          </div>
        )}

        <form onSubmit={soumettre}>
          {/* Nom */}
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
            <User size={13} color="#78716C" strokeWidth={2.2} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "8px", color: "#94a3b8", fontWeight: "700" }}>
                Nom complet
              </p>
              <input
                type="text"
                placeholder="Ex: Jean Mukendi"
                value={form.nom}
                onChange={(e) => changer("nom", e.target.value)}
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
            marginBottom: "12px",
            backgroundColor: "#FEFCF8",
          }}>
            <Lock size={13} color="#78716C" strokeWidth={2.2} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "8px", color: "#94a3b8", fontWeight: "700" }}>
                Mot de passe (min. 6 caractères)
              </p>
              <input
                type={voirMdp ? "text" : "password"}
                value={form.motDePasse}
                onChange={(e) => changer("motDePasse", e.target.value)}
                required
                minLength={6}
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
              "Création..."
            ) : (
              <>
                Créer mon compte
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
          href="/vendeur/connexion"
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
          <LogIn size={13} strokeWidth={2.8} />
          J&apos;ai déjà un compte
        </Link>
      </div>
    </div>
  );
      }
