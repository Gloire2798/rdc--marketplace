import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GK Sensei — Complexe Commercial en ligne",
  description: "Toutes vos boutiques préférées, en un seul endroit.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <header style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 0",
        }}>
          <div className="container" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <a href="/" style={{
              display: "flex",
              flexDirection: "column",
              textDecoration: "none",
            }}>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#2563eb" }}>
                🛒 GK Sensei
              </span>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>
                Complexe Commercial
              </span>
            </a>
            <nav style={{ display: "flex", gap: "16px", fontSize: "14px", alignItems: "center" }}>
              <a href="/" style={{ color: "#111827", fontWeight: "500" }}>
                Accueil
              </a>
              <a
                href="/vendeur/connexion"
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
              >
                Connexion
              </a>
            </nav>
          </div>
        </header>
        <main style={{ minHeight: "80vh" }}>{children}</main>
        <footer style={{
          backgroundColor: "#111827",
          color: "white",
          padding: "20px 0",
          textAlign: "center",
          marginTop: "40px",
          fontSize: "14px",
        }}>
          <div className="container">
            <p>© 2025 Complexe Commercial GK Sensei</p>
            <p style={{ color: "#9ca3af", marginTop: "4px" }}>
              Toutes vos boutiques préférées, en un seul endroit.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
