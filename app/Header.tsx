"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { compterArticles } from "@/lib/panier";
import MenuBurger from "./admin/dashboard/MenuBurger";

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

  // Header admin
  if (pathname.startsWith("/admin") && !estPageConnexion) {
    return (
      <header style={{
        backgroundColor: "#0F172A",
        color: "white",
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
      }}>
        <MenuBurger />

        <Link href="/admin/dashboard" style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          color: "white",
        }}>
          <span style={{ fontSize: "26px" }}>🛒</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "18px", fontWeight: "800", lineHeight: 1.1 }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>
              Espace Admin
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <span style={{ fontSize: "22px" }}>🔍</span>
          <span style={{ fontSize: "22px" }}>🔔</span>
        </div>
      </header>
    );
  }

  // Header vendeur (connecté)
  if (pathname.startsWith("/vendeur") && user && user.role === "VENDEUR") {
    return (
      <header style={{
        backgroundColor: "white",
        borderBottom: "2px solid #e2e8f0",
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
      }}>
        <Link href="/vendeur/dashboard" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          color: "inherit",
        }}>
          <span style={{ fontSize: "24px" }}>🛒</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "#1D4ED8", lineHeight: 1.1 }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11px", color: "#475569", fontWeight: "700" }}>
              Espace vendeur
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <Link href="/vendeur/commandes" style={{ fontSize: "24px", textDecoration: "none" }}>
            📦
          </Link>
          <Link href="/vendeur/produits" style={{ fontSize: "24px", textDecoration: "none" }}>
            🏪
          </Link>
        </div>
      </header>
    );
  }

  // Header client (connecté)
  if (pathname.startsWith("/client") && user && user.role === "ACHETEUR") {
    return (
      <header style={{
        backgroundColor: "white",
        borderBottom: "2px solid #e2e8f0",
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          color: "inherit",
        }}>
          <span style={{ fontSize: "24px" }}>🛒</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "#1D4ED8", lineHeight: 1.1 }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11px", color: "#475569", fontWeight: "700" }}>
              Mon compte
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <Link href="/acheteur/panier" style={{ position: "relative", textDecoration: "none" }}>
            <span style={{ fontSize: "24px" }}>🛒</span>
            {nbPanier > 0 && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-6px",
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

  // Header public (par défaut)
  return (
    <header style={{
      backgroundColor: "white",
      borderBottom: "1px solid #e2e8f0",
      padding: "14px 20px",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          color: "inherit",
        }}>
          <span style={{ fontSize: "24px" }}>🛒</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "#1D4ED8", lineHeight: 1.1 }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11px", color: "#475569", fontWeight: "700" }}>
              Complexe Commercial
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: "14px", color: "#0F172A", fontWeight: "700", textDecoration: "none" }}>
            Accueil
          </Link>
          <Link href="/acheteur/panier" style={{ position: "relative", textDecoration: "none" }}>
            <span style={{ fontSize: "22px" }}>🛒</span>
            {nbPanier > 0 && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-6px",
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
          <Link href="/vendeur/connexion" style={{
            fontSize: "14px",
            color: "white",
            fontWeight: "700",
            backgroundColor: "#1D4ED8",
            padding: "8px 14px",
            borderRadius: "8px",
            textDecoration: "none",
          }}>
            Connexion
          </Link>
        </div>
      </div>
    </header>
  );
          }
