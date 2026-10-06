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
  Video,
  User,
} from "lucide-react";

const SITE_URL = "https://gk-sensei.vercel.app";
const ANALYTICS_URL =
  "https://analytics.google.com/analytics/web/#/a410458151p557070698/reports/intelligenthome";

interface TextePret {
  id: string;
  titre: string;
  texte: string;
  Icon: any;
}

const textesPrets: TextePret[] = [
  {
    id: "presentation",
    titre: "Présentation courte",
    Icon: Megaphone,
    texte: `🛍️ Vos boutiques préférées, enfin réunies.

Fini de courir à droite et à gauche. Sur GK Sensei, tu trouves mode, électronique, accessoires... et tu commandes en 2 clics.

📱 Paye par M-Pesa, Orange Money ou Airtel Money
🏪 Récupère ta commande en boutique

👉 ${SITE_URL}`,
  },
  {
    id: "vendeurs",
    titre: "Pour recruter des vendeurs",
    Icon: Megaphone,
    texte: `🏪 Vends plus. Sans quitter ton quartier.

Avec GK Sensei, ta boutique est visible 24h/24 par des clients de toute la ville. Pas un stand, pas un local. Une vraie boutique en ligne.

✅ Inscription : 25 000 FC (une seule fois)
✅ Loyer : 15 000 FC/mois — moins qu'un stand au marché
✅ Zéro commission sur tes ventes

👉 Ouvre ta boutique : ${SITE_URL}/vendeur/inscription`,
  },
  {
    id: "clients",
    titre: "Pour attirer des clients",
    Icon: Megaphone,
    texte: `✨ Ta boutique préférée est maintenant en ligne.

Sur GK Sensei, découvre des vendeurs près de chez toi : mode, électronique, cosmétiques, accessoires...

📱 Commande en 2 clics
💰 Paye avec ton Mobile Money préféré
🏪 Récupère quand tu veux

👉 ${SITE_URL}`,
  },
  {
    id: "whatsapp_statut",
    titre: "Statut WhatsApp",
    Icon: MessageCircle,
    texte: `🛒 GK Sensei — Le commerce en un clic

Toutes tes boutiques préférées, dans ta poche.
📱 Commande. Paie. Récupère.

👉 ${SITE_URL}

👇 Partage à 3 amis qui aiment acheter en ligne !`,
  },
  {
    id: "tiktok",
    titre: "Idées TikTok",
    Icon: Video,
    texte: `🎥 Idées de vidéos pour TikTok

1. LE HOOK
"Tu savais qu'à Kinshasa tu peux commander de partout, payer par M-Pesa, et récupérer en boutique ? C'est GK Sensei."

2. LE TUTO
"Regarde comment acheter en 30 secondes sur GK Sensei."

3. LE STORYTIME
"J'ai commandé un sac à dos pour 15$ sur GK Sensei..."

4. LES COULISSES
"Je te montre les boutiques qu'on trouve sur GK Sensei aujourd'hui."

👉 ${SITE_URL}`,
  },
  {
    id: "bio",
    titre: "Bio réseaux sociaux",
    Icon: User,
    texte: `📍 Kinshasa
🛍️ Le complexe commercial en ligne
📱 Commande, paie, récupère
🔗 gk-sensei.vercel.app`,
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
                `Découvrez GK Sensei — Vos boutiques préférées, enfin réunies. ${SITE_URL}`
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
          Textes prêts à publier ({textesPrets.length})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {textesPrets.map((t) => {
            const Icone = t.Icon;
            return (
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
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Icone size={13} strokeWidth={2.8} color="#EA580C" />
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
            );
          })}
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
          <li>Crée une vidéo TikTok chaque semaine avec le lien</li>
        </ul>
      </div>
    </div>
  );
              }
