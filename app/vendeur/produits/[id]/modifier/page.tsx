"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BoutonSupprimer from "./BoutonSupprimer";
import {
  ArrowLeft,
  Image as ImageIcon,
  Tag,
  Palette,
  X,
  Upload,
  Clock,
  Plus,
  RefreshCw,
} from "lucide-react";

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

interface Attribut {
  id: string;
  nom: string;
  valeurs: string[];
  nouvelleValeur: string;
}

interface Combinaison {
  key: string;
  valeurs: Record<string, string>;
  stock: number;
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

  const [avecVariantes, setAvecVariantes] = useState(false);
  const [attributs, setAttributs] = useState<Attribut[]>([]);
  const [combinaisons, setCombinaisons] = useState<Combinaison[]>([]);

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

        if (data.produit.variantes && data.produit.variantes.length > 0) {
          setAvecVariantes(true);

          const mapAttrs = new Map<string, Set<string>>();
          const combos: Combinaison[] = [];

          data.produit.variantes.forEach((v: any) => {
            const attributsVar = JSON.parse(v.attributs) as Record<string, string>;
            Object.entries(attributsVar).forEach(([nom, valeur]) => {
              if (!mapAttrs.has(nom)) mapAttrs.set(nom, new Set());
              mapAttrs.get(nom)!.add(valeur);
            });

            combos.push({
              key: JSON.stringify(attributsVar),
              valeurs: attributsVar,
              stock: v.stock,
            });
          });

          const attrsList: Attribut[] = Array.from(mapAttrs.entries()).map(
            ([nom, valeurs], idx) => ({
              id: `attr-${idx}-${Date.now()}`,
              nom,
              valeurs: Array.from(valeurs),
              nouvelleValeur: "",
            })
          );

          setAttributs(attrsList);
          setCombinaisons(combos);
        }

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

  const ajouterAttribut = () => {
    setAttributs([
      ...attributs,
      {
        id: Date.now().toString(),
        nom: "",
        valeurs: [],
        nouvelleValeur: "",
      },
    ]);
  };

  const supprimerAttribut = (id: string) => {
    setAttributs(attributs.filter((a) => a.id !== id));
    setCombinaisons([]);
  };

  const modifierNomAttribut = (id: string, nom: string) => {
    setAttributs(attributs.map((a) => (a.id === id ? { ...a, nom } : a)));
  };

  const ajouterValeur = (id: string) => {
    const attr = attributs.find((a) => a.id === id);
    if (!attr || !attr.nouvelleValeur.trim()) return;

    const valeur = attr.nouvelleValeur.trim();
    if (attr.valeurs.includes(valeur)) return;

    setAttributs(
      attributs.map((a) =>
        a.id === id
          ? { ...a, valeurs: [...a.valeurs, valeur], nouvelleValeur: "" }
          : a
      )
    );
  };

  const supprimerValeur = (id: string, valeur: string) => {
    setAttributs(
      attributs.map((a) =>
        a.id === id ? { ...a, valeurs: a.valeurs.filter((v) => v !== valeur) } : a
      )
    );
    setCombinaisons([]);
  };

  const genererCombinaisons = () => {
    const attrsValides = attributs.filter(
      (a) => a.nom.trim() && a.valeurs.length > 0
    );

    if (attrsValides.length === 0) {
      setCombinaisons([]);
      return;
    }

    let resultats: Record<string, string>[] = [{}];

    attrsValides.forEach((attr) => {
      const nouveaux: Record<string, string>[] = [];
      resultats.forEach((combo) => {
        attr.valeurs.forEach((valeur) => {
          nouveaux.push({ ...combo, [attr.nom]: valeur });
        });
      });
      resultats = nouveaux;
    });

    const nouvelles: Combinaison[] = resultats.map((valeurs) => ({
      key: JSON.stringify(valeurs),
      valeurs,
      stock: 0,
    }));

    setCombinaisons((anciennes) =>
      nouvelles.map((n) => {
        const existe = anciennes.find((a) => a.key === n.key);
        return existe ? { ...n, stock: existe.stock } : n;
      })
    );
  };

  const modifierStock = (key: string, stock: number) => {
    setCombinaisons(
      combinaisons.map((c) =>
        c.key === key ? { ...c, stock: Math.max(0, stock) } : c
      )
    );
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
      const body: Record<string, unknown> = {
        ...form,
        prix: parseFloat(form.prix),
        prixPromo: form.prixPromo || null,
        photo1,
        photo2: photo2 || null,
        photo3: photo3 || null,
      };

      if (avecVariantes) {
        const attrsValides = attributs.filter(
          (a) => a.nom.trim() && a.valeurs.length > 0
        );

        if (attrsValides.length === 0) {
          setErreur("Ajoutez au moins un attribut avec des valeurs");
          setEnregistrement(false);
          return;
        }

        if (combinaisons.length === 0) {
          setErreur("Générez les combinaisons");
          setEnregistrement(false);
          return;
        }

        body.variantes = combinaisons.map((c) => ({
          attributs: c.valeurs,
          stock: c.stock,
        }));
        body.stock = combinaisons.reduce((s, c) => s + c.stock, 0);
      } else {
        body.stock = parseInt(form.stock);
        body.variantes = [];
      }

      const res = await fetch(`/api/vendeur/produits/${produitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
  };const champStyle = {
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
      </div>        {/* VARIANTES */}
        <div style={carteStyle}>
          <h2 style={titreSection}>
            <span style={traitOrange} />
            <Palette size={14} strokeWidth={2.8} color="#EA580C" />
            Variantes du produit
          </h2>

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => {
                setAvecVariantes(false);
                setAttributs([]);
                setCombinaisons([]);
              }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "14px",
                border: !avecVariantes ? "2px solid #0F172A" : "1.5px solid #D4C5A0",
                backgroundColor: !avecVariantes ? "#0F172A" : "white",
                color: !avecVariantes ? "white" : "#0F172A",
                fontWeight: "900",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Non (stock simple)
            </button>
            <button
              type="button"
              onClick={() => setAvecVariantes(true)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "14px",
                border: avecVariantes ? "2px solid #0F172A" : "1.5px solid #D4C5A0",
                backgroundColor: avecVariantes ? "#0F172A" : "white",
                color: avecVariantes ? "white" : "#0F172A",
                fontWeight: "900",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Oui (taille, couleur...)
            </button>
          </div>

          {!avecVariantes && (
            <>
              <label style={labelStyle}>Stock disponible *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => changer("stock", e.target.value)}
                placeholder="0"
                min="0"
                required
                style={champStyle}
              />
            </>
          )}

          {avecVariantes && (
            <>
              {attributs.map((attr, idx) => (
                <div
                  key={attr.id}
                  style={{
                    backgroundColor: "#F5EAD2",
                    borderRadius: "16px",
                    padding: "14px",
                    marginBottom: "10px",
                    border: "1px solid #D4C5A0",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={attr.nom}
                      onChange={(e) => modifierNomAttribut(attr.id, e.target.value)}
                      placeholder={`Attribut ${idx + 1} (ex: Taille)`}
                      style={{ ...champStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => supprimerAttribut(attr.id)}
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "12px",
                        backgroundColor: "#FEE2E2",
                        color: "#DC2626",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                    {attr.valeurs.map((v) => (
                      <span
                        key={v}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          backgroundColor: "#0F172A",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: "900",
                        }}
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => supprimerValeur(attr.id, v)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            padding: 0,
                          }}
                        >
                          <X size={11} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={attr.nouvelleValeur}
                      onChange={(e) =>
                        setAttributs(
                          attributs.map((a) =>
                            a.id === attr.id ? { ...a, nouvelleValeur: e.target.value } : a
                          )
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          ajouterValeur(attr.id);
                        }
                      }}
                      placeholder="Ajouter une valeur (ex: M)"
                      style={{ ...champStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => ajouterValeur(attr.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#0F172A",
                        color: "white",
                        border: "none",
                        fontSize: "11.5px",
                        fontWeight: "900",
                        cursor: "pointer",
                        flexShrink: 0,
                        fontFamily: "inherit",
                      }}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={ajouterAttribut}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "14px",
                  backgroundColor: "white",
                  color: "#0F172A",
                  border: "2px dashed #0F172A",
                  fontSize: "12px",
                  fontWeight: "900",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginBottom: "12px",
                  fontFamily: "inherit",
                }}
              >
                <Plus size={14} strokeWidth={3} />
                Ajouter un attribut
              </button>

              {attributs.length > 0 &&
                attributs.some((a) => a.nom.trim() && a.valeurs.length > 0) && (
                  <button
                    type="button"
                    onClick={genererCombinaisons}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "14px",
                      backgroundColor: "#EA580C",
                      color: "white",
                      border: "none",
                      fontSize: "12.5px",
                      fontWeight: "900",
                      cursor: "pointer",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)",
                      fontFamily: "inherit",
                    }}
                  >
                    <RefreshCw size={14} strokeWidth={3} />
                    Générer les combinaisons
                  </button>
                )}

              {combinaisons.length > 0 && (
                <div>
                  <p style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    color: "#0F172A",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Stock par combinaison ({combinaisons.length})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {combinaisons.map((c) => (
                      <div
                        key={c.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 12px",
                          borderRadius: "12px",
                          backgroundColor: "#F5EAD2",
                          border: "1px solid #D4C5A0",
                        }}
                      >
                        <span style={{ flex: 1, fontSize: "11px", fontWeight: "800", color: "#0F172A" }}>
                          {Object.entries(c.valeurs)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={c.stock}
                          onChange={(e) => modifierStock(c.key, parseInt(e.target.value) || 0)}
                          style={{
                            width: "70px",
                            padding: "6px 8px",
                            borderRadius: "10px",
                            border: "1.5px solid #0F172A",
                            fontSize: "12px",
                            fontWeight: "900",
                            textAlign: "center",
                            backgroundColor: "white",
                            outline: "none",
                            color: "#0F172A",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: "#57534E", marginTop: "10px", textAlign: "right", fontWeight: "800" }}>
                    Stock total : <strong style={{ color: "#EA580C" }}>{combinaisons.reduce((s, c) => s + c.stock, 0)}</strong>
                  </p>
                </div>
              )}
            </>
          )}
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
