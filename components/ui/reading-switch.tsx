"use client";

import { BookOpen, Zap } from "lucide-react";
import { useReading } from "@/hooks/use-preference";
import { cn } from "@/lib/cn";
import { choose, type Reading } from "@/lib/preferences";

const OPTIONS: { value: Reading; label: string; icon: typeof Zap }[] = [
  { value: "short", label: "In short", icon: Zap },
  { value: "detail", label: "The detail", icon: BookOpen },
];

/**
 * Floats at the foot of a story page: read each chapter in short, or in full.
 * Switching changes the page's length a lot, so it keeps the chapter being read
 * in front of the reader.
 */
export function ReadingSwitch({ current }: { current?: string }) {
  const reading = useReading();
  const pick = (value: Reading) => {
    if (value === reading) return;
    choose("read", value);
    if (current && window.scrollY > 0) document.getElementById(current)?.scrollIntoView({ block: "start" });
  };
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div
        role="radiogroup"
        aria-label="How much to read"
        className="pointer-events-auto inline-flex rounded-full border border-panel-edge bg-panel/90 p-1 shadow-lg backdrop-blur"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a styled pill group; native radios can't look like this
            role="radio"
            aria-checked={reading === value}
            onClick={() => pick(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              reading === value ? "bg-room-ink text-room" : "text-room-muted hover:text-room-ink",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
