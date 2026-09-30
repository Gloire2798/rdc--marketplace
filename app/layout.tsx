import type { Metadata } from "next";
import "./globals.css";
import Header from "./Header";

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
        <Header />
        <main style={{ minHeight: "80vh" }}>{children}</main>
      </body>
    </html>
  );
}
