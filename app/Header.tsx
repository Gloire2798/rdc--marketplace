"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { compterArticles } from "@/lib/panier";
import MenuBurgerAdmin from "./admin/dashboard/MenuBurger";
import MenuBurgerVendeur from "./vendeur/dashboard/MenuBurger";
import NotificationBell from "./components/NotificationBell";
import { Search, ShoppingCart } from "lucide-react";

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

  const pageSansHeader =
    pathname === "/vendeur/connexion" ||
    pathname === "/vendeur/inscription" ||
    pathname === "/client/inscription" ||
    pathname === "/compte" ||
    pathname === "/mot-de-passe-oublie" ||
    pathname.startsWith("/acheteur/boutique/");

  if (pageSansHeader) return null;

  // HEADER ADMIN
  if (pathname.startsWith("/admin")) {
    return (
      <header style={{
        backgroundColor: "white",
        borderBottom: "2px solid #D4C5A0",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <MenuBurgerAdmin />
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img
            src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg"
            alt="GK"
            style={{ height: "36px", width: "auto", mixBlendMode: "multiply" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A", lineHeight: 1.1 }}>GK Sensei</span>
            <span style={{ fontSize: "10.5px", color: "#57534E", fontWeight: "700" }}>Espace Admin</span>
          </div>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", color: "#0F172A" }}>
          <Link href="/recherche" style={{ color: "#0F172A", display: "flex", alignItems: "center" }}>
            <Search size={22} strokeWidth={2.8} />
          </Link>
          <NotificationBell />
        </div>
      </header>
    );
  }

  // HEADER VENDEUR
  if (pathname.startsWith("/vendeur") && user && user.role === "VENDEUR") {
    return (
      <header style={{
        backgroundColor: "white",
        borderBottom: "2px solid #D4C5A0",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <MenuBurgerVendeur />
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img
            src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg"
            alt="GK"
            style={{ height: "36px", width: "auto", mixBlendMode: "multiply" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A", lineHeight: 1.1 }}>GK Sensei</span>
            <span style={{ fontSize: "10.5px", color: "#57534E", fontWeight: "700" }}>Espace vendeur</span>
          </div>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", color: "#0F172A" }}>
          <Link href="/recherche" style={{ color: "#0F172A", display: "flex", alignItems: "center" }}>
            <Search size={22} strokeWidth={2.8} />
          </Link>
          <NotificationBell />
        </div>
      </header>
    );
  }

  // HEADER CLIENT
  if (pathname.startsWith("/client") && user && user.role === "ACHETEUR") {
    return (
      <header style={{
        backgroundColor: "white",
        borderBottom: "2px solid #D4C5A0",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img
            src="https://i.ibb.co/xKnVPmGg/logo-Gk.jpg"
            alt="GK"
            style={{ height: "36px", width: "auto", mixBlendMode: "multiply" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A", lineHeight: 1.1 }}>GK Sensei</span>
            <span style={{ fontSize: "10.5px", color: "#57534E", fontWeight: "700" }}>Mon compte</span>
          </div>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", color: "#0F172A" }}>
          <Link href="/recherche" style={{ color: "#0F172A", display: "flex", alignItems: "center" }}>
            <Search size={22} strokeWidth={2.8} />
          </Link>
          <NotificationBell />
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
      </header>
    );
  }

  // HEADER PUBLIC
  return (
    <header style={{
      backgroundColor: "#F5EAD2",
      padding: "14px 16px",
      position: "sticky",
      top: 0,
      zIndex: 50,
      borderBottom: "1.5px solid #D4C5A0",
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
            style={{
              height: "48px",
              width: "auto",
              objectFit: "contain",
              mixBlendMode: "multiply",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "18px", fontWeight: "900", color: "#0F172A", lineHeight: 1.1, letterSpacing: "-0.3px" }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700" }}>
              Complexe Commercial
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "18px", alignItems: "center", color: "#0F172A" }}>
          <Link href="/recherche" style={{ color: "#0F172A", display: "flex", alignItems: "center" }}>
            <Search size={24} strokeWidth={2.8} />
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
        </div>
      </div>
    </header>
  );
            }
