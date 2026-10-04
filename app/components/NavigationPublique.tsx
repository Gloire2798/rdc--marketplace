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
      backgroundColor: "#0F172A",
      borderTop: "3px solid #EA580C",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0 10px 0",
      zIndex: 100,
      boxShadow: "0 -4px 16px rgba(15, 23, 42, 0.2)",
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
              gap: "3px",
              textDecoration: "none",
              color: estDeconnexion
                ? "#F87171"
                : actif
                ? "#F59E0B"
                : "#94A3B8",
              fontSize: "9.5px",
              fontWeight: actif || estDeconnexion ? "900" : "700",
              padding: "3px 6px",
              position: "relative",
              flex: 1,
              letterSpacing: "0.2px",
            }}
          >
            {actif && !estDeconnexion && (
              <span style={{
                position: "absolute",
                top: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "24px",
                height: "3px",
                backgroundColor: "#F59E0B",
                borderRadius: "2px",
              }} />
            )}
            <Icon size={actif ? 20 : 18} strokeWidth={actif ? 2.8 : 2.2} />
            <span>{onglet.label}</span>
          </Link>
        );
      })}
    </nav>
  );
                  }
