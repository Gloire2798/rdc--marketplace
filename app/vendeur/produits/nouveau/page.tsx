"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Upload, Check, AlertCircle, RefreshCw, Tag, Palette, Image as ImageIcon } from "lucide-react";

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

export default function NouveauProduit() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [prixPromo, setPrixPromo] = useState("");
  const [devise, setDevise] = useState("FC");
  const [stockSimple, setStockSimple] = useState("");

  const [photo1, setPhoto1] = useState("");
  const [photo2, setPhoto2] = useState("");
  const [photo3, setPhoto3] = useState("");
  const [uploadEnCours, setUploadEnCours] = useState(false);

  const [avecVariantes, setAvecVariantes] = useState(false);
  const [attributs, setAttributs] = useState<Attribut[]>([]);
  const [combinaisons, setCombinaisons] = useState<Combinaison[]>([]);

  const uploadPhoto = async (file: File, index: 1 | 2 | 3) => {
    setUploadEnCours(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "gk_sensei");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/i4cve5t1/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      if (data.secure_url) {
        if (index === 1) setPhoto1(data.secure_url);
        if (index === 2) setPhoto2(data.secure_url);
        if (index === 3) setPhoto3(data.secure_url);
      }
    } catch (err) {
      console.error(err);
    }
    setUploadEnCours(false);
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
    setSucces("");

    if (!nom || !prix) {
      setErreur("Nom et prix obligatoires");
      return;
    }

    if (!photo1) {
      setErreur("La photo principale est obligatoire");
      return;
    }

    if (avecVariantes) {
      const attrsValides = attributs.filter(
        (a) => a.nom.trim() && a.valeurs.length > 0
      );

      if (attrsValides.length === 0) {
        setErreur("Ajoutez au moins un attribut avec des valeurs");
        return;
      }

      if (combinaisons.length === 0) {
        setErreur("Générez les combinaisons");
        return;
      }
    } else {
      if (!stockSimple || parseInt(stockSimple) < 0) {
        setErreur("Le stock est obligatoire");
        return;
      }
    }

    setChargement(true);

    try {
      const body: Record<string, unknown> = {
        nom,
        description,
        prix: parseFloat(prix),
        prixPromo: prixPromo ? parseFloat(prixPromo) : null,
        devise,
        photo1,
        photo2,
        photo3,
      };

      if (avecVariantes) {
        body.variantes = combinaisons.map((c) => ({
          attributs: c.valeurs,
          stock: c.stock,
        }));
      } else {
        body.stock = parseInt(stockSimple);
      }

      const res = await fetch("/api/vendeur/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur");
        setChargement(false);
        return;
      }

      setSucces("Produit créé !");
      setTimeout(() => {
        router.push("/vendeur/produits");
      }, 1500);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setChargement(false);
    }
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

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1.5px solid #0F172A",
    fontSize: "13px",
    fontFamily: "inherit",
    backgroundColor: "white",
    outline: "none",
    color: "#0F172A",
    fontWeight: "700" as const,
    boxSizing: "border-box" as const,
  };

  const btnSmallStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    backgroundColor: "#0F172A",
    color: "white",
    border: "none",
    fontSize: "11.5px",
    fontWeight: "900" as const,
    cursor: "pointer",
    flexShrink: 0,
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
  };  return (
    <div style={{ padding: "16px 14px 40px", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
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

      <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A", marginBottom: "4px", letterSpacing: "-0.5px" }}>
        Ajouter un produit
      </h1>
      <p style={{ fontSize: "12px", color: "#57534E", fontWeight: "700", marginBottom: "20px" }}>
        Remplissez les informations ci-dessous.
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
          display: "flex",
          alignItems: "center",
          gap: "6px",
          border: "1.5px solid #DC2626",
        }}>
          <AlertCircle size={14} strokeWidth={2.8} />
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
          <Check size={14} strokeWidth={2.8} />
          {succes}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[1, 2, 3].map((i) => {
              const photo = i === 1 ? photo1 : i === 2 ? photo2 : photo3;
              return (
                <label key={i} style={{
                  aspectRatio: "1",
                  borderRadius: "14px",
                  border: photo ? "1.5px solid #0F172A" : "2px dashed #D4C5A0",
                  backgroundColor: "#F5EAD2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  position: "relative",
                }}>
                  {photo ? (
                    <>
                      <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px", boxSizing: "border-box", backgroundColor: "white" }} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (i === 1) setPhoto1("");
                          if (i === 2) setPhoto2("");
                          if (i === 3) setPhoto3("");
                        }}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "#DC2626",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={13} strokeWidth={3} />
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", color: "#57534E" }}>
                      <Upload size={20} strokeWidth={2.5} style={{ marginBottom: "4px" }} />
                      <p style={{ fontSize: "9.5px", fontWeight: "900" }}>Photo {i}</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadPhoto(file, i as 1 | 2 | 3);
                    }}
                    style={{ display: "none" }}
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* INFOS DE BASE */}
        <div style={carteStyle}>
          <h2 style={titreSection}>
            <span style={traitOrange} />
            <Tag size={14} strokeWidth={2.8} color="#EA580C" />
            Informations
          </h2>

          <label style={labelStyle}>Nom du produit *</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: Veste en wax"
            style={{ ...inputStyle, marginBottom: "12px" }}
            required
          />

          <label style={labelStyle}>Description (optionnel)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre produit..."
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical", marginBottom: "12px" }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "8px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>Prix *</label>
              <input
                type="number"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                placeholder="0"
                min="0"
                step="any"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Devise</label>
              <select
                value={devise}
                onChange={(e) => setDevise(e.target.value)}
                style={inputStyle}
              >
                <option value="FC">FC</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <label style={labelStyle}>Prix promotionnel (optionnel)</label>
          <input
            type="number"
            value={prixPromo}
            onChange={(e) => setPrixPromo(e.target.value)}
            placeholder="Laissez vide si pas de promo"
            min="0"
            step="any"
            style={inputStyle}
          />
        </div>

        {/* CHOIX : AVEC OU SANS VARIANTES */}
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
                transition: "all 0.15s ease",
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
                transition: "all 0.15s ease",
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
                value={stockSimple}
                onChange={(e) => setStockSimple(e.target.value)}
                placeholder="0"
                min="0"
                style={inputStyle}
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
                      style={{ ...inputStyle, flex: 1 }}
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
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button type="button" onClick={() => ajouterValeur(attr.id)} style={btnSmallStyle}>
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
          disabled={chargement || uploadEnCours}
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
            opacity: chargement || uploadEnCours ? 0.6 : 1,
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
            letterSpacing: "-0.2px",
            fontFamily: "inherit",
          }}
        >
          {chargement ? "Création..." : uploadEnCours ? "Upload en cours..." : "Créer le produit"}
        </button>
      </form>
    </div>
  );
                }
