import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Codebreaker",
  description: "Break an Enigma message with no key at all, using the statistical attack run in your browser.",
};

export default function CodebreakerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
