"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NouveauProduit() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [uploadPhoto, setUploadPhoto] = useState(false);
  const [erreur, setErreur] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [apercu, setApercu] = useState("");

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

  const choisirPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setUploadPhoto(true);
    setErreur("");

    const reader = new FileReader();
    reader.onload = (ev) => setApercu(ev.target?.result as string);
    reader.readAsDataURL(fichier);

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
        setApercu("");
        setUploadPhoto(false);
        return;
      }

      setPhotoUrl(data.url);
      setUploadPhoto(false);
    } catch {
      setErreur("Impossible d'uploader la photo");
      setApercu("");
      setUploadPhoto(false);
    }
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const res = await fetch("/api/vendeur/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          prix: parseFloat(form.prix),
          stock: parseInt(form.stock),
          photo: photoUrl || null,
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
        <label style={labelStyle}>Photo du produit</label>

        {apercu ? (
          <div style={{ marginBottom: "16px", textAlign: "center" }}>
            <img
              src={apercu}
              alt="Aperçu"
              style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "12px", objectFit: "cover" }}
            />
            {uploadPhoto && (
              <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "8px" }}>
                ⏳ Envoi de la photo en cours...
              </p>
            )}
            {!uploadPhoto && photoUrl && (
              <p style={{ color: "#16a34a", fontSize: "13px", marginTop: "8px" }}>
                ✅ Photo envoyée
              </p>
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
            padding: "40px 20px",
            marginBottom: "16px",
            cursor: "pointer",
            backgroundColor: "#f9fafb",
          }}>
            <span style={{ fontSize: "40px", marginBottom: "8px" }}>📸</span>
            <span style={{ fontWeight: "600", marginBottom: "4px" }}>Choisir une photo</span>
            <span style={{ color: "#6b7280", fontSize: "13px" }}>JPG ou PNG, max 5 MB</span>
            <input
              type="file"
              accept="image/*"
              onChange={choisirPhoto}
              style={{ display: "none" }}
            />
          </label>
        )}

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
          disabled={chargement || uploadPhoto}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "16px", opacity: (chargement || uploadPhoto) ? 0.6 : 1 }}
        >
          {chargement ? "Publication..." : uploadPhoto ? "Envoi de la photo..." : "Publier le produit"}
        </button>
      </form>
    </div>
  );
}
