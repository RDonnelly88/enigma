"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/", label: "Machine" },
  { href: "/crib", label: "Crib dragger" },
];

export function SiteHeader() {
  const path = usePathname();
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-6 gap-y-3 px-4 pt-6 sm:pt-10">
      <Link href="/" className="font-stencil text-4xl font-bold tracking-[0.3em] sm:text-5xl">
        ENIGMA
      </Link>
      <nav aria-label="Main" className="flex gap-1 rounded-sm border border-room-muted/40 p-0.5">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={path === link.href ? "page" : undefined}
            className={cn(
              "rounded-[1px] px-3 py-1 font-stencil text-sm font-bold tracking-wider uppercase",
              path === link.href ? "bg-room-ink text-room" : "text-room-muted hover:text-room-ink",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
