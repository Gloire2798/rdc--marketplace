"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, TrendingUp, User } from "lucide-react";

const onglets = [
  { href: "/admin/dashboard", label: "Accueil", Icon: Home },
  { href: "/admin/boutiques", label: "Boutiques", Icon: Store },
  { href: "/admin/ventes", label: "Ventes", Icon: TrendingUp },
  { href: "/admin/profil", label: "Profil", Icon: User },
];

export default function NavigationBas() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "white",
      borderTop: "1px solid #E2E8F0",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0 10px 0",
      zIndex: 100,
      boxShadow: "0 -2px 8px rgba(15, 23, 42, 0.06)",
    }}>
      {onglets.map((onglet) => {
        const actif = pathname === onglet.href || pathname.startsWith(onglet.href + "/");
        const Icon = onglet.Icon;
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
              color: actif ? "#1D4ED8" : "#94a3b8",
              fontSize: "10px",
              fontWeight: actif ? "800" : "600",
              padding: "4px 10px",
              position: "relative",
            }}
          >
            {actif && (
              <span style={{
                position: "absolute",
                top: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "20px",
                height: "3px",
                backgroundColor: "#1D4ED8",
                borderRadius: "2px",
              }} />
            )}
            <Icon size={20} strokeWidth={actif ? 2.8 : 2.2} />
            <span>{onglet.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
