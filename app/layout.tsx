import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, Source_Serif_4, Special_Elite } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const stencil = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-stencil-face" });
const type = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-type-face" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans-face" });
// The story is long-form reading, which a serif carries better than the UI face
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif-face" });

export const metadata: Metadata = {
  title: { default: "Enigma", template: "%s · Enigma" },
  description:
    "The story of the Enigma machine: how it worked, how it was used, why it was so strong, and how it was broken. With a working machine to try.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9e2d4" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${stencil.variable} ${type.variable} ${sans.variable} ${serif.variable}`}>
      <body className="min-h-dvh antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
