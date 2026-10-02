import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, Special_Elite } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const stencil = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-stencil-face" });
const type = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-type-face" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans-face" });

export const metadata: Metadata = {
  title: "Enigma",
  description: "A working Enigma machine. Set the rotors, plug the cables, and watch the current find its lamp.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9e2d4" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${stencil.variable} ${type.variable} ${sans.variable}`}>
      <body className="min-h-dvh antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
