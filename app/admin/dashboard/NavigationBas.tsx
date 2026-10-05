"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, TrendingUp, LogOut } from "lucide-react";

const onglets = [
  { href: "/admin/dashboard", label: "Accueil", Icon: Home },
  { href: "/admin/boutiques", label: "Boutiques", Icon: Store },
  { href: "/admin/ventes", label: "Ventes", Icon: TrendingUp },
  { href: "/deconnexion", label: "Quitter", Icon: LogOut },
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
      borderTop: "1.5px solid #D4C5A0",
      display: "flex",
      justifyContent: "space-around",
      padding: "6px 0 8px 0",
      zIndex: 100,
      boxShadow: "0 -2px 8px rgba(120, 100, 60, 0.10)",
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
                ? "#DC2626"
                : actif
                ? "#EA580C"
                : "#94A3B8",
              fontSize: "9px",
              fontWeight: actif || estDeconnexion ? "900" : "700",
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
                width: "18px",
                height: "3px",
                backgroundColor: "#EA580C",
                borderRadius: "2px",
              }} />
            )}
            <Icon size={18} strokeWidth={actif || estDeconnexion ? 2.8 : 2.1} />
            <span>{onglet.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
