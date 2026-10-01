"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Camera,
  LogOut,
  Plus,
} from "lucide-react";

const liensMenu = [
  { href: "/vendeur/dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
  { href: "/vendeur/boutique", label: "Ma boutique", Icon: Store },
  { href: "/vendeur/produits", label: "Mes produits", Icon: Package },
  { href: "/vendeur/commandes", label: "Mes commandes", Icon: ShoppingCart },
  { href: "/vendeur/stories", label: "Mes stories", Icon: Camera },
  { href: "/vendeur/produits/nouveau", label: "Ajouter un produit", Icon: Plus },
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
          color: "#0F172A",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Ouvrir le menu"
      >
        <Menu size={24} strokeWidth={2.5} />
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
          width: "270px",
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
          padding: "18px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: "16px", fontWeight: "800" }}>GK Sensei</p>
            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px", fontWeight: "600" }}>
              Espace vendeur
            </p>
          </div>
          <button
            onClick={() => setOuvert(false)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Fermer le menu"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "10px 0" }}>
          {liensMenu.map((lien) => {
            const actif = pathname === lien.href;
            const Icon = lien.Icon;
            return (
              <Link
                key={lien.href}
                href={lien.href}
                onClick={() => setOuvert(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "13px 18px",
                  color: actif ? "white" : "#cbd5e1",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "700",
                  borderLeft: actif ? "3px solid #3B82F6" : "3px solid transparent",
                  backgroundColor: actif ? "rgba(59, 130, 246, 0.15)" : "transparent",
                }}
              >
                <Icon size={18} strokeWidth={2.5} />
                <span>{lien.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Link
            href="/deconnexion"
            onClick={() => setOuvert(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "13px 18px",
              color: "#f87171",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "700",
            }}
          >
            <LogOut size={18} strokeWidth={2.5} />
            <span>Déconnexion</span>
          </Link>
        </div>
      </div>
    </>
  );
              }
