"use client";

import { useState } from "react";
import {
  BarChart3,
  Copy,
  Check,
  MessageCircle,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Megaphone,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

const SITE_URL = "https://rdc-marketplace.vercel.app";
const ANALYTICS_URL =
  "https://analytics.google.com/analytics/web/#/a410458151p557070698/reports/intelligenthome";

interface TextePret {
  id: string;
  titre: string;
  texte: string;
}

const textesPrets: TextePret[] = [
  {
    id: "presentation",
    titre: "Présentation courte",
    texte: `🛍️ Découvrez GK Sensei — le complexe commercial en ligne de Kinshasa !

Toutes vos boutiques préférées réunies en un seul endroit. Commandez, payez par Mobile Money et retirez en boutique.

👉 ${SITE_URL}`,
  },
  {
    id: "vendeurs",
    titre: "Pour recruter des vendeurs",
    texte: `🏪 Vous vendez des produits à Kinshasa ?

Rejoignez GK Sensei et ouvrez votre boutique en ligne en quelques minutes. Seulement 25 000 FC d'inscription + 15 000 FC/mois. Zéro commission sur vos ventes !

👉 Inscrivez-vous : ${SITE_URL}/vendeur/connexion`,
  },
  {
    id: "clients",
    titre: "Pour attirer des clients",
    texte: `✨ Marre de chercher vos boutiques préférées ?

Sur GK Sensei, tout est réuni : mode, électronique, accessoires... Commandez en 2 clics et payez avec M-Pesa, Orange Money ou Airtel Money.

👉 ${SITE_URL}`,
  },
  {
    id: "whatsapp_statut",
    titre: "Statut WhatsApp",
    texte: `🛒 GK Sensei — Le commerce en un clic

Commandez en ligne, payez par Mobile Money, retirez en boutique.

${SITE_URL}`,
  },
];

export default function MarketingPage() {
  const [copie, setCopie] = useState<string | null>(null);

  const copier = (texte: string, cle: string) => {
    navigator.clipboard.writeText(texte);
    setCopie(cle);
    setTimeout(() => setCopie(null), 2000);
  };

  const partagerWhatsApp = (texte: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, "_blank");
  };

  const partagerFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`,
      "_blank"
    );
  };

  const partagerTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        "Découvrez GK Sensei — Le complexe commercial en ligne de Kinshasa !"
      )}&url=${encodeURIComponent(SITE_URL)}`,
      "_blank"
    );
  };

  const titreSection = {
    fontSize: "11px",
    fontWeight: "900" as const,
    color: "#0F172A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.6px",
    marginBottom: "12px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
  };

  const traitOrange = {
    display: "inline-block",
    width: "3px",
    height: "13px",
    backgroundColor: "#EA580C",
    borderRadius: "2px",
  };

  const carteStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "16px",
    border: "1px solid #D4C5A0",
    marginBottom: "14px",
    boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5EAD2",
        padding: "16px 12px 90px",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "18px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "3px",
            letterSpacing: "-0.4px",
          }}
        >
          Marketing
        </h1>
        <p
          style={{
            fontSize: "11.5px",
            color: "#57534E",
            fontWeight: "700",
          }}
        >
          Outils pour faire connaître GK Sensei
        </p>
      </div>

      {/* Bouton Google Analytics */}
      <a
        href={ANALYTICS_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "#0F172A",
          color: "white",
          padding: "16px",
          borderRadius: "20px",
          textDecoration: "none",
          marginBottom: "14px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.20)",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            backgroundColor: "rgba(234, 88, 12, 0.20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BarChart3 size={22} color="#EA580C" strokeWidth={2.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: "13.5px",
            fontWeight: "900",
            letterSpacing: "-0.2px",
          }}>
            Voir mes statistiques
          </p>
          <p style={{
            fontSize: "10.5px",
            opacity: 0.85,
            fontWeight: "700",
          }}>
            Visiteurs, sources, comportement
          </p>
        </div>
        <ExternalLink size={16} strokeWidth={2.8} />
      </a>

      {/* Lien du site */}
      <div style={carteStyle}>
        <p style={titreSection}>
          <span style={traitOrange} />
          <LinkIcon size={13} strokeWidth={2.8} color="#EA580C" />
          Lien de votre site
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#F5EAD2",
            border: "1px solid #D4C5A0",
            borderRadius: "14px",
            padding: "10px 12px",
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: "11.5px",
              fontWeight: "800",
              color: "#0F172A",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {SITE_URL}
          </span>
          <button
            onClick={() => copier(SITE_URL, "site")}
            style={{
              padding: "8px 12px",
              fontSize: "10.5px",
              backgroundColor: copie === "site" ? "#16A34A" : "#0F172A",
              color: "white",
              border: "none",
              borderRadius: "14px",
              cursor: "pointer",
              fontWeight: "900",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "inherit",
            }}
          >
            {copie === "site" ? (
              <>
                <Check size={12} strokeWidth={3} />
                Copié
              </>
            ) : (
              <>
                <Copy size={12} strokeWidth={2.8} />
                Copier
              </>
            )}
          </button>
        </div>
      </div>

      {/* Boutons de partage */}
      <div style={carteStyle}>
        <p style={titreSection}>
          <span style={traitOrange} />
          <MessageCircle size={13} strokeWidth={2.8} color="#EA580C" />
          Partage rapide
        </p>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() =>
              partagerWhatsApp(
                `Découvrez GK Sensei — Le complexe commercial en ligne de Kinshasa ! ${SITE_URL}`
              )
            }
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "14px 6px",
              backgroundColor: "#25D366",
              color: "white",
              border: "none",
              borderRadius: "16px",
              cursor: "pointer",
              fontWeight: "900",
              fontFamily: "inherit",
            }}
          >
            <MessageCircle size={20} strokeWidth={2.8} />
            <span style={{ fontSize: "10.5px" }}>WhatsApp</span>
          </button>

          <button
            onClick={partagerFacebook}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "14px 6px",
              backgroundColor: "#1877F2",
              color: "white",
              border: "none",
              borderRadius: "16px",
              cursor: "pointer",
              fontWeight: "900",
              fontFamily: "inherit",
            }}
          >
            <Facebook size={20} strokeWidth={2.8} />
            <span style={{ fontSize: "10.5px" }}>Facebook</span>
          </button>

          <button
            onClick={partagerTwitter}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "14px 6px",
              backgroundColor: "#0F172A",
              color: "white",
              border: "none",
              borderRadius: "16px",
              cursor: "pointer",
              fontWeight: "900",
              fontFamily: "inherit",
            }}
          >
            <Twitter size={20} strokeWidth={2.8} />
            <span style={{ fontSize: "10.5px" }}>X / Twitter</span>
          </button>
        </div>
      </div>

      {/* Textes prêts */}
      <div style={carteStyle}>
        <p style={titreSection}>
          <span style={traitOrange} />
          <Megaphone size={13} strokeWidth={2.8} color="#EA580C" />
          Textes prêts à publier
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {textesPrets.map((t) => (
            <div
              key={t.id}
              style={{
                backgroundColor: "#F5EAD2",
                border: "1px solid #D4C5A0",
                borderRadius: "14px",
                padding: "12px",
              }}
            >
              <p
                style={{
                  fontSize: "11.5px",
                  fontWeight: "900",
                  color: "#0F172A",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}
              >
                {t.titre}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#57534E",
                  lineHeight: 1.55,
                  fontWeight: "700",
                  whiteSpace: "pre-line",
                  marginBottom: "10px",
                }}
              >
                {t.texte}
              </p>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => copier(t.texte, t.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    padding: "9px",
                    backgroundColor: copie === t.id ? "#16A34A" : "#0F172A",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontWeight: "900",
                    fontSize: "10.5px",
                    fontFamily: "inherit",
                  }}
                >
                  {copie === t.id ? (
                    <>
                      <Check size={12} strokeWidth={3} />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy size={12} strokeWidth={2.8} />
                      Copier
                    </>
                  )}
                </button>

                <button
                  onClick={() => partagerWhatsApp(t.texte)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    padding: "9px",
                    backgroundColor: "#25D366",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontWeight: "900",
                    fontSize: "10.5px",
                    fontFamily: "inherit",
                  }}
                >
                  <MessageCircle size={12} strokeWidth={2.8} />
                  Partager
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conseils */}
      <div
        style={{
          backgroundColor: "white",
          border: "1.5px solid #0F172A",
          borderRadius: "20px",
          padding: "16px",
          boxShadow: "4px 4px 0 #EA580C",
        }}
      >
        <p style={{
          fontSize: "11px",
          fontWeight: "900",
          color: "#0F172A",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={traitOrange} />
          <Lightbulb size={13} strokeWidth={2.8} color="#EA580C" />
          Conseils pour être connu
        </p>

        <ul
          style={{
            fontSize: "11.5px",
            color: "#0F172A",
            fontWeight: "700",
            lineHeight: 1.7,
            paddingLeft: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <li>Partage le lien dans tes statuts WhatsApp</li>
          <li>Ajoute le lien dans ta bio Facebook / Instagram / TikTok</li>
          <li>Demande à tes vendeurs de partager leur boutique</li>
          <li>Offre un petit cadeau aux 10 premiers clients</li>
          <li>Poste les nouveautés de tes boutiques chaque semaine</li>
          <li>Contacte des influenceurs de Kinshasa pour un partenariat</li>
        </ul>
      </div>
    </div>
  );
}
