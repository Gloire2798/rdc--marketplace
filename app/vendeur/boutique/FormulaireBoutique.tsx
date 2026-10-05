"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2, Check, Image as ImageIcon, Tag } from "lucide-react";

interface Vendeur {
  id: string;
  nomBoutique: string;
  description: string | null;
  adresse: string | null;
  photoCouverture: string | null;
  photo2: string | null;
  photo3: string | null;
  telephone: string;
}

export default function FormulaireBoutique({ vendeur }: { vendeur: Vendeur }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  const [form, setForm] = useState({
    nomBoutique: vendeur.nomBoutique,
    description: vendeur.description || "",
    adresse: vendeur.adresse || "",
  });

  const [photoCouverture, setPhotoCouverture] = useState(vendeur.photoCouverture || "");
  const [photo2, setPhoto2] = useState(vendeur.photo2 || "");
  const [photo3, setPhoto3] = useState(vendeur.photo3 || "");

  const [apercu1, setApercu1] = useState(vendeur.photoCouverture || "");
  const [apercu2, setApercu2] = useState(vendeur.photo2 || "");
  const [apercu3, setApercu3] = useState(vendeur.photo3 || "");

  const [uploadEnCours, setUploadEnCours] = useState({ p1: false, p2: false, p3: false });

  const changer = (champ: string, valeur: string) => {
    setForm({ ...form, [champ]: valeur });
  };

  const uploaderPhoto = async (fichier: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("fichier", fichier);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) return null;
      return data.url;
    } catch {
      return null;
    }
  };

  const choisirPhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    numero: 1 | 2 | 3
  ) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (numero === 1) setApercu1(url);
      if (numero === 2) setApercu2(url);
      if (numero === 3) setApercu3(url);
    };
    reader.readAsDataURL(fichier);

    const key = numero === 1 ? "p1" : numero === 2 ? "p2" : "p3";
    setUploadEnCours({ ...uploadEnCours, [key]: true });

    const url = await uploaderPhoto(fichier);

    if (url) {
      if (numero === 1) setPhotoCouverture(url);
      if (numero === 2) setPhoto2(url);
      if (numero === 3) setPhoto3(url);
    }

    setUploadEnCours({ ...uploadEnCours, [key]: false });
  };

  const supprimerPhoto = (numero: 1 | 2 | 3) => {
    if (numero === 1) {
      setPhotoCouverture("");
      setApercu1("");
    }
    if (numero === 2) {
      setPhoto2("");
      setApercu2("");
    }
    if (numero === 3) {
      setPhoto3("");
      setApercu3("");
    }
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setChargement(true);

    try {
      const res = await fetch("/api/vendeur/boutique", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photoCouverture: photoCouverture || null,
          photo2: photo2 || null,
          photo3: photo3 || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur");
        setChargement(false);
        return;
      }

      setSucces("Boutique mise à jour !");
      setChargement(false);
      router.refresh();

      setTimeout(() => setSucces(""), 3000);
    } catch {
      setErreur("Erreur réseau");
      setChargement(false);
    }
  };

  const champStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1.5px solid #0F172A",
    fontSize: "13px",
    marginBottom: "12px",
    fontFamily: "inherit",
    backgroundColor: "white",
    outline: "none",
    color: "#0F172A",
    fontWeight: "700" as const,
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block" as const,
    marginBottom: "6px",
    fontWeight: "900" as const,
    fontSize: "11px",
    color: "#0F172A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
  };

  const titreSection = {
    fontSize: "12px",
    fontWeight: "900" as const,
    color: "#0F172A",
    marginBottom: "10px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  };

  const traitOrange = {
    display: "inline-block",
    width: "3px",
    height: "14px",
    backgroundColor: "#EA580C",
    borderRadius: "2px",
  };

  const carteStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "16px",
    marginBottom: "14px",
    border: "1px solid #D4C5A0",
    boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
  };

  const zoneUpload = (
    numero: 1 | 2 | 3,
    apercu: string,
    enCours: boolean,
    titre: string
  ) => (
    <div style={{ marginBottom: "10px" }}>
      {apercu ? (
        <div style={{ position: "relative" }}>
          <img
            src={apercu}
            alt={titre}
            style={{
              width: "100%",
              height: "160px",
              objectFit: "contain",
              borderRadius: "14px",
              display: "block",
              backgroundColor: "#F5EAD2",
              border: "1.5px solid #0F172A",
              padding: "4px",
              boxSizing: "border-box",
            }}
          />
          {enCours && (
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "11.5px",
              fontWeight: "900",
              borderRadius: "14px",
            }}>
              Envoi en cours...
            </div>
          )}
          {!enCours && (
            <button
              type="button"
              onClick={() => supprimerPhoto(numero)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                backgroundColor: "#DC2626",
                color: "white",
                border: "none",
                borderRadius: "20px",
                padding: "6px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10.5px",
                fontWeight: "900",
                fontFamily: "inherit",
              }}
            >
              <Trash2 size={12} strokeWidth={3} />
              Retirer
            </button>
          )}
        </div>
      ) : (
        <label style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed #D4C5A0",
          borderRadius: "14px",
          padding: "24px 20px",
          cursor: "pointer",
          backgroundColor: "#F5EAD2",
        }}>
          <Camera size={26} color="#57534E" strokeWidth={2.2} />
          <span style={{
            fontWeight: "900",
            fontSize: "12px",
            marginTop: "8px",
            color: "#0F172A",
          }}>
            {titre}
          </span>
          <span style={{ fontSize: "10px", color: "#57534E", marginTop: "3px", fontWeight: "700" }}>
            JPG ou PNG, max 5 MB
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => choisirPhoto(e, numero)}
            style={{ display: "none" }}
          />
        </label>
      )}
    </div>
  );

  const tousUploades = uploadEnCours.p1 || uploadEnCours.p2 || uploadEnCours.p3;

  return (
    <form onSubmit={soumettre}>
      {erreur && (
        <div style={{
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          padding: "12px",
          borderRadius: "14px",
          marginBottom: "14px",
          fontSize: "11.5px",
          fontWeight: "800",
          border: "1.5px solid #DC2626",
        }}>
          {erreur}
        </div>
      )}

      {succes && (
        <div style={{
          backgroundColor: "#DCFCE7",
          color: "#166534",
          padding: "12px",
          borderRadius: "14px",
          marginBottom: "14px",
          fontSize: "11.5px",
          fontWeight: "800",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          border: "1.5px solid #16A34A",
        }}>
          <Check size={14} strokeWidth={3} />
          {succes}
        </div>
      )}

      {/* PHOTOS */}
      <div style={carteStyle}>
        <h2 style={titreSection}>
          <span style={traitOrange} />
          <ImageIcon size={14} strokeWidth={2.8} color="#EA580C" />
          Photos de la boutique
        </h2>

        <p style={{
          fontSize: "11px",
          color: "#57534E",
          marginBottom: "12px",
          fontWeight: "700",
          lineHeight: 1.5,
        }}>
          La photo de couverture est la plus importante. Elle apparaîtra en premier.
        </p>

        {zoneUpload(1, apercu1, uploadEnCours.p1, "Photo de couverture")}
        {zoneUpload(2, apercu2, uploadEnCours.p2, "Photo 2 (optionnelle)")}
        {zoneUpload(3, apercu3, uploadEnCours.p3, "Photo 3 (optionnelle)")}
      </div>

      {/* INFOS */}
      <div style={carteStyle}>
        <h2 style={titreSection}>
          <span style={traitOrange} />
          <Tag size={14} strokeWidth={2.8} color="#EA580C" />
          Informations
        </h2>

        <label style={labelStyle}>Nom de la boutique *</label>
        <input
          type="text"
          style={champStyle}
          value={form.nomBoutique}
          onChange={(e) => changer("nomBoutique", e.target.value)}
          required
        />

        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...champStyle, minHeight: "80px", resize: "vertical" }}
          value={form.description}
          onChange={(e) => changer("description", e.target.value)}
          placeholder="Décrivez votre boutique en quelques mots"
        />

        <label style={labelStyle}>Adresse physique</label>
        <input
          type="text"
          style={champStyle}
          value={form.adresse}
          onChange={(e) => changer("adresse", e.target.value)}
          placeholder="Ex: Avenue du Commerce, Gombe"
        />
      </div>

      <button
        type="submit"
        disabled={chargement || tousUploades}
        style={{
          width: "100%",
          backgroundColor: "#0F172A",
          color: "white",
          padding: "16px",
          borderRadius: "26px",
          border: "none",
          fontWeight: "900",
          fontSize: "14px",
          cursor: "pointer",
          opacity: (chargement || tousUploades) ? 0.6 : 1,
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
          letterSpacing: "-0.2px",
          fontFamily: "inherit",
        }}
      >
        {chargement ? "Enregistrement..." : tousUploades ? "Envoi des photos..." : "Enregistrer"}
      </button>
    </form>
  );
    }
