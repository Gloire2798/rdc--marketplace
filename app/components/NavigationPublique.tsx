"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Camera, User, LogOut, LayoutDashboard, Shield } from "lucide-react";

interface InfosUser {
  id: string;
  nom: string | null;
  role: string;
}

export default function NavigationPublique() {
  const pathname = usePathname();
  const [user, setUser] = useState<InfosUser | null>(null);

  // Recharger à chaque changement de page
  useEffect(() => {
    fetch("/api/auth/moi")
      .then((res) => res.json())
      .then((data) => {
        if (data.succes) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  // Ne pas afficher sur les pages admin, vendeur et client
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendeur") ||
    pathname.startsWith("/client")
  ) {
    return null;
  }

  const onglets = [];

  onglets.push({ href: "/", label: "Accueil", Icon: Home });
  onglets.push({ href: "/boutiques", label: "Boutiques", Icon: Store });
  onglets.push({ href: "/stories", label: "Stories", Icon: Camera });

  if (user) {
    if (user.role === "VENDEUR") {
      onglets.push({ href: "/vendeur/dashboard", label: "Mon espace", Icon: LayoutDashboard });
    } else if (user.role === "ADMIN") {
      onglets.push({ href: "/admin/dashboard", label: "Admin", Icon: Shield });
    } else {
      onglets.push({ href: "/client/compte", label: "Mon compte", Icon: User });
    }
    onglets.push({ href: "/deconnexion", label: "Quitter", Icon: LogOut });
  } else {
    onglets.push({ href: "/compte", label: "Compte", Icon: User });
  }

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "white",
      borderTop: "1px solid #E8DFC8",
      display: "flex",
      justifyContent: "space-around",
      padding: "6px 0 8px 0",
      zIndex: 100,
      boxShadow: "0 -2px 8px rgba(120, 100, 60, 0.08)",
    }}>
      {onglets.map((onglet) => {
        const actif = pathname === onglet.href;
        const Icon = onglet.Icon;
        const estDeconnexion = onglet.href === "/deconnexion";

        return (
          <Link
            key={onglet.href}
            href={onglet.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              textDecoration: "none",
              color: estDeconnexion
                ? "#dc2626"
                : actif
                ? "#F97316"
                : "#94a3b8",
              fontSize: "9px",
              fontWeight: actif || estDeconnexion ? "800" : "600",
              padding: "3px 6px",
              position: "relative",
              flex: 1,
            }}
          >
            {actif && !estDeconnexion && (
              <span style={{
                position: "absolute",
                top: "-6px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "16px",
                height: "2.5px",
                backgroundColor: "#F97316",
                borderRadius: "2px",
              }} />
            )}
            <Icon size={18} strokeWidth={actif || estDeconnexion ? 2.6 : 2.1} />
            <span>{onglet.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
