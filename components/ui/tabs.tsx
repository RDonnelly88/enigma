"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/cn";

type Tab<T extends string> = { value: T; label: string; badge?: string };

/**
 * Tabs with the keyboard behaviour screen readers expect: arrow keys move
 * between tabs, and only the chosen tab is in the Tab order.
 */
export function Tabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
  children,
}: {
  label: string;
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (from: number, by: number) => {
    const next = (from + by + tabs.length) % tabs.length;
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} className="rail flex gap-1 overflow-x-auto rounded-full border border-panel-edge bg-room p-1">
        {tabs.map((t, i) => (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${id}-${t.value}`}
            aria-selected={t.value === value}
            aria-controls={`${id}-panel`}
            tabIndex={t.value === value ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(i, 1);
              else if (e.key === "ArrowLeft") move(i, -1);
              else return;
              e.preventDefault();
            }}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors",
              t.value === value ? "bg-brass text-brass-ink" : "text-room-muted hover:text-room-ink",
            )}
          >
            {t.label}
            {t.badge && <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", t.value === value ? "bg-brass-ink/15" : "bg-panel-edge")}>{t.badge}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${value}`} className="mt-5">
        {children}
      </div>
    </div>
  );
}
