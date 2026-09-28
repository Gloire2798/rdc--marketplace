"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NouveauProduit() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const [photo1, setPhoto1] = useState("");
  const [photo2, setPhoto2] = useState("");
  const [photo3, setPhoto3] = useState("");

  const [apercu1, setApercu1] = useState("");
  const [apercu2, setApercu2] = useState("");
  const [apercu3, setApercu3] = useState("");

  const [uploadEnCours, setUploadEnCours] = useState({
    p1: false,
    p2: false,
    p3: false,
  });

  const [form, setForm] = useState({
    nom: "",
    description: "",
    prix: "",
    devise: "FC",
    stock: "",
  });

  const changer = (champ: string, valeur: string) => {
    setForm({ ...form, [champ]: valeur });
  };

  const uploaderPhoto = async (
    fichier: File,
    numero: 1 | 2 | 3
  ): Promise<string | null> => {
    const formData = new FormData();
    formData.append("fichier", fichier);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur lors de l'upload");
        return null;
      }
      return data.url;
    } catch {
      setErreur("Impossible d'uploader la photo");
      return null;
    }
  };

  const choisirPhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    numero: 1 | 2 | 3
  ) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    // Aperçu local
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (numero === 1) setApercu1(dataUrl);
      if (numero === 2) setApercu2(dataUrl);
      if (numero === 3) setApercu3(dataUrl);
    };
    reader.readAsDataURL(fichier);

    // Upload
    const key = numero === 1 ? "p1" : numero === 2 ? "p2" : "p3";
    setUploadEnCours({ ...uploadEnCours, [key]: true });

    const url = await uploaderPhoto(fichier, numero);

    if (url) {
      if (numero === 1) setPhoto1(url);
      if (numero === 2) setPhoto2(url);
      if (numero === 3) setPhoto3(url);
    } else {
      if (numero === 1) setApercu1("");
      if (numero === 2) setApercu2("");
      if (numero === 3) setApercu3("");
    }

    setUploadEnCours({ ...uploadEnCours, [key]: false });
  };

  const supprimerPhoto = (numero: 1 | 2 | 3) => {
    if (numero === 1) {
      setPhoto1("");
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

    if (!photo1) {
      setErreur("La photo principale est obligatoire");
      return;
    }

    setChargement(true);

    try {
      const res = await fetch("/api/vendeur/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          prix: parseFloat(form.prix),
          stock: parseInt(form.stock),
          photo1,
          photo2: photo2 || null,
          photo3: photo3 || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur lors de la création");
        setChargement(false);
        return;
      }

      router.push("/vendeur/produits");
      router.refresh();
    } catch {
      setErreur("Impossible de créer le produit");
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

  const zoneUpload = (numero: 1 | 2 | 3, apercu: string, enCours: boolean, obligatoire: boolean) => (
    <div style={{ marginBottom: "12px" }}>
      {apercu ? (
        <div style={{ position: "relative", textAlign: "center" }}>
          <img
            src={apercu}
            alt={`Photo ${numero}`}
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              borderRadius: "12px",
              objectFit: "contain",
              backgroundColor: "#f3f4f6",
            }}
          />
          {enCours && (
            <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
              ⏳ Envoi...
            </p>
          )}
          {!enCours && (
            <button
              type="button"
              onClick={() => supprimerPhoto(numero)}
              style={{
                marginTop: "4px",
                padding: "4px 12px",
                fontSize: "13px",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Supprimer
            </button>
          )}
        </div>
      ) : (
        <label style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed #d1d5db",
          borderRadius: "12px",
          padding: "20px",
          cursor: "pointer",
          backgroundColor: "#f9fafb",
        }}>
          <span style={{ fontSize: "28px", marginBottom: "4px" }}>📸</span>
          <span style={{ fontWeight: "600", fontSize: "13px" }}>
            Photo {numero} {obligatoire ? "*" : "(optionnelle)"}
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
    <div className="container" style={{ maxWidth: "600px", padding: "40px 16px" }}>
      <a href="/vendeur/produits" style={{ color: "#2563eb", fontSize: "14px" }}>
        ← Retour à mes produits
      </a>

      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px", marginTop: "16px" }}>
        Ajouter un produit
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Publiez un nouvel article dans votre boutique.
      </p>

      {erreur && (
        <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
          {erreur}
        </div>
      )}

      <form onSubmit={soumettre}>
        <label style={labelStyle}>Photos du produit (max 3)</label>
        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "12px" }}>
          La photo 1 est obligatoire. Les photos 2 et 3 sont optionnelles.
        </p>

        {zoneUpload(1, apercu1, uploadEnCours.p1, true)}
        {zoneUpload(2, apercu2, uploadEnCours.p2, false)}
        {zoneUpload(3, apercu3, uploadEnCours.p3, false)}

        <label style={labelStyle}>Nom du produit *</label>
        <input
          type="text"
          placeholder="Ex: Robe fleurie"
          style={champStyle}
          value={form.nom}
          onChange={(e) => changer("nom", e.target.value)}
          required
        />

        <label style={labelStyle}>Description (optionnel)</label>
        <textarea
          style={{ ...champStyle, minHeight: "80px" }}
          placeholder="Décrivez votre produit"
          value={form.description}
          onChange={(e) => changer("description", e.target.value)}
        />

        <label style={labelStyle}>Prix *</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="number"
            placeholder="Ex: 25000"
            style={{ ...champStyle, marginBottom: 0, flex: 2 }}
            value={form.prix}
            onChange={(e) => changer("prix", e.target.value)}
            required
            min="0"
            step="any"
          />
          <select
            style={{ ...champStyle, marginBottom: 0, flex: 1 }}
            value={form.devise}
            onChange={(e) => changer("devise", e.target.value)}
          >
            <option value="FC">FC</option>
            <option value="USD">$</option>
          </select>
        </div>

        <label style={labelStyle}>Stock disponible *</label>
        <input
          type="number"
          placeholder="Ex: 10"
          style={champStyle}
          value={form.stock}
          onChange={(e) => changer("stock", e.target.value)}
          required
          min="0"
        />

        <button
          type="submit"
          disabled={chargement || tousUploades}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "16px", opacity: (chargement || tousUploades) ? 0.6 : 1 }}
        >
          {chargement ? "Publication..." : tousUploades ? "Envoi des photos..." : "Publier le produit"}
        </button>
      </form>
    </div>
  );
}
