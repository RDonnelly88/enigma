"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/", label: "The story" },
  { href: "/machine", label: "The machine" },
  { href: "/day", label: "A day in 1941" },
  { href: "/crib", label: "Cribs & the Bombe" },
  { href: "/codebreaker", label: "Codebreaker" },
];

export function SiteHeader() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-panel-edge bg-room/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="shrink-0 font-stencil text-xl font-bold tracking-[0.35em]">
          ENIGMA
        </Link>
        {/* On a phone the links slide sideways rather than wrapping */}
        <nav aria-label="Main" className="rail -mr-4 ml-auto flex min-w-0 gap-1 overflow-x-auto pr-4">
          {LINKS.map((link) => {
            const here = link.href === "/" ? path === "/" : path.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={here ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors",
                  here ? "bg-room-ink text-room" : "text-room-muted hover:bg-panel hover:text-room-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
