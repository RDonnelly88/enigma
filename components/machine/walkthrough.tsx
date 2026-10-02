"use client";

import type { Step } from "@/lib/explain";
import { cn } from "@/lib/cn";

type Props = {
  steps: Step[];
  selected: number | null;
  onSelect: (index: number | null) => void;
};

/** The key press told as a story, one step per part of the machine. Picking a step lights its part of the diagram. */
export function Walkthrough({ steps, selected, onSelect }: Props) {
  return (
    <ol className="flex flex-col gap-1" aria-label="Step by step">
      {steps.map((step, i) => {
        const active = selected === i;
        return (
          <li key={i}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : i)}
              className={cn(
                "w-full rounded-sm px-3 py-2 text-left transition-colors motion-reduce:transition-none",
                "focus-visible:outline-2 focus-visible:outline-lamp-on",
                active ? "bg-case-edge" : "hover:bg-case-edge/50",
              )}
            >
              <span className="flex items-baseline gap-2">
                <span className="w-5 shrink-0 text-right font-stencil text-xs text-case-muted tabular-nums">{i + 1}</span>
                <span className="font-semibold text-case-ink">{step.title}</span>
              </span>
              {/* On a phone the steps would run to several screens, so only the chosen one opens there */}
              <span className={cn("mt-1 pl-7 text-sm leading-relaxed text-case-muted lg:block", active ? "block text-case-ink" : "hidden")}>
                {step.body}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
