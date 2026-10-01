"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Camera, User, LogOut } from "lucide-react";

interface InfosUser {
  id: string;
  nom: string | null;
  role: string;
}

const ongletsBase = [
  { href: "/", label: "Accueil", Icon: Home },
  { href: "/boutiques", label: "Boutiques", Icon: Store },
  { href: "/stories", label: "Stories", Icon: Camera },
  { href: "/compte", label: "Compte", Icon: User },
];

export default function NavigationPublique() {
  const pathname = usePathname();
  const [user, setUser] = useState<InfosUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/moi")
      .then((res) => res.json())
      .then((data) => {
        if (data.succes) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Ne pas afficher sur les pages admin, vendeur et client
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendeur") ||
    pathname.startsWith("/client")
  ) {
    return null;
  }

  // Si connecté, on remplace "Compte" par "Déconnexion"
  const onglets = user
    ? [
        { href: "/", label: "Accueil", Icon: Home },
        { href: "/boutiques", label: "Boutiques", Icon: Store },
        { href: "/stories", label: "Stories", Icon: Camera },
        { href: "/deconnexion", label: "Déconnexion", Icon: LogOut },
      ]
    : ongletsBase;

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
      padding: "8px 0 10px 0",
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
              gap: "3px",
              textDecoration: "none",
              color: estDeconnexion
                ? "#dc2626"
                : actif
                ? "#F97316"
                : "#94a3b8",
              fontSize: "10px",
              fontWeight: actif || estDeconnexion ? "800" : "600",
              padding: "4px 10px",
              position: "relative",
            }}
          >
            {actif && !estDeconnexion && (
              <span style={{
                position: "absolute",
                top: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "20px",
                height: "3px",
                backgroundColor: "#F97316",
                borderRadius: "2px",
              }} />
            )}
            <Icon size={20} strokeWidth={actif || estDeconnexion ? 2.8 : 2.2} />
            <span>{onglet.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
