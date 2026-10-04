"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Upload, Check, AlertCircle } from "lucide-react";

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
        `https://api.cloudinary.com/v1_1/i4cve5t1/image/upload`
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
    fontSize: "11.5px",
    fontWeight: "800" as const,
    color: "#334155",
    marginBottom: "5px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.3px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #E5E0D5",
    fontSize: "13px",
    fontFamily: "inherit",
    backgroundColor: "#FEFCF8",
    outline: "none",
    color: "#0F172A",
    fontWeight: "600" as const,
    boxSizing: "border-box" as const,
  };

  const btnSmallStyle = {
    padding: "6px 10px",
    borderRadius: "8px",
    backgroundColor: "#1D4ED8",
    color: "white",
    border: "none",
    fontSize: "11px",
    fontWeight: "800" as const,
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "16px 14px 40px", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
      <Link
        href="/vendeur/produits"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#1D4ED8",
          fontSize: "11.5px",
          fontWeight: "700",
          textDecoration: "none",
          marginBottom: "14px",
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.5} />
        Retour à mes produits
      </Link>

      <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", marginBottom: "4px" }}>
        Ajouter un produit
      </h1>
      <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "20px" }}>
        Remplissez les informations ci-dessous.
      </p>

      {erreur && (
        <div style={{
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          padding: "10px 12px",
          borderRadius: "10px",
          marginBottom: "14px",
          fontSize: "11.5px",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <AlertCircle size={14} />
          {erreur}
        </div>
      )}

      {succes && (
        <div style={{
          backgroundColor: "#DCFCE7",
          color: "#166534",
          padding: "10px 12px",
          borderRadius: "10px",
          marginBottom: "14px",
          fontSize: "11.5px",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <Check size={14} />
          {succes}
        </div>
      )}

      <form onSubmit={soumettre}>
        {/* PHOTOS */}
        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px", marginBottom: "14px", border: "1px solid #E8DFC8" }}>
          <p style={{ fontSize: "12.5px", fontWeight: "800", color: "#0F172A", marginBottom: "10px" }}>
            📷 Photos du produit (max 3)
          </p>
          <p style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "500", marginBottom: "12px" }}>
            La photo 1 est obligatoire.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[1, 2, 3].map((i) => {
              const photo = i === 1 ? photo1 : i === 2 ? photo2 : photo3;
              return (
                <label key={i} style={{
                  aspectRatio: "1",
                  borderRadius: "10px",
                  border: photo ? "1px solid #E5E0D5" : "2px dashed #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  position: "relative",
                }}>
                  {photo ? (
                    <>
                      <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          fontSize: "11px",
                          fontWeight: "900",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", color: "#94a3b8" }}>
                      <Upload size={20} style={{ marginBottom: "4px" }} />
                      <p style={{ fontSize: "9.5px", fontWeight: "700" }}>Photo {i}</p>
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
        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px", marginBottom: "14px", border: "1px solid #E8DFC8" }}>
          <p style={{ fontSize: "12.5px", fontWeight: "800", color: "#0F172A", marginBottom: "12px" }}>
            📝 Informations
          </p>

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
            style={{ ...inputStyle, minHeight: "70px", resize: "vertical", marginBottom: "12px" }}
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
        </div>        {/* CHOIX : AVEC OU SANS VARIANTES */}
        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px", marginBottom: "14px", border: "1px solid #E8DFC8" }}>
          <p style={{ fontSize: "12.5px", fontWeight: "800", color: "#0F172A", marginBottom: "12px" }}>
            🎨 Ce produit a-t-il des variantes ?
          </p>

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
                padding: "10px",
                borderRadius: "10px",
                border: !avecVariantes ? "2px solid #1D4ED8" : "1px solid #E5E0D5",
                backgroundColor: !avecVariantes ? "#EFF6FF" : "white",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                color: !avecVariantes ? "#1D4ED8" : "#64748b",
              }}
            >
              Non (stock simple)
            </button>
            <button
              type="button"
              onClick={() => setAvecVariantes(true)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: avecVariantes ? "2px solid #1D4ED8" : "1px solid #E5E0D5",
                backgroundColor: avecVariantes ? "#EFF6FF" : "white",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                color: avecVariantes ? "#1D4ED8" : "#64748b",
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
                    backgroundColor: "#F8FAFC",
                    borderRadius: "12px",
                    padding: "12px",
                    marginBottom: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
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
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        backgroundColor: "#FEE2E2",
                        color: "#991B1B",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
                    {attr.valeurs.map((v) => (
                      <span
                        key={v}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          borderRadius: "20px",
                          backgroundColor: "#EFF6FF",
                          color: "#1D4ED8",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => supprimerValeur(attr.id, v)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#1D4ED8",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            padding: 0,
                          }}
                        >
                          <X size={10} />
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
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  color: "#1D4ED8",
                  border: "1.5px dashed #1D4ED8",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginBottom: "12px",
                }}
              >
                <Plus size={14} strokeWidth={2.5} />
                Ajouter un attribut
              </button>

              {attributs.length > 0 &&
                attributs.some((a) => a.nom.trim() && a.valeurs.length > 0) && (
                  <button
                    type="button"
                    onClick={genererCombinaisons}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      backgroundColor: "#1D4ED8",
                      color: "white",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                      marginBottom: "12px",
                    }}
                  >
                    🔄 Générer les combinaisons
                  </button>
                )}

              {combinaisons.length > 0 && (
                <div>
                  <p style={{ fontSize: "11.5px", fontWeight: "800", color: "#0F172A", marginBottom: "8px" }}>
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
                          padding: "8px 10px",
                          borderRadius: "10px",
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        <span style={{ flex: 1, fontSize: "11px", fontWeight: "700", color: "#334155" }}>
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
                            borderRadius: "8px",
                            border: "1px solid #E5E0D5",
                            fontSize: "12px",
                            fontWeight: "700",
                            textAlign: "center",
                            backgroundColor: "white",
                            outline: "none",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "10.5px", color: "#64748b", marginTop: "8px", textAlign: "right" }}>
                    Stock total : <strong style={{ color: "#15803d" }}>{combinaisons.reduce((s, c) => s + c.stock, 0)}</strong>
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
            backgroundColor: "#1D4ED8",
            color: "white",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            fontWeight: "800",
            fontSize: "14px",
            cursor: "pointer",
            opacity: chargement || uploadEnCours ? 0.6 : 1,
          }}
        >
          {chargement ? "Création..." : uploadEnCours ? "Upload en cours..." : "Créer le produit"}
        </button>
      </form>
    </div>
  );
                    }
