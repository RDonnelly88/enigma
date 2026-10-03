"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/** Wartime security slogans, from the posters that told everyone a secret was everyone's business. */
const SLOGANS = [
  { line: "Careless talk costs lives", from: "British Ministry of Information poster, 1940" },
  { line: "Keep it under your hat", from: "British wartime security poster" },
  { line: "Walls have ears", from: "British wartime security poster" },
  { line: "Loose lips might sink ships", from: "American wartime poster, 1942" },
];

const pick = (path: string) => [...path].reduce((n, c) => n + c.charCodeAt(0), 0) % SLOGANS.length;
const never = () => () => {};

/**
 * The foot of every page, with a slogan from the posters of the day, the same
 * for a page every visit. Picked from the address in the browser, after the
 * first paint, because a page like "not found" is built under a different
 * address from the one it is shown at.
 */
export function SiteFooter() {
  // Read so the footer renders again, with the new page's slogan, after moving between pages
  usePathname();
  const slogan = SLOGANS[useSyncExternalStore(never, () => pick(window.location.pathname), () => 0)];
  return (
    <footer className="no-print border-t border-panel-edge">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <figure>
          <blockquote className="font-stencil text-3xl font-bold tracking-wide uppercase sm:text-4xl">&ldquo;{slogan.line}&rdquo;</blockquote>
          <figcaption className="mt-1 text-xs text-room-muted">{slogan.from}</figcaption>
        </figure>
        <p className="max-w-sm text-xs leading-relaxed text-room-muted">
          The machine, its wiring, the procedures and the history are real. The practice messages, their keys and the people
          of <em>A day in 1941</em> are invented, so every one of them can be broken on this site.
        </p>
      </div>
    </footer>
  );
}
