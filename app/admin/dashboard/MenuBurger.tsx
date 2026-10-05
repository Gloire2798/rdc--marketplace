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
  Users,
  Wallet,
  Megaphone,
  Settings,
  MessageCircle,
} from "lucide-react";

const liensMenu = [
  { href: "/admin/dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
  { href: "/admin/boutiques", label: "Boutiques", Icon: Store },
  { href: "/admin/commandes", label: "Commandes", Icon: Package },
  { href: "/admin/utilisateurs", label: "Utilisateurs", Icon: Users },
  { href: "/admin/finance", label: "Finance", Icon: Wallet },
  { href: "/admin/marketing", label: "Marketing", Icon: Megaphone },
  { href: "/admin/parametres", label: "Paramètres", Icon: Settings },
  { href: "/admin/support", label: "Support", Icon: MessageCircle },
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
          width: "280px",
          maxWidth: "82%",
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
        {/* HEADER MENU */}
        <div style={{
          padding: "20px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: "16px", fontWeight: "900", letterSpacing: "-0.3px" }}>
              GK Sensei
            </p>
            <p style={{
              fontSize: "11px",
              color: "#94A3B8",
              marginTop: "3px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Espace Admin
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
              padding: "4px",
            }}
            aria-label="Fermer le menu"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {liensMenu.map((lien) => {
            const actif = pathname === lien.href || pathname.startsWith(lien.href + "/");
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
                  padding: "14px 18px",
                  color: actif ? "white" : "#CBD5E1",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "800",
                  borderLeft: actif ? "3px solid #EA580C" : "3px solid transparent",
                  backgroundColor: actif ? "rgba(234, 88, 12, 0.15)" : "transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={18} strokeWidth={2.5} color={actif ? "#EA580C" : "#CBD5E1"} />
                <span>{lien.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
