import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Public_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--fuente-display",
  weight: ["500", "600", "700"],
});

const cuerpo = Public_Sans({
  subsets: ["latin"],
  variable: "--fuente-cuerpo",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--fuente-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Pedidos",
  description: "Gestor de pedidos de bebidas naturales",
};

export const viewport: Viewport = {
  themeColor: "#0f5c4a",
  width: "device-width",
  initialScale: 1,
  // Evita el zoom automático de iOS al enfocar inputs
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-MX"
      className={`${display.variable} ${cuerpo.variable} ${mono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
