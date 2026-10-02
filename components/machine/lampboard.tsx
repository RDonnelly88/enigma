"use client";

import { cn } from "@/lib/cn";
import { ROWS } from "./layout";

export function Lampboard({ lit }: { lit: string | null }) {
  return (
    <output className="flex flex-col items-center gap-1.5 sm:gap-2.5" aria-label={lit ? `Lamp ${lit} lit` : "Lampboard, no lamp lit"}>
      {ROWS.map((row) => (
        <div key={row} className="flex gap-1.5 sm:gap-2.5">
          {row.split("").map((letter) => {
            const on = letter === lit;
            return (
              <div
                key={letter}
                data-lamp={letter}
                data-lit={on || undefined}
                className={cn(
                  "grid size-8 place-items-center rounded-full border-2 border-metal-dark font-stencil text-lg font-bold sm:size-11 sm:text-2xl",
                  "transition-[background-color,box-shadow,color] duration-75 motion-reduce:transition-none",
                  on
                    ? "bg-lamp-on text-lamp-ink-on shadow-[0_0_18px_6px_var(--lamp-glow),inset_0_0_8px_rgb(255_255_255/0.7)]"
                    : "bg-lamp-off text-lamp-ink-off shadow-[inset_0_2px_6px_rgb(0_0_0/0.7)]",
                )}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}
    </output>
  );
}
