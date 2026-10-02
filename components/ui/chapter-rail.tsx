"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/cn";

type Item = { id: string; title: string };

/**
 * Where you are in a long page. On a wide screen, a rail of chapter names down
 * the side with the current one marked; on a phone, a thin progress line under
 * the header with the current chapter's name.
 */
export function ChapterRail({ chapters }: { chapters: Item[] }) {
  const [active, setActive] = useState(chapters[0]?.id);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  useEffect(() => {
    const seen = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        // The chapter taking up most of the screen is the one being read
        const best = [...seen.entries()].sort((a, b) => b[1] - a[1])[0];
        if (best && best[1] > 0) setActive(best[0]);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [chapters]);

  const current = chapters.find((c) => c.id === active);

  return (
    <>
      <div className="sticky top-14 z-30 -mx-4 border-b border-panel-edge bg-room/90 px-4 py-2 backdrop-blur xl:hidden">
        <p className="truncate text-xs font-semibold tracking-widest text-room-muted uppercase" aria-live="polite">
          {current?.title}
        </p>
        <motion.div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brass" style={{ scaleX: progress }} />
      </div>
      <nav aria-label="Chapters" className="fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 xl:block">
        <ol className="relative flex flex-col gap-3 border-l border-panel-edge pl-4">
          <motion.span
            aria-hidden
            className="absolute top-0 -left-px w-px origin-top bg-brass"
            style={{ scaleY: progress, height: "100%" }}
          />
          {chapters.map((c, i) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={c.id === active ? "true" : undefined}
                className={cn(
                  "flex items-baseline gap-2 text-xs transition-colors",
                  c.id === active ? "text-room-ink" : "text-room-muted hover:text-room-ink",
                )}
              >
                <span className={cn("font-stencil", c.id === active && "text-brass")}>{String(i + 1).padStart(2, "0")}</span>
                <span className={cn("max-w-28", c.id !== active && "sr-only 2xl:not-sr-only")}>{c.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
