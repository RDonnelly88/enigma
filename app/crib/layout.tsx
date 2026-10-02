import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cribs & the Bombe",
  description: "How Enigma was broken by hand: guessed words, the flaw that ruled positions out, and the menus Turing's Bombe was wired from.",
};

export default function CribLayout({ children }: { children: React.ReactNode }) {
  return children;
}
