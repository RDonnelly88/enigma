"use client";

import type { Placement } from "@/lib/crib";
import { cn } from "@/lib/cn";

type Props = { placements: Placement[]; offset: number; onOffset: (offset: number) => void };

/** Every place the crib could start, ruled out or still standing, at a glance. */
export function PositionMap({ placements, offset, onOffset }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {placements.map((p) => {
        const possible = p.clashes.length === 0;
        return (
          <button
            key={p.offset}
            type="button"
            onClick={() => onOffset(p.offset)}
            aria-label={`Position ${p.offset + 1}, ${possible ? "possible" : "ruled out"}`}
            aria-current={p.offset === offset || undefined}
            data-possible={possible || undefined}
            className={cn(
              "h-6 w-4 rounded-[2px] transition-transform motion-reduce:transition-none",
              possible ? "bg-signal-in" : "bg-danger/35",
              p.offset === offset && "scale-y-125 outline-2 outline-offset-1 outline-paper-ink",
            )}
          />
        );
      })}
    </div>
  );
}
