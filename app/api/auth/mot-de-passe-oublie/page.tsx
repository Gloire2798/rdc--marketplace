"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Lock, Check, AlertCircle, Mail, Eye } from "lucide-react";

type Etape = "telephone" | "code" | "nouveauMdp" | "succes";

export default function MotDePasseOublie() {
  const router = useRouter();
  const [etape, setEtape] = useState<Etape>("telephone");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [codeAffiche, setCodeAffiche] = useState<string | null>(null);
  const [methode, setMethode] = useState<"email" | "ecran" | null>(null);
  const [messageInfo, setMessageInfo] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmationMdp, setConfirmationMdp] = useState("");
  const [showMdp, setShowMdp] = useState(false);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  // ---------- Étape 1 : envoyer le téléphone ----------
  const envoyerTelephone = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const res = await fetch("/api/auth/mot-de-passe-oublie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur");
        setChargement(false);
        return;
      }

      setMethode(data.methode);
      setMessageInfo(data.message || "");

      if (data.methode === "ecran" && data.code) {
        setCodeAffiche(data.code);
      }

      setEtape("code");
      setChargement(false);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setChargement(false);
    }
  };

  // ---------- Étape 2 : vérifier le code ----------
  const verifierCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");

    if (code.length !== 6) {
      setErreur("Le code doit contenir 6 chiffres");
      return;
    }

    setEtape("nouveauMdp");
  };

  // ---------- Étape 3 : changer le mot de passe ----------
  const changerMdp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");

    if (nouveauMdp.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (nouveauMdp !== confirmationMdp) {
      setErreur("Les deux mots de passe ne correspondent pas");
      return;
    }

    setChargement(true);

    try {
      const res = await fetch("/api/auth/reinitialiser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone, code, nouveauMotDePasse: nouveauMdp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur");
        setChargement(false);
        return;
      }

      setEtape("succes");
      setChargement(false);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setChargement(false);
    }
  };

  const champStyle = {
    width: "100%",
    padding: "12px",
    paddingLeft: "42px",
    borderRadius: "12px",
    border: "1px solid #E5E0D5",
    fontSize: "14px",
    fontFamily: "inherit",
    backgroundColor: "#FEFCF8",
    outline: "none",
    color: "#0F172A",
    fontWeight: "600" as const,
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#FAF5E8",
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column",
    }}>
      <Link
        href="/vendeur/connexion"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#1D4ED8",
          fontSize: "12px",
          fontWeight: "700",
          textDecoration: "none",
          marginBottom: "20px",
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.5} />
        Retour à la connexion
      </Link>

      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "24px 20px",
        boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
        border: "1px solid #E8DFC8",
        maxWidth: "480px",
        width: "100%",
        margin: "0 auto",
      }}>
        {/* En-tête */}
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          backgroundColor: "#EFF6FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}>
          <Lock size={22} color="#1D4ED8" strokeWidth={2.5} />
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", marginBottom: "6px" }}>
          {etape === "telephone" && "Mot de passe oublié ?"}
          {etape === "code" && "Code de vérification"}
          {etape === "nouveauMdp" && "Nouveau mot de passe"}
          {etape === "succes" && "Mot de passe modifié"}
        </h1>

        <p style={{ fontSize: "12.5px", color: "#64748B", fontWeight: "600", marginBottom: "20px", lineHeight: 1.5 }}>
          {etape === "telephone" && "Entrez votre numéro de téléphone pour recevoir un code de réinitialisation."}
          {etape === "code" && "Entrez le code à 6 chiffres que vous avez reçu."}
          {etape === "nouveauMdp" && "Choisissez un nouveau mot de passe sécurisé."}
          {etape === "succes" && "Votre mot de passe a été modifié avec succès."}
        </p>

        {/* Erreur */}
        {erreur && (
          <div style={{
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            padding: "10px 12px",
            borderRadius: "10px",
            marginBottom: "14px",
            fontSize: "11.5px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <AlertCircle size={14} strokeWidth={2.5} />
            {erreur}
          </div>
        )}

        {/* ÉTAPE 1 — Téléphone */}
        {etape === "telephone" && (
          <form onSubmit={envoyerTelephone}>
            <label style={{
              display: "block",
              fontSize: "11.5px",
              fontWeight: "800",
              color: "#334155",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}>
              Numéro de téléphone
            </label>
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <div style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748B",
              }}>
                <Phone size={18} strokeWidth={2.5} />
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value.replace(/\D/g, ""))}
                placeholder="0812345678"
                required
                style={champStyle}
              />
            </div>

            <button
              type="submit"
              disabled={chargement}
              style={{
                width: "100%",
                backgroundColor: "#1D4ED8",
                color: "white",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
                opacity: chargement ? 0.6 : 1,
              }}
            >
              {chargement ? "Envoi..." : "Envoyer le code"}
            </button>
          </form>
        )}

        {/* ÉTAPE 2 — Code */}
        {etape === "code" && (
          <form onSubmit={verifierCode}>
            {/* Message info */}
            {methode === "email" && (
              <div style={{
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <Mail size={16} color="#1D4ED8" strokeWidth={2.5} />
                <p style={{ fontSize: "11.5px", color: "#1E40AF", fontWeight: "700" }}>
                  {messageInfo}
                </p>
              </div>
            )}

            {methode === "ecran" && codeAffiche && (
              <div style={{
                backgroundColor: "#FEF3C7",
                border: "1px solid #FDE68A",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "16px",
                textAlign: "center",
              }}>
                <p style={{
                  fontSize: "11px",
                  color: "#78350F",
                  fontWeight: "800",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Votre code de réinitialisation
                </p>
                <p style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  color: "#B45309",
                  letterSpacing: "4px",
                  fontFamily: "monospace",
                  margin: 0,
                }}>
                  {codeAffiche}
                </p>
                <p style={{ fontSize: "10px", color: "#78350F", fontWeight: "600", marginTop: "6px" }}>
                  Notez-le puis fermez cette fenêtre d'ici 15 minutes.
                </p>
              </div>
            )}

            <label style={{
              display: "block",
              fontSize: "11.5px",
              fontWeight: "800",
              color: "#334155",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}>
              Code à 6 chiffres
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #E5E0D5",
                fontSize: "20px",
                fontFamily: "monospace",
                textAlign: "center",
                letterSpacing: "6px",
                backgroundColor: "#FEFCF8",
                outline: "none",
                color: "#0F172A",
                fontWeight: "800",
                marginBottom: "16px",
                boxSizing: "border-box" as const,
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: "#1D4ED8",
                color: "white",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Vérifier le code
            </button>
          </form>
        )}

        {/* ÉTAPE 3 — Nouveau mot de passe */}
        {etape === "nouveauMdp" && (
          <form onSubmit={changerMdp}>
            <label style={{
              display: "block",
              fontSize: "11.5px",
              fontWeight: "800",
              color: "#334155",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}>
              Nouveau mot de passe
            </label>
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <div style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748B",
              }}>
                <Lock size={18} strokeWidth={2.5} />
              </div>
              <input
                type={showMdp ? "text" : "password"}
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
                placeholder="••••••••"
                required
                style={{ ...champStyle, paddingRight: "42px" }}
              />
              <button
                type="button"
                onClick={() => setShowMdp(!showMdp)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748B",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Eye size={18} strokeWidth={2.5} />
              </button>
            </div>

            <label style={{
              display: "block",
              fontSize: "11.5px",
              fontWeight: "800",
              color: "#334155",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}>
              Confirmation
            </label>
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <div style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748B",
              }}>
                <Lock size={18} strokeWidth={2.5} />
              </div>
              <input
                type={showMdp ? "text" : "password"}
                value={confirmationMdp}
                onChange={(e) => setConfirmationMdp(e.target.value)}
                placeholder="••••••••"
                required
                style={champStyle}
              />
            </div>

            <button
              type="submit"
              disabled={chargement}
              style={{
                width: "100%",
                backgroundColor: "#16a34a",
                color: "white",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
                opacity: chargement ? 0.6 : 1,
              }}
            >
              {chargement ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        )}

        {/* ÉTAPE 4 — Succès */}
        {etape === "succes" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#DCFCE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
            }}>
              <Check size={32} color="#16a34a" strokeWidth={3} />
            </div>
            <p style={{ fontSize: "13px", color: "#166534", fontWeight: "700", marginBottom: "20px" }}>
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Link
              href="/vendeur/connexion"
              style={{
                display: "block",
                backgroundColor: "#1D4ED8",
                color: "white",
                padding: "14px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: "800",
                fontSize: "14px",
              }}
            >
              Se connecter
            </Link>
          </div>
        )}
      </div>
    </div>
  );
        }
