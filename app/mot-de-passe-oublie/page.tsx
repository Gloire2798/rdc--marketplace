"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check, AlertCircle, Mail, MessageCircle } from "lucide-react";

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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

  const verifierCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");

    if (code.length !== 6) {
      setErreur("Le code doit contenir 6 chiffres");
      return;
    }

    setEtape("nouveauMdp");
  };

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
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
    border: "1.5px solid #0F172A",
    borderRadius: "14px",
    padding: "10px 12px",
    marginBottom: "10px",
    backgroundColor: "white",
  };

  const labelMini = {
    fontSize: "8.5px",
    color: "#57534E",
    fontWeight: "900" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
  };

  const inputStyle = {
    width: "100%",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: "13px",
    fontWeight: "700" as const,
    color: "#0F172A",
    fontFamily: "inherit",
  };

  const btnStyle = {
    width: "100%",
    background: "#0F172A",
    color: "white",
    padding: "14px",
    borderRadius: "26px",
    border: "none",
    fontWeight: "900" as const,
    fontSize: "13.5px",
    cursor: "pointer",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: "6px",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
    letterSpacing: "-0.2px",
    fontFamily: "inherit",
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "linear-gradient(180deg, #FFFFFF 0%, #FDF6EC 100%)",
      padding: "16px 14px 20px 14px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
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
          background: "radial-gradient(circle, rgba(234, 88, 12, 0.35) 0%, rgba(234, 88, 12, 0.10) 50%, transparent 75%)",
        }} />
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
          <defs>
            <linearGradient id="ville5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F172A" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d="M0 100 L0 65 L15 65 L15 45 L28 45 L28 60 L42 60 L42 30 L55 30 L55 50 L70 50 L70 20 L85 20 L85 45 L100 45 L100 35 L115 35 L115 55 L130 55 L130 25 L148 25 L148 50 L165 50 L165 15 L180 15 L180 40 L198 40 L198 30 L215 30 L215 55 L232 55 L232 35 L250 35 L250 60 L268 60 L268 40 L285 40 L285 65 L302 65 L302 45 L320 45 L320 25 L338 25 L338 50 L355 50 L355 35 L372 35 L372 60 L388 60 L388 45 L400 45 L400 100 Z" fill="url(#ville5)" />
        </svg>
      </div>

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
          <img src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg" alt="GK Sensei" style={{ height: "50px", width: "auto", mixBlendMode: "multiply", marginBottom: "2px" }} />
          <p style={{ fontSize: "9px", color: "#64748B", fontWeight: "800", letterSpacing: "0.3px" }}>Le commerce en un clic</p>
        </div>
        <div style={{ textAlign: "right", maxWidth: "130px" }}>
          <p style={{ fontSize: "10px", color: "#0F172A", fontWeight: "900", lineHeight: 1.3 }}>
            Plus proche de vos besoins, partout à Kinshasa.
          </p>
          <div style={{ height: "3px", width: "26px", background: "#EA580C", marginLeft: "auto", marginTop: "3px", borderRadius: "2px" }} />
        </div>
      </div>

      <div style={{
        backgroundColor: "white",
        borderTopLeftRadius: "40px",
        borderTopRightRadius: "14px",
        borderBottomLeftRadius: "14px",
        borderBottomRightRadius: "40px",
        padding: "18px 16px 18px 16px",
        boxShadow: "4px 4px 0 #F59E0B, 0 6px 24px rgba(15, 23, 42, 0.10)",
        border: "1.5px solid #0F172A",
        maxWidth: "400px",
        width: "100%",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        maxHeight: "calc(100vh - 200px)",
        overflowY: "auto",
      }}>
        {etape !== "succes" && (
          <Link
            href="/vendeur/connexion"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "#0F172A",
              fontSize: "11px",
              fontWeight: "800",
              textDecoration: "none",
              marginBottom: "14px",
            }}
          >
            <ArrowLeft size={12} strokeWidth={2.8} />
            Retour
          </Link>
        )}

        <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", marginBottom: "4px", letterSpacing: "-0.5px" }}>
          {etape === "telephone" && "Mot de passe oublié"}
          {etape === "code" && "Code de vérification"}
          {etape === "nouveauMdp" && "Nouveau mot de passe"}
          {etape === "succes" && "Mot de passe modifié"}
        </h1>
        <p style={{ fontSize: "11px", color: "#334155", fontWeight: "700", marginBottom: "16px", lineHeight: 1.4 }}>
          {etape === "telephone" && "Entrez votre numéro pour recevoir un code."}
          {etape === "code" && "Entrez le code à 6 chiffres."}
          {etape === "nouveauMdp" && "Choisissez un nouveau mot de passe."}
          {etape === "succes" && "Vous pouvez maintenant vous connecter."}
        </p>

        {erreur && (
          <div style={{
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            padding: "8px 10px",
            borderRadius: "10px",
            marginBottom: "10px",
            fontSize: "10.5px",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            border: "1px solid #FECACA",
          }}>
            <AlertCircle size={12} strokeWidth={2.8} />
            {erreur}
          </div>
        )}

        {etape === "telephone" && (
          <form onSubmit={envoyerTelephone}>
            <div style={champStyle}>
              <Phone size={14} color="#0F172A" strokeWidth={2.5} />
              <div style={{ flex: 1 }}>
                <p style={labelMini}>Numéro de téléphone</p>
                <input
                  type="tel"
                  placeholder="0812345678"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value.replace(/\D/g, ""))}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <button type="submit" disabled={chargement} style={{ ...btnStyle, opacity: chargement ? 0.6 : 1 }}>
              {chargement ? "Envoi..." : <>Recevoir le code <ArrowRight size={14} strokeWidth={3} /></>}
            </button>
          </form>
        )}

        {etape === "code" && (
          <form onSubmit={verifierCode}>
            {methode === "email" && (
              <div style={{
                backgroundColor: "white",
                border: "1.5px solid #0F172A",
                borderRadius: "14px",
                padding: "12px",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <Mail size={16} color="#EA580C" strokeWidth={2.5} />
                <p style={{ fontSize: "11px", color: "#0F172A", fontWeight: "800" }}>{messageInfo}</p>
              </div>
            )}

            {methode === "ecran" && codeAffiche && (
              <div style={{
                backgroundColor: "white",
                border: "1.5px solid #0F172A",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "14px",
                textAlign: "center",
                boxShadow: "3px 3px 0 #EA580C",
              }}>
                <p style={{
                  fontSize: "9.5px",
                  color: "#57534E",
                  fontWeight: "900",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Votre code
                </p>
                <p style={{
                  fontSize: "28px",
                  fontWeight: "900",
                  color: "#EA580C",
                  letterSpacing: "4px",
                  fontFamily: "monospace",
                  margin: 0,
                }}>
                  {codeAffiche}
                </p>
                <p style={{ fontSize: "9.5px", color: "#57534E", fontWeight: "700", marginTop: "6px" }}>
                  Valable 15 minutes
                </p>
              </div>
            )}

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
                borderRadius: "14px",
                border: "1.5px solid #0F172A",
                fontSize: "20px",
                fontFamily: "monospace",
                textAlign: "center",
                letterSpacing: "6px",
                backgroundColor: "white",
                outline: "none",
                color: "#0F172A",
                fontWeight: "900",
                marginBottom: "12px",
                boxSizing: "border-box",
              }}
            />

            <button type="submit" style={btnStyle}>
              Vérifier <ArrowRight size={14} strokeWidth={3} />
            </button>
          </form>
        )}

        {etape === "nouveauMdp" && (
          <form onSubmit={changerMdp}>
            <div style={champStyle}>
              <Lock size={14} color="#0F172A" strokeWidth={2.5} />
              <div style={{ flex: 1 }}>
                <p style={labelMini}>Nouveau mot de passe</p>
                <input
                  type={showMdp ? "text" : "password"}
                  value={nouveauMdp}
                  onChange={(e) => setNouveauMdp(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowMdp(!showMdp)}
                style={{ background: "none", border: "none", padding: "2px", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                {showMdp ? <EyeOff size={14} color="#57534E" strokeWidth={2.5} /> : <Eye size={14} color="#57534E" strokeWidth={2.5} />}
              </button>
            </div>

            <div style={champStyle}>
              <Lock size={14} color="#0F172A" strokeWidth={2.5} />
              <div style={{ flex: 1 }}>
                <p style={labelMini}>Confirmation</p>
                <input
                  type={showMdp ? "text" : "password"}
                  value={confirmationMdp}
                  onChange={(e) => setConfirmationMdp(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <button type="submit" disabled={chargement} style={{ ...btnStyle, opacity: chargement ? 0.6 : 1 }}>
              {chargement ? "Modification..." : <>Changer le mot de passe <Check size={14} strokeWidth={3} /></>}
            </button>
          </form>
        )}

        {etape === "succes" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#DCFCE7",
              border: "2px solid #16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "8px auto 14px auto",
            }}>
              <Check size={32} color="#16A34A" strokeWidth={3} />
            </div>
            <p style={{
              fontSize: "12px",
              color: "#15803D",
              fontWeight: "800",
              marginBottom: "18px",
              lineHeight: 1.5,
            }}>
              Votre mot de passe a été modifié avec succès.
            </p>
            <Link
              href="/vendeur/connexion"
              style={{
                display: "flex",
                width: "100%",
                background: "#0F172A",
                color: "white",
                padding: "14px",
                borderRadius: "26px",
                textDecoration: "none",
                fontWeight: "900",
                fontSize: "13px",
                textAlign: "center",
                boxSizing: "border-box",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
              }}
            >
              Se connecter
            </Link>
          </div>
        )}

        {etape === "telephone" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "16px 0 12px 0" }}>
              <div style={{ flex: 1, height: "1.5px", backgroundColor: "#E2E8F0" }} />
              <span style={{ fontSize: "10px", color: "#57534E", fontWeight: "800" }}>Besoin d&apos;aide ?</span>
              <div style={{ flex: 1, height: "1.5px", backgroundColor: "#E2E8F0" }} />
            </div>

            <a
              href="https://wa.me/243822630873"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                border: "2px solid #16A34A",
                borderRadius: "24px",
                padding: "10px",
                textDecoration: "none",
                color: "#16A34A",
                fontSize: "11.5px",
                fontWeight: "900",
              }}
            >
              <MessageCircle size={14} strokeWidth={2.8} />
              Contacter l&apos;admin sur WhatsApp
            </a>
          </>
        )}
      </div>
    </div>
  );
            }
