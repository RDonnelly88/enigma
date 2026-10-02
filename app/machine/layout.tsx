import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The machine",
  description: "A working Enigma: set the rotors, plug the cables, and follow the current from key to lamp step by step.",
};

export default function MachineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
