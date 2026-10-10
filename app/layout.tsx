import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "./Header";
import NavigationPublique from "./components/NavigationPublique";
import EnregistrerSW from "./components/EnregistrerSW";

const police = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GK Sensei — Complexe Commercial en ligne",
  description: "Toutes vos boutiques préférées, en un seul endroit.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GK Sensei",
  },
  icons: {
    icon: "https://i.ibb.co/xKnVPmGg/logo-Gk.jpg",
    apple: "https://i.ibb.co/xKnVPmGg/logo-Gk.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={police.className}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0XQ9KNQXKE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0XQ9KNQXKE');
          `}
        </Script>
      </head>
      <body>
        <EnregistrerSW />
        <Header />
        <main style={{ minHeight: "80vh", paddingBottom: "80px" }}>{children}</main>
        <NavigationPublique />
      </body>
    </html>
  );
}
