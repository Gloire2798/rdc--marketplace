"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2, Check, Image as ImageIcon } from "lucide-react";

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
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    fontSize: "13px",
    marginBottom: "14px",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "700" as const,
    fontSize: "12px",
    color: "#334155",
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
              objectFit: "cover",
              borderRadius: "10px",
              display: "block",
            }}
          />
          {enCours && (
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: "700",
              borderRadius: "10px",
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
                backgroundColor: "rgba(220, 38, 38, 0.9)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "6px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              <Trash2 size={12} />
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
          border: "2px dashed #CBD5E1",
          borderRadius: "10px",
          padding: "20px",
          cursor: "pointer",
          backgroundColor: "#F8FAFC",
        }}>
          <Camera size={24} color="#64748b" strokeWidth={2} />
          <span style={{ fontWeight: "700", fontSize: "12px", marginTop: "6px", color: "#334155" }}>
            {titre}
          </span>
          <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
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
        <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "12px", fontWeight: "600" }}>
          {erreur}
        </div>
      )}

      {succes && (
        <div style={{ backgroundColor: "#DCFCE7", color: "#166534", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
          <Check size={14} strokeWidth={3} />
          {succes}
        </div>
      )}

      <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
        <ImageIcon size={16} strokeWidth={2.5} />
        Photos de la boutique
      </h2>

      <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px", fontWeight: "500" }}>
        La photo de couverture est la plus importante. Elle apparaîtra en premier.
      </p>

      {zoneUpload(1, apercu1, uploadEnCours.p1, "Photo de couverture")}
      {zoneUpload(2, apercu2, uploadEnCours.p2, "Photo 2 (optionnelle)")}
      {zoneUpload(3, apercu3, uploadEnCours.p3, "Photo 3 (optionnelle)")}

      <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginTop: "20px", marginBottom: "10px" }}>
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
        style={{ ...champStyle, minHeight: "70px" }}
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

      <button
        type="submit"
        disabled={chargement || tousUploades}
        style={{
          width: "100%",
          backgroundColor: "#1D4ED8",
          color: "white",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          fontWeight: "800",
          fontSize: "13px",
          cursor: "pointer",
          marginTop: "8px",
          opacity: (chargement || tousUploades) ? 0.6 : 1,
        }}
      >
        {chargement ? "Enregistrement..." : tousUploades ? "Envoi des photos..." : "Enregistrer"}
      </button>
    </form>
  );
    }
