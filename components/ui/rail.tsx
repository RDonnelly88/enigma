"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * A horizontal rail of cards that snaps as it scrolls. Swipe it, scroll it,
 * or use the arrows; the edges fade only while there is more to see.
 */
export function Rail({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  const track = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, []);

  const move = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <section
        ref={track}
        aria-label={label}
        // A scrolling region must take focus so the keyboard can scroll it
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="rail flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 focus-visible:outline-2 focus-visible:outline-brass"
      >
        {children}
      </section>
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-room transition-opacity", edges.start && "opacity-0")}
      />
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-room transition-opacity", edges.end && "opacity-0")}
      />
      <div className="mt-3 flex justify-end gap-2 px-4">
        {([-1, 1] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => move(d)}
            disabled={d < 0 ? edges.start : edges.end}
            aria-label={d < 0 ? `Scroll ${label} back` : `Scroll ${label} on`}
            className="grid size-9 place-items-center rounded-full border border-panel-edge text-room-ink transition-opacity hover:border-brass disabled:opacity-30"
          >
            {d < 0 ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/** One card on a rail. */
export function RailCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-[min(20rem,80vw)] shrink-0 snap-start rounded-lg border border-panel-edge bg-panel p-5", className)}>
      {children}
    </div>
  );
}
