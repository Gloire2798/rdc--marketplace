"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Produit {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  devise: string;
  stock: number;
  photo1: string | null;
  photo2: string | null;
  photo3: string | null;
}

export default function ModifierProduit() {
  const router = useRouter();
  const params = useParams();
  const produitId = params.id as string;

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");

  const [form, setForm] = useState({
    nom: "",
    description: "",
    prix: "",
    devise: "FC",
    stock: "",
  });

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

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await fetch(`/api/vendeur/produits/${produitId}`);
        if (!res.ok) {
          setErreur("Produit introuvable");
          setChargement(false);
          return;
        }
        const data = await res.json();
        const p: Produit = data.produit;

        setForm({
          nom: p.nom,
          description: p.description || "",
          prix: p.prix.toString(),
          devise: p.devise,
          stock: p.stock.toString(),
        });
        setPhoto1(p.photo1 || "");
        setPhoto2(p.photo2 || "");
        setPhoto3(p.photo3 || "");
        setApercu1(p.photo1 || "");
        setApercu2(p.photo2 || "");
        setApercu3(p.photo3 || "");
        setChargement(false);
      } catch {
        setErreur("Erreur de chargement");
        setChargement(false);
      }
    };
    charger();
  }, [produitId]);

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
      if (numero === 1) setPhoto1(url);
      if (numero === 2) setPhoto2(url);
      if (numero === 3) setPhoto3(url);
    }

    setUploadEnCours({ ...uploadEnCours, [key]: false });
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");

    if (!photo1) {
      setErreur("La photo principale est obligatoire");
      return;
    }

    setEnregistrement(true);

    try {
      const res = await fetch(`/api/vendeur/produits/${produitId}`, {
        method: "PATCH",
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
        setErreur(data.erreur || "Erreur");
        setEnregistrement(false);
        return;
      }

      router.push("/vendeur/produits");
      router.refresh();
    } catch {
      setErreur("Erreur réseau");
      setEnregistrement(false);
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

  const zoneUpload = (
    numero: 1 | 2 | 3,
    apercu: string,
    enCours: boolean,
    obligatoire: boolean
  ) => (
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
            <label
              style={{
                display: "inline-block",
                marginTop: "4px",
                padding: "4px 12px",
                fontSize: "13px",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Changer
              <input
                type="file"
                accept="image/*"
                onChange={(e) => choisirPhoto(e, numero)}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>
      ) : (
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #d1d5db",
            borderRadius: "12px",
            padding: "20px",
            cursor: "pointer",
            backgroundColor: "#f9fafb",
          }}
        >
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

  if (chargement) {
    return (
      <div className="container" style={{ padding: "60px 16px", textAlign: "center" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  const tousUploades = uploadEnCours.p1 || uploadEnCours.p2 || uploadEnCours.p3;

  return (
    <div className="container" style={{ maxWidth: "600px", padding: "40px 16px" }}>
      <a href="/vendeur/produits" style={{ color: "#2563eb", fontSize: "14px" }}>
        ← Retour à mes produits
      </a>

      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px", marginTop: "16px" }}>
        Modifier le produit
      </h1>

      {erreur && (
        <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
          {erreur}
        </div>
      )}

      <form onSubmit={soumettre}>
        <label style={labelStyle}>Photos du produit (max 3)</label>
        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "12px" }}>
          La photo 1 est obligatoire.
        </p>

        {zoneUpload(1, apercu1, uploadEnCours.p1, true)}
        {zoneUpload(2, apercu2, uploadEnCours.p2, false)}
        {zoneUpload(3, apercu3, uploadEnCours.p3, false)}

        <label style={labelStyle}>Nom du produit *</label>
        <input
          type="text"
          style={champStyle}
          value={form.nom}
          onChange={(e) => changer("nom", e.target.value)}
          required
        />

        <label style={labelStyle}>Description (optionnel)</label>
        <textarea
          style={{ ...champStyle, minHeight: "80px" }}
          value={form.description}
          onChange={(e) => changer("description", e.target.value)}
        />

        <label style={labelStyle}>Prix *</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="number"
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
          style={champStyle}
          value={form.stock}
          onChange={(e) => changer("stock", e.target.value)}
          required
          min="0"
        />

        <button
          type="submit"
          disabled={enregistrement || tousUploades}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "16px", opacity: (enregistrement || tousUploades) ? 0.6 : 1 }}
        >
          {enregistrement ? "Enregistrement..." : tousUploades ? "Envoi des photos..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
          }
