"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X, Send, Check } from "lucide-react";

const RAISONS = [
  { value: "PRODUIT_DIFFERENT", label: "Produit différent de la description" },
  { value: "PRODUIT_CASSE", label: "Produit cassé ou endommagé" },
  { value: "NON_RECU", label: "Produit non reçu" },
  { value: "AUTRE", label: "Autre problème" },
];

export default function BoutonLitige({ commandeId }: { commandeId: string }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [raison, setRaison] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");

    if (!raison) {
      setErreur("Choisissez une raison");
      return;
    }

    if (description.trim().length < 10) {
      setErreur("Décrivez le problème en au moins 10 caractères");
      return;
    }

    setEnvoi(true);

    try {
      const res = await fetch("/api/client/litige", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commandeId,
          raison,
          description: description.trim(),
          photoUrl: photoUrl.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur lors de l'envoi");
        setEnvoi(false);
        return;
      }

      setSucces(true);
      setTimeout(() => {
        setOuvert(false);
        setSucces(false);
        setRaison("");
        setDescription("");
        setPhotoUrl("");
        router.refresh();
      }, 2000);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setEnvoi(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOuvert(true)}
        style={{
          width: "100%",
          backgroundColor: "white",
          color: "#DC2626",
          border: "1.5px solid #DC2626",
          padding: "10px",
          borderRadius: "20px",
          fontWeight: "900",
          fontSize: "11.5px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontFamily: "inherit",
          marginTop: "10px",
        }}
      >
        <AlertTriangle size={13} strokeWidth={2.8} />
        Signaler un problème
      </button>

      {ouvert && (
        <div
          onClick={() => !envoi && !succes && setOuvert(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "20px 18px",
              width: "100%",
              maxWidth: "440px",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1.5px solid #0F172A",
              boxShadow: "4px 4px 0 #EA580C",
            }}
          >
            {succes ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#DCFCE7",
                  marginBottom: "12px",
                }}>
                  <Check size={28} color="#16A34A" strokeWidth={3} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: "900", color: "#0F172A", marginBottom: "4px" }}>
                  Litige envoyé
                </p>
                <p style={{ fontSize: "11.5px", fontWeight: "700", color: "#57534E" }}>
                  L&apos;administration va traiter votre demande.
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}>
                  <h2 style={{
                    fontSize: "15px",
                    fontWeight: "900",
                    color: "#0F172A",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    <AlertTriangle size={16} color="#DC2626" strokeWidth={2.8} />
                    Signaler un problème
                  </h2>
                  <button
                    onClick={() => setOuvert(false)}
                    disabled={envoi}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: envoi ? "not-allowed" : "pointer",
                      padding: "4px",
                      color: "#57534E",
                    }}
                  >
                    <X size={18} strokeWidth={2.8} />
                  </button>
                </div>

                <form onSubmit={soumettre}>
                  <label style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "900",
                    fontSize: "11px",
                    color: "#0F172A",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                  }}>
                    Raison *
                  </label>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                    {RAISONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRaison(r.value)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "12px",
                          border: raison === r.value ? "2px solid #0F172A" : "1.5px solid #D4C5A0",
                          backgroundColor: raison === r.value ? "#0F172A" : "white",
                          color: raison === r.value ? "white" : "#0F172A",
                          fontWeight: "800",
                          fontSize: "11.5px",
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: "inherit",
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  <label style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "900",
                    fontSize: "11px",
                    color: "#0F172A",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                  }}>
                    Description * (min 10 caractères)
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez précisément le problème..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "14px",
                      border: "1.5px solid #0F172A",
                      fontSize: "12.5px",
                      fontFamily: "inherit",
                      backgroundColor: "white",
                      outline: "none",
                      color: "#0F172A",
                      fontWeight: "600",
                      boxSizing: "border-box",
                      marginBottom: "12px",
                      resize: "vertical",
                    }}
                  />

                  <label style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "900",
                    fontSize: "11px",
                    color: "#0F172A",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                  }}>
                    Lien photo (optionnel)
                  </label>

                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "14px",
                      border: "1.5px solid #0F172A",
                      fontSize: "12.5px",
                      fontFamily: "inherit",
                      backgroundColor: "white",
                      outline: "none",
                      color: "#0F172A",
                      fontWeight: "600",
                      boxSizing: "border-box",
                      marginBottom: "12px",
                    }}
                  />

                  {erreur && (
                    <div style={{
                      backgroundColor: "#FEE2E2",
                      color: "#991B1B",
                      padding: "10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "800",
                      border: "1.5px solid #DC2626",
                      marginBottom: "12px",
                    }}>
                      {erreur}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={envoi}
                    style={{
                      width: "100%",
                      backgroundColor: "#DC2626",
                      color: "white",
                      padding: "14px",
                      borderRadius: "24px",
                      border: "none",
                      fontWeight: "900",
                      fontSize: "13px",
                      cursor: envoi ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontFamily: "inherit",
                      opacity: envoi ? 0.6 : 1,
                    }}
                  >
                    <Send size={14} strokeWidth={3} />
                    {envoi ? "Envoi..." : "Envoyer le signalement"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
                    }
