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
    titre: "📢 Présentation courte",
    texte: `🛍️ Découvrez GK Sensei — le complexe commercial en ligne de Kinshasa !

Toutes vos boutiques préférées réunies en un seul endroit. Commandez, payez par Mobile Money et retirez en boutique.

👉 ${SITE_URL}`,
  },
  {
    id: "vendeurs",
    titre: "🏪 Pour recruter des vendeurs",
    texte: `🏪 Vous vendez des produits à Kinshasa ?

Rejoignez GK Sensei et ouvrez votre boutique en ligne en quelques minutes. Seulement 25 000 FC d'inscription + 15 000 FC/mois. Zéro commission sur vos ventes !

👉 Inscrivez-vous : ${SITE_URL}/vendeur/connexion`,
  },
  {
    id: "clients",
    titre: "👥 Pour attirer des clients",
    texte: `✨ Marre de chercher vos boutiques préférées ?

Sur GK Sensei, tout est réuni : mode, électronique, accessoires... Commandez en 2 clics et payez avec M-Pesa, Orange Money ou Airtel Money.

👉 ${SITE_URL}`,
  },
  {
    id: "whatsapp_statut",
    titre: "📱 Statut WhatsApp",
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F1F5F9",
        padding: "16px 12px 90px",
      }}
    >
      {/* En-tête */}
      <div style={{ marginBottom: "16px" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#0F172A",
          }}
        >
          Marketing
        </h1>
        <p
          style={{
            fontSize: "11px",
            color: "#64748B",
            fontWeight: "600",
            marginTop: "3px",
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
          gap: "10px",
          backgroundColor: "#1D4ED8",
          color: "white",
          padding: "14px",
          borderRadius: "12px",
          textDecoration: "none",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BarChart3 size={20} strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "13px", fontWeight: "800" }}>
            📊 Voir mes statistiques
          </p>
          <p style={{ fontSize: "10.5px", opacity: 0.9, fontWeight: "600" }}>
            Visiteurs, sources, comportement
          </p>
        </div>
        <ExternalLink size={16} strokeWidth={2.5} />
      </a>

      {/* Lien du site */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "14px",
          border: "1px solid #E2E8F0",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
          }}
        >
          <LinkIcon size={14} color="#1D4ED8" strokeWidth={2.5} />
          <p
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "#0F172A",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            Lien de votre site
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: "11.5px",
              fontWeight: "600",
              color: "#334155",
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
              padding: "6px 10px",
              fontSize: "10.5px",
              backgroundColor: copie === "site" ? "#16a34a" : "#E2E8F0",
              color: copie === "site" ? "white" : "#334155",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            {copie === "site" ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Boutons de partage */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "14px",
          border: "1px solid #E2E8F0",
          marginBottom: "16px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: "800",
            color: "#0F172A",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
            marginBottom: "10px",
          }}
        >
          📱 Partage rapide
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
              padding: "12px 6px",
              backgroundColor: "#25D366",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            <MessageCircle size={18} strokeWidth={2.5} />
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
              padding: "12px 6px",
              backgroundColor: "#1877F2",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            <Facebook size={18} strokeWidth={2.5} />
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
              padding: "12px 6px",
              backgroundColor: "#000000",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            <Twitter size={18} strokeWidth={2.5} />
            <span style={{ fontSize: "10.5px" }}>X / Twitter</span>
          </button>
        </div>
      </div>

      {/* Textes prêts */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "14px",
          border: "1px solid #E2E8F0",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "12px",
          }}
        >
          <Megaphone size={14} color="#1D4ED8" strokeWidth={2.5} />
          <p
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "#0F172A",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            Textes prêts à publier
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {textesPrets.map((t) => (
            <div
              key={t.id}
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "10px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#0F172A",
                  marginBottom: "6px",
                }}
              >
                {t.titre}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#475569",
                  lineHeight: 1.5,
                  fontWeight: "500",
                  whiteSpace: "pre-line",
                  marginBottom: "8px",
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
                    padding: "7px",
                    backgroundColor: copie === t.id ? "#16a34a" : "white",
                    color: copie === t.id ? "white" : "#1D4ED8",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "10.5px",
                  }}
                >
                  {copie === t.id ? <Check size={12} /> : <Copy size={12} />}
                  {copie === t.id ? "Copié" : "Copier"}
                </button>

                <button
                  onClick={() => partagerWhatsApp(t.texte)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    padding: "7px",
                    backgroundColor: "#25D366",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "10.5px",
                  }}
                >
                  <MessageCircle size={12} strokeWidth={2.5} />
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
          backgroundColor: "#FEF3C7",
          border: "1px solid #FDE68A",
          borderRadius: "12px",
          padding: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
          }}
        >
          <Lightbulb size={14} color="#B45309" strokeWidth={2.5} />
          <p
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "#78350F",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            Conseils pour être connu
          </p>
        </div>

        <ul
          style={{
            fontSize: "11px",
            color: "#78350F",
            fontWeight: "500",
            lineHeight: 1.6,
            paddingLeft: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <li>📱 Partage le lien dans tes statuts WhatsApp</li>
          <li>👥 Ajoute le lien dans ta bio Facebook / Instagram / TikTok</li>
          <li>🏪 Demande à tes vendeurs de partager leur boutique</li>
          <li>🎁 Offre un petit cadeau aux 10 premiers clients</li>
          <li>📸 Poste les nouveautés de tes boutiques chaque semaine</li>
          <li>🤝 Contacte des influenceurs de Kinshasa pour un partenariat</li>
        </ul>
      </div>
    </div>
  );
    }
