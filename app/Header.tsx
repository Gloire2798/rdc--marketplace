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
  const [chargement, setChargement] = useState(true);

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
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, []);

  // Page de connexion ou inscription → header public
  const estPageConnexion =
    pathname === "/vendeur/connexion" ||
    pathname === "/vendeur/inscription" ||
    pathname === "/client/inscription" ||
    pathname === "/mot-de-passe-oublie";

  // Header admin
  if (pathname.startsWith("/admin") && !estPageConnexion) {
    return (
      <header style={{
        backgroundColor: "#1E3A5F",
        color: "white",
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
            <span style={{ fontSize: "18px", fontWeight: "bold", lineHeight: 1.1 }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: "500" }}>
              Admin
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
        borderBottom: "1px solid #e5e7eb",
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
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
            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb", lineHeight: 1.1 }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>
              Espace vendeur
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/vendeur/commandes" style={{ fontSize: "22px", textDecoration: "none" }}>
            📦
          </Link>
          <Link href="/vendeur/produits" style={{ fontSize: "22px", textDecoration: "none" }}>
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
        borderBottom: "1px solid #e5e7eb",
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
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
            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb", lineHeight: 1.1 }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>
              Mon compte
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
                fontWeight: "bold",
                width: "16px",
                height: "16px",
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
      borderBottom: "1px solid #e5e7eb",
      padding: "14px 18px",
      position: "sticky",
      top: 0,
      zIndex: 50,
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
            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb", lineHeight: 1.1 }}>
              GK Sensei
            </span>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>
              Complexe Commercial
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: "14px", color: "#111827", fontWeight: "500", textDecoration: "none" }}>
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
                fontWeight: "bold",
                width: "16px",
                height: "16px",
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
            color: "#2563eb",
            fontWeight: "600",
            border: "1px solid #2563eb",
            padding: "6px 14px",
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
