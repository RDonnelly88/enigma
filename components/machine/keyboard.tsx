"use client";

import { cn } from "@/lib/cn";
import { ROWS } from "./layout";

type Props = {
  held: string | null;
  disabled: boolean;
  onDown: (letter: string) => void;
  onUp: () => void;
};

export function Keyboard({ held, disabled, onDown, onUp }: Props) {
  return (
    <div className="flex touch-none select-none flex-col items-center gap-1.5 sm:gap-2.5" onPointerLeave={onUp}>
      {ROWS.map((row) => (
        <div key={row} className="flex gap-1.5 sm:gap-2.5">
          {row.split("").map((letter) => {
            const down = letter === held;
            return (
              <button
                key={letter}
                type="button"
                aria-label={letter}
                aria-pressed={down}
                disabled={disabled}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  onDown(letter);
                }}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                // A key reached by Tab should still work from the keyboard
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
                    e.preventDefault();
                    e.stopPropagation();
                    onDown(letter);
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onUp();
                  }
                }}
                className={cn(
                  "relative size-8 rounded-full p-[3px] sm:size-11",
                  "bg-gradient-to-b from-metal to-metal-dark shadow-[0_4px_0_var(--metal-dark),0_6px_8px_rgb(0_0_0/0.5)]",
                  "transition-transform duration-75 motion-reduce:transition-none",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp-on",
                  "disabled:opacity-50",
                  down && "translate-y-1 shadow-[0_0_0_var(--metal-dark),0_2px_3px_rgb(0_0_0/0.5)]",
                )}
              >
                <span className="grid size-full place-items-center rounded-full bg-key font-stencil text-base font-bold text-key-ink shadow-[inset_0_2px_3px_rgb(255_255_255/0.15)] sm:text-xl">
                  {letter}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
