"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Camera, User } from "lucide-react";

const onglets = [
  { href: "/", label: "Accueil", Icon: Home },
  { href: "/boutiques", label: "Boutiques", Icon: Store },
  { href: "/stories", label: "Stories", Icon: Camera },
  { href: "/compte", label: "Compte", Icon: User },
];

export default function NavigationPublique() {
  const pathname = usePathname();

  // Ne pas afficher sur les pages admin, vendeur et client
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendeur") ||
    pathname.startsWith("/client")
  ) {
    return null;
  }

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
        const actif = pathname === onglet.href;
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
              color: actif ? "#F97316" : "#94a3b8",
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
                backgroundColor: "#F97316",
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
