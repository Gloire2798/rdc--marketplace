"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BoutonSupprimer from "./BoutonSupprimer";
import { ArrowLeft, Image as ImageIcon, Tag, X, Upload, Clock } from "lucide-react";

interface Produit {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  prixPromo: number | null;
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
    prixPromo: "",
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
          prixPromo: p.prixPromo ? p.prixPromo.toString() : "",
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
          prixPromo: form.prixPromo || null,
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
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1.5px solid #0F172A",
    fontSize: "13.5px",
    fontFamily: "inherit",
    backgroundColor: "white",
    outline: "none",
    color: "#0F172A",
    fontWeight: "700" as const,
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: "11px",
    fontWeight: "900" as const,
    color: "#0F172A",
    marginBottom: "6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
  };

  const titreSection = {
    fontSize: "12px",
    fontWeight: "900" as const,
    color: "#0F172A",
    marginBottom: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
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
    obligatoire: boolean
  ) => (
    <div style={{ marginBottom: "12px" }}>
      {apercu ? (
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{
            position: "relative",
            borderRadius: "14px",
            border: "1.5px solid #0F172A",
            backgroundColor: "white",
            overflow: "hidden",
            padding: "8px",
            boxSizing: "border-box",
          }}>
            <img
              src={apercu}
              alt={`Photo ${numero}`}
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "8px",
                objectFit: "contain",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
          {enCours && (
            <p style={{
              color: "#57534E",
              fontSize: "11px",
              marginTop: "8px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}>
              <Clock size={12} strokeWidth={2.8} />
              Envoi en cours...
            </p>
          )}
          {!enCours && (
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "8px",
                padding: "8px 14px",
                fontSize: "11.5px",
                backgroundColor: "#0F172A",
                color: "white",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "900",
              }}
            >
              <Upload size={12} strokeWidth={2.8} />
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
            border: "2px dashed #D4C5A0",
            borderRadius: "14px",
            padding: "24px 20px",
            cursor: "pointer",
            backgroundColor: "#F5EAD2",
          }}
        >
          <Upload size={26} strokeWidth={2.2} color="#57534E" style={{ marginBottom: "6px" }} />
          <span style={{ fontWeight: "900", fontSize: "12px", color: "#0F172A" }}>
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
      <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
        <p style={{ color: "#57534E", fontWeight: "700" }}>Chargement...</p>
      </div>
    );
  }

  const tousUploades = uploadEnCours.p1 || uploadEnCours.p2 || uploadEnCours.p3;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 14px 40px", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
      <Link
        href="/vendeur/produits"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#0F172A",
          fontSize: "11.5px",
          fontWeight: "800",
          textDecoration: "none",
          marginBottom: "14px",
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.8} />
        Retour à mes produits
      </Link>

      <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A", marginBottom: "6px", marginTop: "6px", letterSpacing: "-0.5px" }}>
        Modifier le produit
      </h1>
      <p style={{ fontSize: "12px", color: "#57534E", fontWeight: "700", marginBottom: "18px" }}>
        Modifiez les informations ci-dessous.
      </p>

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

      <form onSubmit={soumettre}>
        {/* PHOTOS */}
        <div style={carteStyle}>
          <h2 style={titreSection}>
            <span style={traitOrange} />
            <ImageIcon size={14} strokeWidth={2.8} color="#EA580C" />
            Photos du produit (max 3)
          </h2>
          <p style={{ fontSize: "11px", color: "#57534E", fontWeight: "700", marginBottom: "12px" }}>
            La photo 1 est obligatoire.
          </p>

          {zoneUpload(1, apercu1, uploadEnCours.p1, true)}
          {zoneUpload(2, apercu2, uploadEnCours.p2, false)}
          {zoneUpload(3, apercu3, uploadEnCours.p3, false)}
        </div>

        {/* INFOS */}
        <div style={carteStyle}>
          <h2 style={titreSection}>
            <span style={traitOrange} />
            <Tag size={14} strokeWidth={2.8} color="#EA580C" />
            Informations
          </h2>

          <label style={labelStyle}>Nom du produit *</label>
          <input
            type="text"
            style={{ ...champStyle, marginBottom: "12px" }}
            value={form.nom}
            onChange={(e) => changer("nom", e.target.value)}
            required
          />

          <label style={labelStyle}>Description (optionnel)</label>
          <textarea
            style={{ ...champStyle, minHeight: "80px", resize: "vertical", marginBottom: "12px" }}
            value={form.description}
            onChange={(e) => changer("description", e.target.value)}
          />

          <label style={labelStyle}>Prix normal *</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="number"
              style={{ ...champStyle, flex: 2 }}
              value={form.prix}
              onChange={(e) => changer("prix", e.target.value)}
              required
              min="0"
              step="any"
            />
            <select
              style={{ ...champStyle, flex: 1 }}
              value={form.devise}
              onChange={(e) => changer("devise", e.target.value)}
            >
              <option value="FC">FC</option>
              <option value="USD">$</option>
            </select>
          </div>

          <label style={labelStyle}>Prix promotionnel (optionnel)</label>
          <p style={{ fontSize: "11px", color: "#57534E", fontWeight: "600", marginBottom: "8px" }}>
            Laissez vide si pas de promotion. Doit être inférieur au prix normal.
          </p>
          <input
            type="number"
            placeholder="Ex: 20000"
            style={{ ...champStyle, marginBottom: "12px" }}
            value={form.prixPromo}
            onChange={(e) => changer("prixPromo", e.target.value)}
            min="0"
            step="any"
          />

          <label style={labelStyle}>Stock disponible *</label>
          <input
            type="number"
            style={champStyle}
            value={form.stock}
            onChange={(e) => changer("stock", e.target.value)}
            required
            min="0"
          />
        </div>

        <button
          type="submit"
          disabled={enregistrement || tousUploades}
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
            opacity: enregistrement || tousUploades ? 0.6 : 1,
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
            letterSpacing: "-0.2px",
            fontFamily: "inherit",
          }}
        >
          {enregistrement ? "Enregistrement..." : tousUploades ? "Envoi des photos..." : "Enregistrer les modifications"}
        </button>
      </form>

      <BoutonSupprimer produitId={produitId} nomProduit={form.nom} />
    </div>
  );
          }
