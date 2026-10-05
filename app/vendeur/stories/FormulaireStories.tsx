"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2, Plus, Clock, AlertCircle, X } from "lucide-react";

interface Story {
  id: string;
  photo: string;
  legende: string | null;
  expireAt: string;
  heuresRestantes: number;
}

export default function FormulaireStories({
  storiesExistantes,
  limite,
}: {
  storiesExistantes: Story[];
  limite: number;
}) {
  const router = useRouter();
  const [stories, setStories] = useState(storiesExistantes);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [apercu, setApercu] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [legende, setLegende] = useState("");

  const atteintLaLimite = stories.length >= limite;

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

  const choisirPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setErreur("");

    const reader = new FileReader();
    reader.onload = (ev) => setApercu(ev.target?.result as string);
    reader.readAsDataURL(fichier);

    setUploadEnCours(true);
    const url = await uploaderPhoto(fichier);

    if (url) {
      setPhotoUrl(url);
    } else {
      setErreur("Erreur lors de l'upload");
      setApercu("");
    }
    setUploadEnCours(false);
  };

  const publier = async () => {
    if (!photoUrl) {
      setErreur("Choisissez d'abord une photo");
      return;
    }

    if (atteintLaLimite) {
      setErreur(`Limite de ${limite} stories atteinte. Supprimez-en une.`);
      return;
    }

    setEnvoi(true);
    setErreur("");

    try {
      const res = await fetch("/api/vendeur/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: photoUrl, legende }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur");
        setEnvoi(false);
        return;
      }

      setStories([data.story, ...stories]);
      setApercu("");
      setPhotoUrl("");
      setLegende("");
      setEnvoi(false);
      router.refresh();
    } catch {
      setErreur("Erreur réseau");
      setEnvoi(false);
    }
  };

  const supprimer = async (id: string) => {
    if (!confirm("Supprimer cette story ?")) return;

    try {
      const res = await fetch(`/api/vendeur/stories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStories(stories.filter((s) => s.id !== id));
        router.refresh();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    }
  };

  const carteStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "14px",
    marginBottom: "14px",
    border: "1px solid #D4C5A0",
    boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
  };

  return (
    <div>
      {/* COMPTEUR */}
      <div style={{
        backgroundColor: atteintLaLimite ? "#FEE2E2" : "#DCFCE7",
        color: atteintLaLimite ? "#991B1B" : "#15803D",
        padding: "10px 12px",
        borderRadius: "14px",
        marginBottom: "14px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "11.5px",
        fontWeight: "900",
        border: atteintLaLimite ? "1.5px solid #DC2626" : "1.5px solid #16A34A",
      }}>
        <AlertCircle size={14} strokeWidth={2.8} />
        {stories.length} / {limite} stories actives
        {atteintLaLimite && " — Limite atteinte"}
      </div>

      {erreur && (
        <div style={{
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          padding: "10px 12px",
          borderRadius: "14px",
          marginBottom: "14px",
          fontSize: "11.5px",
          fontWeight: "800",
          border: "1.5px solid #DC2626",
        }}>
          {erreur}
        </div>
      )}

      {/* FORMULAIRE */}
      {!atteintLaLimite && (
        <div style={carteStyle}>
          <h2 style={{
            fontSize: "12px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}>
            <Plus size={14} strokeWidth={3} color="#EA580C" />
            Nouvelle story
          </h2>

          {apercu ? (
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <img
                src={apercu}
                alt="Aperçu"
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "contain",
                  backgroundColor: "#F5EAD2",
                  borderRadius: "14px",
                  display: "block",
                  border: "1.5px solid #0F172A",
                  padding: "4px",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setApercu("");
                  setPhotoUrl("");
                }}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "26px",
                  height: "26px",
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
              {uploadEnCours && (
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
            </div>
          ) : (
            <label style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #D4C5A0",
              borderRadius: "14px",
              padding: "26px 20px",
              cursor: "pointer",
              backgroundColor: "#F5EAD2",
              marginBottom: "10px",
            }}>
              <Camera size={26} color="#57534E" strokeWidth={2.2} />
              <span style={{ fontWeight: "900", fontSize: "12px", marginTop: "8px", color: "#0F172A" }}>
                Choisir une photo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={choisirPhoto}
                style={{ display: "none" }}
              />
            </label>
          )}

          <input
            type="text"
            placeholder="Légende (optionnel)"
            value={legende}
            onChange={(e) => setLegende(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1.5px solid #0F172A",
              fontSize: "13px",
              marginBottom: "10px",
              fontFamily: "inherit",
              backgroundColor: "white",
              outline: "none",
              color: "#0F172A",
              fontWeight: "700",
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            onClick={publier}
            disabled={envoi || uploadEnCours || !photoUrl}
            style={{
              width: "100%",
              backgroundColor: "#0F172A",
              color: "white",
              padding: "14px",
              borderRadius: "24px",
              border: "none",
              fontWeight: "900",
              fontSize: "13px",
              cursor: "pointer",
              opacity: (envoi || uploadEnCours || !photoUrl) ? 0.5 : 1,
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.20)",
              fontFamily: "inherit",
            }}
          >
            {envoi ? "Publication..." : uploadEnCours ? "Envoi photo..." : "Publier la story"}
          </button>
        </div>
      )}

      {/* LISTE STORIES */}
      <h2 style={{
        fontSize: "12px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "10px",
        marginTop: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.6px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}>
        <span style={{ display: "inline-block", width: "3px", height: "12px", backgroundColor: "#EA580C", borderRadius: "2px" }} />
        Stories actives ({stories.length})
      </h2>

      {stories.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "30px 20px",
          textAlign: "center",
          border: "1px solid #D4C5A0",
        }}>
          <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700" }}>
            Aucune story active. Créez-en une !
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}>
          {stories.map((story) => (
            <div key={story.id} style={{
              backgroundColor: "white",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1.5px solid #0F172A",
              position: "relative",
              boxShadow: "2px 2px 0 #EA580C",
            }}>
              <img
                src={story.photo}
                alt="Story"
                style={{
                  width: "100%",
                  height: "140px",
                  objectFit: "contain",
                  backgroundColor: "#F5EAD2",
                  display: "block",
                  padding: "4px",
                  boxSizing: "border-box",
                }}
              />

              <div style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                backgroundColor: "#0F172A",
                color: "white",
                fontSize: "9.5px",
                fontWeight: "900",
                padding: "3px 8px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}>
                <Clock size={10} strokeWidth={3} />
                {story.heuresRestantes}h
              </div>

              <button
                onClick={() => supprimer(story.id)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  backgroundColor: "#DC2626",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "26px",
                  height: "26px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={12} strokeWidth={3} />
              </button>

              {story.legende && (
                <div style={{ padding: "8px 10px" }}>
                  <p style={{
                    fontSize: "10.5px",
                    color: "#0F172A",
                    fontWeight: "800",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {story.legende}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
      }
