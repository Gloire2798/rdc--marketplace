"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2, Plus, Clock, AlertCircle } from "lucide-react";

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

  return (
    <div>
      <div style={{
        backgroundColor: atteintLaLimite ? "#FEE2E2" : "#DBEAFE",
        color: atteintLaLimite ? "#991B1B" : "#1E40AF",
        padding: "10px 12px",
        borderRadius: "10px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        fontWeight: "700",
      }}>
        <AlertCircle size={16} strokeWidth={2.5} />
        {stories.length} / {limite} stories actives
        {atteintLaLimite && " — Limite atteinte"}
      </div>

      {erreur && (
        <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "12px", fontWeight: "600" }}>
          {erreur}
        </div>
      )}

      {!atteintLaLimite && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "20px",
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}>
          <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} strokeWidth={2.5} />
            Nouvelle story
          </h2>

          {apercu ? (
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <img
                src={apercu}
                alt="Aperçu"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "contain",
                  backgroundColor: "#F8FAFC",
                  borderRadius: "10px",
                  display: "block",
                }}
              />
              {uploadEnCours && (
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
            </div>
          ) : (
            <label style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #CBD5E1",
              borderRadius: "10px",
              padding: "24px",
              cursor: "pointer",
              backgroundColor: "#F8FAFC",
              marginBottom: "10px",
            }}>
              <Camera size={28} color="#64748b" strokeWidth={2} />
              <span style={{ fontWeight: "700", fontSize: "12px", marginTop: "6px", color: "#334155" }}>
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
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              fontSize: "13px",
              marginBottom: "10px",
              fontFamily: "inherit",
            }}
          />

          <button
            type="button"
            onClick={publier}
            disabled={envoi || uploadEnCours || !photoUrl}
            style={{
              width: "100%",
              backgroundColor: "#1D4ED8",
              color: "white",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              opacity: (envoi || uploadEnCours || !photoUrl) ? 0.6 : 1,
            }}
          >
            {envoi ? "Publication..." : uploadEnCours ? "Envoi photo..." : "Publier la story"}
          </button>
        </div>
      )}

      <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "10px" }}>
        Stories actives ({stories.length})
      </h2>

      {stories.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px 20px",
          textAlign: "center",
          border: "1px solid #F1F5F9",
        }}>
          <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
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
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid #F1F5F9",
              position: "relative",
            }}>
              <img
                src={story.photo}
                alt="Story"
                style={{
                  width: "100%",
                  height: "140px",
                  objectFit: "contain",
                  backgroundColor: "#F8FAFC",
                  display: "block",
                }}
              />

              <div style={{
                position: "absolute",
                top: "6px",
                left: "6px",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                color: "white",
                fontSize: "9.5px",
                fontWeight: "800",
                padding: "3px 7px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}>
                <Clock size={10} strokeWidth={2.5} />
                {story.heuresRestantes}h
              </div>

              <button
                onClick={() => supprimer(story.id)}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  backgroundColor: "rgba(220, 38, 38, 0.9)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={12} strokeWidth={2.5} />
              </button>

              {story.legende && (
                <div style={{ padding: "6px 8px" }}>
                  <p style={{
                    fontSize: "10px",
                    color: "#334155",
                    fontWeight: "600",
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
