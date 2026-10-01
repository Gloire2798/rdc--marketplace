"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { compterArticles } from "@/lib/panier";
import MenuBurger from "./admin/dashboard/MenuBurger";
import { Search, Bell, ShoppingCart, Package, Store } from "lucide-react";

interface InfosUser {
  id: string;
  nom: string | null;
  role: string;
}

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<InfosUser | null>(null);
  const [nbPanier, setNbPanier] = useState(0);

  useEffect(() => {
    const mettreAJourPanier = () => setNbPanier(compterArticles());
    mettreAJourPanier();
    window.addEventListener("panier-mis-a-jour", mettreAJourPanier);
    return () => window.removeEventListener("panier-mis-a-jour", mettreAJourPanier);
  }, []);

  useEffect(() => {
    fetch("/api/auth/moi")
      .then((res) => res.json())
      .then((data) => {
        if (data.succes) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const estPageConnexion =
    pathname === "/vendeur/connexion" ||
    pathname === "/vendeur/inscription" ||
    pathname === "/client/inscription" ||
    pathname === "/mot-de-passe-oublie";

  // HEADER ADMIN
  if (pathname.startsWith("/admin") && !estPageConnexion) {
    return (
      <header style={{
        backgroundColor: "white",
        borderBottom: "2px solid #E2E8F0",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
      }}>
        <MenuBurger />
        <Link href="/admin/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg" alt="GK" style={{ height: "36px", width: "auto" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A", lineHeight: 1.1 }}>GK Sensei</span>
            <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "700" }}>Espace Admin</span>
          </div>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", color: "#0F172A" }}>
          <Search size={22} strokeWidth={2.8} />
          <Bell size={22} strokeWidth={2.8} />
        </div>
      </header>
    );
  }

  // HEADER VENDEUR
  if (pathname.startsWith("/vendeur") && user && user.role === "VENDEUR") {
    return (
      <header style={{
        backgroundColor: "white",
        borderBottom: "2px solid #E2E8F0",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <Link href="/vendeur/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg" alt="GK" style={{ height: "36px", width: "auto" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A", lineHeight: 1.1 }}>GK Sensei</span>
            <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "700" }}>Espace vendeur</span>
          </div>
        </Link>
        <div style={{ display: "flex", gap: "18px", alignItems: "center", color: "#0F172A" }}>
          <Link href="/vendeur/commandes" style={{ color: "#0F172A" }}>
            <Package size={24} strokeWidth={2.8} />
          </Link>
          <Link href="/vendeur/produits" style={{ color: "#0F172A" }}>
            <Store size={24} strokeWidth={2.8} />
          </Link>
        </div>
      </header>
    );
  }

  // HEADER CLIENT
  if (pathname.startsWith("/client") && user && user.role === "ACHETEUR") {
    return (
      <header style={{
        backgroundColor: "white",
        borderBottom: "2px solid #E2E8F0",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg" alt="GK" style={{ height: "36px", width: "auto" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A", lineHeight: 1.1 }}>GK Sensei</span>
            <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "700" }}>Mon compte</span>
          </div>
        </Link>
        <Link href="/acheteur/panier" style={{ position: "relative", color: "#0F172A" }}>
          <ShoppingCart size={24} strokeWidth={2.8} />
          {nbPanier > 0 && (
            <span style={{
              position: "absolute",
              top: "-6px",
              right: "-8px",
              backgroundColor: "#dc2626",
              color: "white",
              fontSize: "10px",
              fontWeight: "800",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {nbPanier}
            </span>
          )}
        </Link>
      </header>
    );
  }

  // HEADER PUBLIC
  return (
    <header style={{
      backgroundColor: "white",
      padding: "14px 16px",
      position: "sticky",
      top: 0,
      zIndex: 50,
      borderBottom: "1px solid #F1F5F9",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
        }}>
          <img
            src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg"
            alt="GK Sensei"
            style={{ height: "48px", width: "auto", objectFit: "contain" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "18px", fontWeight: "900", color: "#0F172A", lineHeight: 1.1, letterSpacing: "-0.3px" }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
              Complexe Commercial
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "18px", alignItems: "center", color: "#0F172A" }}>
          <Search size={24} strokeWidth={2.8} />
          <Link href="/acheteur/panier" style={{ position: "relative", color: "#0F172A" }}>
            <ShoppingCart size={24} strokeWidth={2.8} />
            {nbPanier > 0 && (
              <span style={{
                position: "absolute",
                top: "-6px",
                right: "-8px",
                backgroundColor: "#dc2626",
                color: "white",
                fontSize: "10px",
                fontWeight: "800",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {nbPanier}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
        }
