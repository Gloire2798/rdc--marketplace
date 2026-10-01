import type { Metadata } from "next";
import "./globals.css";
import Header from "./Header";
import NavigationPublique from "./components/NavigationPublique";

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
        <main style={{ minHeight: "80vh", paddingBottom: "80px" }}>{children}</main>
        <NavigationPublique />
      </body>
    </html>
  );
}
