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
  ScanLine,
  Heart,
} from "lucide-react";

const liensMenu = [
  { href: "/vendeur/dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
  { href: "/vendeur/scanner", label: "Scanner un QR", Icon: ScanLine },
  { href: "/vendeur/boutique", label: "Ma boutique", Icon: Store },
  { href: "/vendeur/produits", label: "Mes produits", Icon: Package },
  { href: "/vendeur/commandes", label: "Mes commandes", Icon: ShoppingCart },
  { href: "/vendeur/abonnes", label: "Mes abonnés", Icon: Heart },
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
            <p style={{
              fontSize: "16px",
              fontWeight: "900",
              letterSpacing: "-0.3px",
            }}>
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
            const actif =
              pathname === lien.href || pathname.startsWith(lien.href + "/");
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

        {/* DÉCONNEXION */}
        <div style={{
          padding: "12px 0",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}>
          <Link
            href="/deconnexion"
            onClick={() => setOuvert(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 18px",
              color: "#F87171",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "800",
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
