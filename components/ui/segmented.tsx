"use client";

import { cn } from "@/lib/cn";

/** A row of mutually exclusive choices, like a switch with more than two positions. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-panel-edge bg-room p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a styled pill group; native radios can't look like this
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
            value === o.value ? "bg-brass text-brass-ink" : "text-room-muted hover:text-room-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
