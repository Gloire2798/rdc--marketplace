import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  ShoppingBag,
  Wallet,
  MapPin,
  Phone,
  Mail,
  Store,
  Heart,
  Target,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "À propos",
  description:
    "GK Sensei — Le complexe commercial en ligne de Kinshasa. Découvrez notre mission et notre vision.",
};

export default function APropos() {
  const titreSection = {
    fontSize: "12px",
    fontWeight: "900" as const,
    color: "#0F172A",
    marginBottom: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
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

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F5EAD2",
      padding: "16px 12px 100px 12px",
      maxWidth: "600px",
      margin: "0 auto",
    }}>
      {/* RETOUR */}
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#0F172A",
          fontSize: "11.5px",
          fontWeight: "800",
          textDecoration: "none",
          marginBottom: "16px",
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.8} />
        Retour à l&apos;accueil
      </Link>

      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "#0F172A",
          padding: "5px 12px",
          borderRadius: "20px",
          fontSize: "9.5px",
          fontWeight: "900",
          color: "white",
          marginBottom: "12px",
          letterSpacing: "0.5px",
        }}>
          <Sparkles size={10} strokeWidth={2.8} />
          À PROPOS
        </div>

        <h1 style={{
          fontSize: "26px",
          fontWeight: "900",
          color: "#0F172A",
          lineHeight: 1.1,
          letterSpacing: "-0.6px",
          marginBottom: "8px",
        }}>
          GK Sensei, c&apos;est quoi ?
        </h1>

        <p style={{
          fontSize: "13px",
          color: "#57534E",
          fontWeight: "700",
          lineHeight: 1.5,
        }}>
          Un complexe commercial en ligne — comme le Marché Central, mais dans ton téléphone.
        </p>
      </div>

      {/* PRÉSENTATION */}
      <div style={carteStyle}>
        <h2 style={titreSection}>
          <span style={traitOrange} />
          <Building2 size={14} strokeWidth={2.8} color="#EA580C" />
          Notre mission
        </h2>

        <p style={{
          fontSize: "12px",
          color: "#0F172A",
          fontWeight: "700",
          lineHeight: 1.65,
        }}>
          Offrir aux vendeurs congolais une <strong>vitrine professionnelle</strong> pour vendre en ligne, sans commission, avec un loyer mensuel abordable.
        </p>

        <p style={{
          fontSize: "12px",
          color: "#0F172A",
          fontWeight: "700",
          lineHeight: 1.65,
          marginTop: "10px",
        }}>
          Offrir aux clients une <strong>expérience d&apos;achat simple</strong> : trouver, commander, payer, récupérer.
        </p>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <div style={carteStyle}>
        <h2 style={titreSection}>
          <span style={traitOrange} />
          <Target size={14} strokeWidth={2.8} color="#EA580C" />
          Comment ça marche ?
        </h2>

        {/* VENDEURS */}
        <div style={{
          backgroundColor: "#F5EAD2",
          borderRadius: "14px",
          padding: "12px",
          marginBottom: "10px",
          border: "1px solid #D4C5A0",
        }}>
          <p style={{
            fontSize: "11px",
            fontWeight: "900",
            color: "#0F172A",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <Store size={13} strokeWidth={2.8} color="#EA580C" />
            Pour les vendeurs
          </p>
          <ul style={{
            fontSize: "11.5px",
            color: "#0F172A",
            fontWeight: "700",
            lineHeight: 1.7,
            paddingLeft: "16px",
          }}>
            <li>Inscription : <strong>25 000 FC</strong> (une fois)</li>
            <li>Loyer : <strong>15 000 FC/mois</strong></li>
            <li><strong>Zéro commission</strong> sur les ventes</li>
            <li>Boutique visible <strong>24h/24</strong></li>
          </ul>
        </div>

        {/* CLIENTS */}
        <div style={{
          backgroundColor: "#F5EAD2",
          borderRadius: "14px",
          padding: "12px",
          border: "1px solid #D4C5A0",
        }}>
          <p style={{
            fontSize: "11px",
            fontWeight: "900",
            color: "#0F172A",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <ShoppingBag size={13} strokeWidth={2.8} color="#EA580C" />
            Pour les clients
          </p>
          <ul style={{
            fontSize: "11.5px",
            color: "#0F172A",
            fontWeight: "700",
            lineHeight: 1.7,
            paddingLeft: "16px",
          }}>
            <li>Commande en <strong>2 clics</strong></li>
            <li>Acompte <strong>10%</strong> par Mobile Money (M-Pesa, Orange, Airtel)</li>
            <li>Reste à payer <strong>au retrait</strong> en boutique</li>
            <li>Retrait <strong>simple et rapide</strong></li>
          </ul>
        </div>
      </div>

      {/* PAIEMENT */}
      <div style={carteStyle}>
        <h2 style={titreSection}>
          <span style={traitOrange} />
          <Wallet size={14} strokeWidth={2.8} color="#EA580C" />
          Paiement
        </h2>

        <p style={{
          fontSize: "11.5px",
          color: "#0F172A",
          fontWeight: "700",
          lineHeight: 1.65,
          marginBottom: "10px",
        }}>
          À la commande, tu paies <strong>10% d&apos;acompte</strong> par Mobile Money pour confirmer ta commande.
        </p>

        <p style={{
          fontSize: "11.5px",
          color: "#0F172A",
          fontWeight: "700",
          lineHeight: 1.65,
        }}>
          Le <strong>reste (90%)</strong> se paie <strong>au retrait en boutique</strong>, en espèces ou par Mobile Money.
        </p>
      </div>

      {/* VISION */}
      <div style={carteStyle}>
        <h2 style={titreSection}>
          <span style={traitOrange} />
          <Heart size={14} strokeWidth={2.8} color="#EA580C" />
          Notre vision
        </h2>

        <p style={{
          fontSize: "12px",
          color: "#0F172A",
          fontWeight: "700",
          lineHeight: 1.65,
        }}>
          Devenir une <strong>référence e-commerce en Afrique</strong>, avec un complexe commercial multi-étages virtuel.
        </p>

        <p style={{
          fontSize: "11.5px",
          color: "#57534E",
          fontWeight: "700",
          lineHeight: 1.65,
          marginTop: "10px",
          fontStyle: "italic",
        }}>
          Kinshasa → Lubumbashi → Goma → puis l&apos;Afrique.
        </p>
      </div>

      {/* LOCALISATION */}
      <div style={carteStyle}>
        <h2 style={titreSection}>
          <span style={traitOrange} />
          <MapPin size={14} strokeWidth={2.8} color="#EA580C" />
          Nous trouver
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{
            fontSize: "11.5px",
            color: "#0F172A",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <MapPin size={12} strokeWidth={2.8} color="#EA580C" />
            Kinshasa, RDC
          </p>

          <a
            href="https://gk-sensei.vercel.app"
            style={{
              fontSize: "11.5px",
              color: "#EA580C",
              fontWeight: "800",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🌐 gk-sensei.vercel.app
          </a>
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Link
          href="/vendeur/inscription"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            backgroundColor: "#0F172A",
            color: "white",
            padding: "16px",
            borderRadius: "26px",
            textDecoration: "none",
            fontWeight: "900",
            fontSize: "13px",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
            letterSpacing: "-0.2px",
          }}
        >
          <Store size={15} strokeWidth={2.8} />
          Devenir vendeur
        </Link>

        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            backgroundColor: "white",
            color: "#0F172A",
            padding: "14px",
            borderRadius: "26px",
            border: "1.5px solid #0F172A",
            textDecoration: "none",
            fontWeight: "900",
            fontSize: "12.5px",
          }}
        >
          <ShoppingBag size={14} strokeWidth={2.8} />
          Voir les boutiques
        </Link>
      </div>
    </div>
  );
      }
