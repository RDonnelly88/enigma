"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { PAGES } from "@/lib/pages";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { GlossaryButton } from "@/components/glossary/glossary";

export function SiteHeader() {
  const path = usePathname();
  const nav = useRef<HTMLElement>(null);

  // On a phone the later pages sit off the edge; bring the current one into view, unless the
  // links have already been slid by hand, when moving them would pull one from under a finger
  useEffect(() => {
    const rail = nav.current;
    const link = rail?.querySelector("[aria-current]");
    if (!rail || !link || rail.scrollLeft > 0) return;
    const overhang = link.getBoundingClientRect().right - rail.getBoundingClientRect().right;
    if (overhang > 0) rail.scrollLeft = overhang + 32;
  }, [path]);

  return (
    <header className="sticky top-0 z-40 border-b border-panel-edge bg-room/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-4">
        <Link href="/" className="shrink-0 font-stencil text-xl font-bold tracking-[0.35em]">
          ENIGMA
        </Link>
        {/* On a phone the links slide sideways rather than wrapping, fading at the edge to show there are more */}
        <nav
          ref={nav}
          aria-label="Main"
          className="rail ml-auto flex min-w-0 gap-1 overflow-x-auto pr-6 [mask-image:linear-gradient(to_right,black_85%,transparent)] md:pr-0 md:[mask-image:none]"
        >
          {PAGES.map((link) => {
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
        <GlossaryButton />
        <SoundToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
