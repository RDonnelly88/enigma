"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const TILE = 30;

type Props = {
  ciphertext: string;
  crib: string;
  offset: number;
  clashes: number[];
  onOffset: (offset: number) => void;
};

/**
 * The ciphertext as a row of tiles with the crib on a strip beneath it. Drag
 * the strip, or use the arrow keys on it, to slide the crib along.
 */
export function Strip({ ciphertext, crib, offset, clashes, onOffset }: Props) {
  const reduced = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; offset: number } | null>(null);
  const max = ciphertext.length - crib.length;
  const clash = new Set(clashes);
  const clamp = (n: number) => Math.min(max, Math.max(0, n));

  // Keep the crib in view as it moves along a message wider than the screen
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const start = offset * TILE;
    const end = start + crib.length * TILE;
    if (start < el.scrollLeft || end > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: Math.max(0, start - TILE * 2), behavior: reduced ? "auto" : "smooth" });
    }
  }, [offset, crib.length, reduced]);

  return (
    <div ref={scroller} className="overflow-x-auto pb-3">
      <div className="relative px-1 pt-5" style={{ width: ciphertext.length * TILE + 8 }}>
        <div className="flex">
          {ciphertext.split("").map((letter, i) => {
            const under = i - offset;
            const covered = under >= 0 && under < crib.length;
            return (
              <div key={i} className="relative" style={{ width: TILE }}>
                {i % 5 === 0 && (
                  <span className="absolute -top-5 left-1 text-[10px] text-paper-muted tabular-nums">{i + 1}</span>
                )}
                <div
                  data-clash={clash.has(under) || undefined}
                  className={cn(
                    "mx-px grid h-9 place-items-center rounded-sm font-type text-lg",
                    clash.has(under)
                      ? "bg-danger text-paper"
                      : covered
                        ? "bg-paper-ink/10 text-paper-ink"
                        : "text-paper-muted",
                  )}
                >
                  {letter}
                </div>
              </div>
            );
          })}
        </div>
        <motion.div
          // A range input can't carry the crib's letters or be dragged as a strip
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          role="slider"
          tabIndex={0}
          aria-label="Crib position"
          aria-valuemin={1}
          aria-valuemax={max + 1}
          aria-valuenow={offset + 1}
          aria-valuetext={`Position ${offset + 1}, ${clashes.length === 0 ? "possible" : `ruled out by ${clashes.length}`}`}
          className="mt-1.5 flex w-fit cursor-grab touch-none rounded-sm bg-case py-0.5 shadow-md select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp-on active:cursor-grabbing"
          animate={{ x: offset * TILE }}
          initial={false}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 45 }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, offset };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const next = clamp(drag.current.offset + Math.round((e.clientX - drag.current.x) / TILE));
            if (next !== offset) onOffset(next);
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onKeyDown={(e) => {
            const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity };
            if (!(e.key in moves)) return;
            e.preventDefault();
            onOffset(clamp(offset + moves[e.key]));
          }}
        >
          {crib.split("").map((letter, i) => (
            <div
              key={i}
              className={cn(
                "mx-px grid h-9 place-items-center rounded-sm font-type text-lg",
                clash.has(i) ? "bg-danger text-paper" : "text-case-ink",
              )}
              style={{ width: TILE - 2 }}
            >
              {letter}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
