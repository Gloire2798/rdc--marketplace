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
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-around",
      padding: "10px 0 12px 0",
      zIndex: 100,
      boxShadow: "0 -4px 12px rgba(15, 23, 42, 0.08)",
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
              gap: "4px",
              textDecoration: "none",
              color: actif ? "#1D4ED8" : "#64748b",
              fontSize: "12px",
              fontWeight: actif ? "800" : "600",
              padding: "4px 12px",
              borderRadius: "8px",
              position: "relative",
            }}
          >
            {actif && (
              <span style={{
                position: "absolute",
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "24px",
                height: "3px",
                backgroundColor: "#1D4ED8",
                borderRadius: "2px",
              }} />
            )}
            <span style={{ fontSize: "24px" }}>{onglet.icone}</span>
            <span>{onglet.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
