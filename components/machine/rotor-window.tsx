"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toLetter } from "@/lib/enigma";
import { playRotor } from "@/lib/sound";

type Props = {
  label: string;
  position: number;
  onTurn?: (delta: number) => void;
};

/** How far a finger travels to turn the wheel one letter. */
const DRAG_STEP_PX = 16;

export function RotorWindow({ label, position, onTurn }: Props) {
  const reduced = useReducedMotion();
  const drag = useRef<{ y: number } | null>(null);
  // Which way the drum moved decides which way the letters slide
  const [previous, setPrevious] = useState(position);
  const [direction, setDirection] = useState(0);
  if (position !== previous) {
    setPrevious(position);
    setDirection(position === (previous + 1) % 26 ? 1 : -1);
  }

  const turn = (delta: number) => {
    if (!onTurn) return;
    playRotor();
    onTurn(delta);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-stretch gap-1">
        <output
          className="relative block h-24 w-11 overflow-hidden rounded-md border-2 border-metal-dark bg-paper shadow-[inset_0_6px_8px_rgb(0_0_0/0.55),inset_0_-6px_8px_rgb(0_0_0/0.55)] sm:h-28 sm:w-14"
          aria-live="polite"
          aria-label={`${label} at ${toLetter(position)}`}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={position}
              custom={direction}
              className="absolute inset-0 flex flex-col items-center justify-center font-stencil font-bold text-paper-ink"
              initial={reduced ? false : { y: direction >= 0 ? "33%" : "-33%" }}
              animate={{ y: 0 }}
              exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { y: direction >= 0 ? "-33%" : "33%" }}
              transition={{ type: "spring", stiffness: 700, damping: 40 }}
            >
              <span className="text-sm leading-6 text-paper-muted sm:text-base sm:leading-7">{toLetter(position - 1)}</span>
              <span className="text-3xl leading-10 sm:text-4xl sm:leading-12">{toLetter(position)}</span>
              <span className="text-sm leading-6 text-paper-muted sm:text-base sm:leading-7">{toLetter(position + 1)}</span>
            </motion.div>
          </AnimatePresence>
        </output>
        {onTurn && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              aria-label={`Turn ${label} back`}
              onClick={() => turn(-1)}
              className="grid h-6 w-5 place-items-center text-case-muted hover:text-case-ink"
            >
              <ChevronUp className="size-4" />
            </button>
            {/* A range input can't be dragged vertically or styled as a knurled wheel */}
            <div
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
              role="slider"
              tabIndex={0}
              aria-label={`${label} thumbwheel`}
              aria-valuemin={0}
              aria-valuemax={25}
              aria-valuenow={position}
              aria-valuetext={toLetter(position)}
              className="knurl w-4 flex-1 cursor-ns-resize touch-none rounded-sm border border-metal-dark shadow-[inset_-3px_0_4px_rgb(0_0_0/0.5)] focus-visible:outline-2 focus-visible:outline-lamp-on"
              style={{ backgroundPositionY: `${position * 4}px` }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { y: e.clientY };
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                const steps = Math.trunc((drag.current.y - e.clientY) / DRAG_STEP_PX);
                if (steps !== 0) {
                  drag.current.y -= steps * DRAG_STEP_PX;
                  // Dragging up rolls the next letter into the window
                  turn(steps);
                }
              }}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onWheel={(e) => turn(e.deltaY > 0 ? 1 : -1)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowRight") turn(1);
                else if (e.key === "ArrowDown" || e.key === "ArrowLeft") turn(-1);
                else return;
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            <button
              type="button"
              aria-label={`Turn ${label} forward`}
              onClick={() => turn(1)}
              className="grid h-6 w-5 place-items-center text-case-muted hover:text-case-ink"
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        )}
      </div>
      <span className="font-stencil text-xs font-semibold tracking-widest text-case-muted uppercase">{label}</span>
    </div>
  );
}
