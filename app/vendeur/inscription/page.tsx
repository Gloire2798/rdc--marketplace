"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, Store, MapPin, Mail } from "lucide-react";

export default function InscriptionVendeur() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    email: "",
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
      setErreur("Renseignez au moins un numéro Mobile Money");
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
      }, 2500);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setChargement(false);
    }
  };

  const champBox = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1.5px solid #0F172A",
    borderRadius: "10px",
    padding: "8px 10px",
    marginBottom: "8px",
    backgroundColor: "white",
  };

  const champInput = {
    width: "100%",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: "12px",
    fontWeight: "700" as const,
    color: "#0F172A",
    fontFamily: "inherit",
  };

  const labelMini = {
    fontSize: "8.5px",
    color: "#64748B",
    fontWeight: "800" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.3px",
  };

  const logoBox = {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    backgroundColor: "white",
    border: "1.5px solid #0F172A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: "3px",
    boxSizing: "border-box" as const,
    overflow: "hidden",
  };

  const logoImg = {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #FFFFFF 0%, #FDF6EC 100%)",
      padding: "16px 14px 30px 14px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* SKYLINE */}
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
            <linearGradient id="ville-insc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F172A" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d="M0 100 L0 65 L15 65 L15 45 L28 45 L28 60 L42 60 L42 30 L55 30 L55 50 L70 50 L70 20 L85 20 L85 45 L100 45 L100 35 L115 35 L115 55 L130 55 L130 25 L148 25 L148 50 L165 50 L165 15 L180 15 L180 40 L198 40 L198 30 L215 30 L215 55 L232 55 L232 35 L250 35 L250 60 L268 60 L268 40 L285 40 L285 65 L302 65 L302 45 L320 45 L320 25 L338 25 L338 50 L355 50 L355 35 L372 35 L372 60 L388 60 L388 45 L400 45 L400 100 Z" fill="url(#ville-insc)" />
        </svg>
      </div>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "16px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <img src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg" alt="GK Sensei" style={{ height: "46px", width: "auto", mixBlendMode: "multiply", marginBottom: "2px" }} />
          <p style={{ fontSize: "9px", color: "#64748B", fontWeight: "800" }}>Le commerce en un clic</p>
        </div>
        <div style={{ textAlign: "right", maxWidth: "130px" }}>
          <p style={{ fontSize: "10px", color: "#0F172A", fontWeight: "900", lineHeight: 1.3 }}>
            Plus proche de vos besoins, partout à Kinshasa.
          </p>
          <div style={{ height: "3px", width: "26px", background: "#EA580C", marginLeft: "auto", marginTop: "3px", borderRadius: "2px" }} />
        </div>
      </div>

      {/* Carte */}
      <div style={{
        backgroundColor: "white",
        borderTopLeftRadius: "40px",
        borderTopRightRadius: "14px",
        borderBottomLeftRadius: "14px",
        borderBottomRightRadius: "40px",
        padding: "20px 18px 20px 18px",
        boxShadow: "4px 4px 0 #F59E0B, 0 6px 24px rgba(15, 23, 42, 0.10)",
        border: "1.5px solid #0F172A",
        maxWidth: "420px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", marginBottom: "4px", letterSpacing: "-0.5px" }}>
          Devenir vendeur
        </h1>
        <p style={{ fontSize: "11px", color: "#334155", fontWeight: "700", marginBottom: "16px", lineHeight: 1.4 }}>
          Créez votre boutique en quelques minutes.
        </p>

        {erreur && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "8px 10px", borderRadius: "8px", marginBottom: "10px", fontSize: "10.5px", fontWeight: "700", border: "1px solid #FECACA" }}>
            {erreur}
          </div>
        )}

        {succes && (
          <div style={{ backgroundColor: "#DCFCE7", color: "#166534", padding: "8px 10px", borderRadius: "8px", marginBottom: "10px", fontSize: "10.5px", fontWeight: "700", border: "1px solid #BBF7D0" }}>
            {succes}
          </div>
        )}

        <form onSubmit={soumettre}>
          {/* Pill "Vos informations" */}
          <p style={{
            fontSize: "10.5px",
            fontWeight: "900",
            color: "white",
            backgroundColor: "#0F172A",
            padding: "4px 10px",
            borderRadius: "20px",
            display: "inline-block",
            marginBottom: "10px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}>
            Vos informations
          </p>

          <div style={champBox}>
            <User size={14} color="#0F172A" strokeWidth={2.5} />
            <div style={{ flex: 1 }}>
              <p style={labelMini}>Nom complet</p>
              <input type="text" value={form.nom} onChange={(e) => changer("nom", e.target.value)} required style={champInput} />
            </div>
          </div>

          <div style={champBox}>
            <Phone size={14} color="#0F172A" strokeWidth={2.5} />
            <div style={{ flex: 1 }}>
              <p style={labelMini}>Numéro de téléphone</p>
              <input type="tel" placeholder="0812345678" value={form.telephone} onChange={(e) => changer("telephone", e.target.value)} required style={champInput} />
            </div>
          </div>

          <div style={champBox}>
            <Mail size={14} color="#0F172A" strokeWidth={2.5} />
            <div style={{ flex: 1 }}>
              <p style={labelMini}>Email (obligatoire)</p>
              <input type="email" placeholder="exemple@gmail.com" value={form.email} onChange={(e) => changer("email", e.target.value)} required style={champInput} />
            </div>
          </div>

          <div style={champBox}>
            <Lock size={14} color="#0F172A" strokeWidth={2.5} />
            <div style={{ flex: 1 }}>
              <p style={labelMini}>Mot de passe (min. 6 caractères)</p>
              <input type={voirMdp ? "text" : "password"} value={form.motDePasse} onChange={(e) => changer("motDePasse", e.target.value)} required minLength={6} style={champInput} />
            </div>
            <button type="button" onClick={() => setVoirMdp(!voirMdp)} style={{ background: "none", border: "none", padding: "2px", cursor: "pointer", display: "flex" }}>
              {voirMdp ? <EyeOff size={14} color="#64748B" strokeWidth={2.5} /> : <Eye size={14} color="#64748B" strokeWidth={2.5} />}
            </button>
          </div>

          {/* Pill "Votre boutique" */}
          <p style={{
            fontSize: "10.5px",
            fontWeight: "900",
            color: "white",
            backgroundColor: "#0F172A",
            padding: "4px 10px",
            borderRadius: "20px",
            display: "inline-block",
            marginTop: "16px",
            marginBottom: "10px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}>
            Votre boutique
          </p>

          <div style={champBox}>
            <Store size={14} color="#0F172A" strokeWidth={2.5} />
            <div style={{ flex: 1 }}>
              <p style={labelMini}>Nom de la boutique</p>
              <input type="text" placeholder="Ex: Mode Kin" value={form.nomBoutique} onChange={(e) => changer("nomBoutique", e.target.value)} required style={champInput} />
            </div>
          </div>

          <div style={{ ...champBox, alignItems: "flex-start", padding: "10px" }}>
            <div style={{ flex: 1 }}>
              <p style={labelMini}>Description (optionnel)</p>
              <textarea placeholder="Décrivez votre boutique" value={form.description} onChange={(e) => changer("description", e.target.value)} style={{ ...champInput, minHeight: "50px", resize: "none", marginTop: "2px" }} />
            </div>
          </div>

          <div style={champBox}>
            <MapPin size={14} color="#0F172A" strokeWidth={2.5} />
            <div style={{ flex: 1 }}>
              <p style={labelMini}>Adresse physique (optionnel)</p>
              <input type="text" placeholder="Ex: Avenue du Commerce, Gombe" value={form.adresse} onChange={(e) => changer("adresse", e.target.value)} style={champInput} />
            </div>
          </div>

          {/* Pill "Mobile Money" */}
          <p style={{
            fontSize: "10.5px",
            fontWeight: "900",
            color: "white",
            backgroundColor: "#EA580C",
            padding: "4px 10px",
            borderRadius: "20px",
            display: "inline-block",
            marginTop: "16px",
            marginBottom: "4px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}>
            Mobile Money
          </p>
          <p style={{ fontSize: "10px", color: "#64748B", fontWeight: "700", marginBottom: "10px" }}>
            Renseignez au moins un numéro.
          </p>

          <div style={{ ...champBox, padding: "6px 10px" }}>
            <div style={logoBox}>
              <img src="https://i.ibb.co/NndcrT1d/m-pesa.jpg" alt="M-Pesa" style={logoImg} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={labelMini}>M-Pesa (Vodacom)</p>
              <input type="tel" placeholder="0812345678" value={form.numMpesa} onChange={(e) => changer("numMpesa", e.target.value)} style={champInput} />
            </div>
          </div>

          <div style={{ ...champBox, padding: "6px 10px" }}>
            <div style={logoBox}>
              <img src="https://i.ibb.co/pvr5LPxN/orange.jpg" alt="Orange" style={logoImg} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={labelMini}>Orange Money</p>
              <input type="tel" placeholder="0891234567" value={form.numOrange} onChange={(e) => changer("numOrange", e.target.value)} style={champInput} />
            </div>
          </div>

          <div style={{ ...champBox, padding: "6px 10px", marginBottom: "16px" }}>
            <div style={logoBox}>
              <img src="https://i.ibb.co/spmBgLvg/airtel.jpg" alt="Airtel" style={logoImg} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={labelMini}>Airtel Money</p>
              <input type="tel" placeholder="0991234567" value={form.numAirtel} onChange={(e) => changer("numAirtel", e.target.value)} style={champInput} />
            </div>
          </div>

          <button type="submit" disabled={chargement} style={{
            width: "100%",
            background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)",
            color: "white",
            padding: "13px",
            borderRadius: "10px",
            border: "none",
            fontWeight: "900",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            opacity: chargement ? 0.6 : 1,
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
          }}>
            {chargement ? "Création..." : <>Créer ma boutique <ArrowRight size={14} strokeWidth={3} /></>}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#334155", fontWeight: "700", marginTop: "14px" }}>
          Déjà inscrit ?{" "}
          <Link href="/vendeur/connexion" style={{ color: "#EA580C", fontWeight: "900", textDecoration: "none" }}>
            Se connecter →
          </Link>
        </p>
      </div>
    </div>
  );
      }
