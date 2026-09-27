import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RDC Marketplace",
  description: "Plateforme d'achat en ligne en RDC",
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
            <a href="/" style={{ fontSize: "20px", fontWeight: "bold", color: "#2563eb" }}>
              🛒 RDC Marketplace
            </a>
            <nav style={{ display: "flex", gap: "20px" }}>
              <a href="/">Accueil</a>
              <a href="/vendeur">Vendeur</a>
              <a href="/admin">Admin</a>
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
        }}>
          <div className="container">
            <p>© 2025 RDC Marketplace — Tous droits réservés</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
