"use client";

import { useState } from "react";
import Link from "next/link";

const liensMenu = [
  { href: "/admin/dashboard", label: "Tableau de bord", icone: "🏠" },
  { href: "/admin/boutiques", label: "Boutiques", icone: "🏪" },
  { href: "/admin/commandes", label: "Commandes", icone: "📦" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icone: "👥" },
  { href: "/admin/finance", label: "Finance", icone: "💰" },
  { href: "/admin/analyses", label: "Analyses", icone: "📈" },
  { href: "/admin/marketing", label: "Marketing", icone: "📢" },
  { href: "/admin/parametres", label: "Paramètres", icone: "⚙️" },
  { href: "/admin/support", label: "Support", icone: "💬" },
];

export default function MenuBurger() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      {/* Bouton burger */}
      <button
        onClick={() => setOuvert(true)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          padding: "8px",
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Ouvrir le menu"
      >
        ☰
      </button>

      {/* Overlay sombre */}
      {ouvert && (
        <div
          onClick={() => setOuvert(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* Menu latéral */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "280px",
          maxWidth: "80%",
          backgroundColor: "#1E3A5F",
          color: "white",
          zIndex: 1000,
          transform: ouvert ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* En-tête du menu */}
        <div style={{
          padding: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>🛒 GK Sensei</p>
            <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "2px" }}>
              Complexe Commercial
            </p>
          </div>
          <button
            onClick={() => setOuvert(false)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
            }}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        {/* Liens */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {liensMenu.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              onClick={() => setOuvert(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 20px",
                color: "white",
                textDecoration: "none",
                fontSize: "15px",
                borderLeft: "3px solid transparent",
                transition: "background-color 0.2s",
              }}
            >
              <span style={{ fontSize: "18px" }}>{lien.icone}</span>
              <span>{lien.label}</span>
            </Link>
          ))}
        </nav>

        {/* Déconnexion */}
        <div style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Link
            href="/api/auth/deconnexion"
            onClick={() => setOuvert(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 20px",
              color: "#fca5a5",
              textDecoration: "none",
              fontSize: "15px",
            }}
          >
            <span style={{ fontSize: "18px" }}>🚪</span>
            <span>Déconnexion</span>
          </Link>
        </div>
      </div>
    </>
  );
      }
