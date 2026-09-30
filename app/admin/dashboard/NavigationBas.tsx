"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const onglets = [
  { href: "/admin/dashboard", label: "Tableau", icone: "🏠" },
  { href: "/admin/boutiques", label: "Boutiques", icone: "🏪" },
  { href: "/admin/commandes", label: "Commandes", icone: "📦" },
  { href: "/admin/finance", label: "Finance", icone: "💰" },
  { href: "/admin/parametres", label: "Profil", icone: "👤" },
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
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0",
      zIndex: 100,
      boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
    }}>
      {onglets.map((onglet) => {
        const actif = pathname === onglet.href || pathname.startsWith(onglet.href + "/");
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
              color: actif ? "#2563eb" : "#6b7280",
              fontSize: "11px",
              fontWeight: actif ? "600" : "500",
              padding: "4px 12px",
              borderRadius: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>{onglet.icone}</span>
            <span>{onglet.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
