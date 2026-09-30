"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOuvert(true)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "26px",
          cursor: "pointer",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
        }}
        aria-label="Ouvrir le menu"
      >
        ☰
      </button>

      {ouvert && (
        <div
          onClick={() => setOuvert(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            zIndex: 999,
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "280px",
          maxWidth: "80%",
          backgroundColor: "#0F172A",
          color: "white",
          zIndex: 1000,
          transform: ouvert ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{
          padding: "22px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.3px" }}>🛒 GK Sensei</p>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px", fontWeight: "600" }}>
              Espace Admin
            </p>
          </div>
          <button
            onClick={() => setOuvert(false)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "26px",
              cursor: "pointer",
            }}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {liensMenu.map((lien) => {
            const actif = pathname === lien.href || pathname.startsWith(lien.href + "/");
            return (
              <Link
                key={lien.href}
                href={lien.href}
                onClick={() => setOuvert(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "15px 20px",
                  color: actif ? "white" : "#cbd5e1",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: "700",
                  borderLeft: actif ? "4px solid #3B82F6" : "4px solid transparent",
                  backgroundColor: actif ? "rgba(59, 130, 246, 0.15)" : "transparent",
                }}
              >
                <span style={{ fontSize: "20px" }}>{lien.icone}</span>
                <span>{lien.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <Link
            href="/api/auth/deconnexion"
            onClick={() => setOuvert(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "15px 20px",
              color: "#f87171",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            <span style={{ fontSize: "20px" }}>🚪</span>
            <span>Déconnexion</span>
          </Link>
        </div>
      </div>
    </>
  );
}
