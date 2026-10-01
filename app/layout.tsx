import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "./Header";
import NavigationPublique from "./components/NavigationPublique";

const police = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

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
    <html lang="fr" className={police.className}>
      <body>
        <Header />
        <main style={{ minHeight: "80vh", paddingBottom: "80px" }}>{children}</main>
        <NavigationPublique />
      </body>
    </html>
  );
}
