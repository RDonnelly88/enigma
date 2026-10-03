"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";
import { ROWS } from "./layout";

/** Socket centres in a 900 × 300 box, so cables and sockets share one geometry. */
const SOCKETS: Record<string, { x: number; y: number }> = Object.fromEntries(
  ROWS.flatMap((row, r) =>
    row.split("").map((letter, i) => {
      const offset = (9 - row.length) / 2;
      return [letter, { x: (i + offset + 0.5) * 100, y: r * 100 + 50 }];
    }),
  ),
);

/** How far below a socket's centre its holes are, in the same 900 × 300 box. */
const HOLES = 13;

type Props = {
  pairs: string[];
  onChange: (pairs: string[]) => void;
};

export function Plugboard({ pairs, onChange }: Props) {
  const [holding, setHolding] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();
  const partner = (letter: string) => pairs.find((p) => p.includes(letter))?.replace(letter, "") ?? null;

  const choose = (letter: string) => {
    const plugged = pairs.find((p) => p.includes(letter));
    if (plugged) {
      onChange(pairs.filter((p) => p !== plugged));
      setHolding(null);
    } else if (holding === letter) {
      setHolding(null);
    } else if (holding) {
      onChange([...pairs, holding + letter]);
      setHolding(null);
    } else if (pairs.length < 13) {
      setHolding(letter);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="relative aspect-[3/1] w-full">
        <svg viewBox="0 0 900 300" className="pointer-events-none absolute inset-0 z-10 size-full overflow-visible" aria-hidden>
          {pairs.map((pair) => {
            // Cables plug into the holes, which sit below each socket's letter
            const a = { x: SOCKETS[pair[0]].x, y: SOCKETS[pair[0]].y + HOLES };
            const b = { x: SOCKETS[pair[1]].x, y: SOCKETS[pair[1]].y + HOLES };
            const droop = Math.max(a.y, b.y) + 40 + Math.abs(a.x - b.x) * 0.12;
            const d = `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${droop} ${b.x} ${b.y}`;
            return (
              <g key={pair}>
                <path d={d} fill="none" stroke="rgb(0 0 0 / 0.45)" strokeWidth={11} strokeLinecap="round" transform="translate(0 4)" />
                <motion.path
                  d={d}
                  fill="none"
                  stroke="var(--cable)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
                <path d={d} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth={2} strokeLinecap="round" transform="translate(-1 -2)" />
                {/* A plug at each end: a bakelite head with two brass pins */}
                {[a, b].map((p, i) => (
                  <g key={i} transform={`translate(${p.x} ${p.y})`}>
                    <rect x={-13} y={-9} width={26} height={18} rx={4} fill="#1a1918" stroke="var(--metal-dark)" strokeWidth={1.5} />
                    <circle cx={-5} cy={0} r={2.2} fill="var(--metal)" />
                    <circle cx={5} cy={0} r={2.2} fill="var(--metal)" />
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
        {Object.entries(SOCKETS).map(([letter, { x, y }]) => {
          const to = partner(letter);
          return (
            <button
              key={letter}
              type="button"
              onClick={() => choose(letter)}
              aria-label={to ? `${letter}, plugged to ${to}. Unplug` : holding === letter ? `${letter}, holding cable` : `Plug ${letter}`}
              aria-pressed={!!to || holding === letter}
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-md px-1 py-0.5",
                "focus-visible:outline-2 focus-visible:outline-lamp-on",
                holding === letter && "bg-lamp-on/20",
              )}
              style={{ left: `${x / 9}%`, top: `${y / 3}%` }}
            >
              <span className="font-stencil text-xs font-bold text-case-ink sm:text-sm">{letter}</span>
              <span className="flex gap-1">
                {[0, 1].map((hole) => (
                  <span
                    key={hole}
                    className={cn(
                      "size-2.5 rounded-full border border-metal-dark bg-black shadow-[inset_0_1px_2px_rgb(255_255_255/0.2)] sm:size-3",
                      (to || holding === letter) && "bg-cable",
                    )}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-case-muted" aria-live="polite">
        {holding
          ? `Holding a cable from ${holding}. Choose a letter to plug it into.`
          : pairs.length > 0
            ? `${pairs.length} ${pairs.length === 1 ? "cable" : "cables"}: ${pairs.join(" ")}. Tap a plugged letter to unplug it.`
            : "Tap two letters to join them with a cable. The army used ten."}
      </p>
    </div>
  );
}
