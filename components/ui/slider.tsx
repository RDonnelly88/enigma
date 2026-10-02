"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** How the current value reads, e.g. a letter or "10 cables". */
  format?: (value: number) => string;
  /** Marks along the rail, such as a historical setting worth finding. */
  marks?: { value: number; label: string }[];
  className?: string;
};

/** A native range input, so keyboard, touch and screen readers all work, dressed as a brass knob on a rail. */
export function Slider({ label, value, min, max, step = 1, onChange, format = String, marks = [], className }: Props) {
  const id = useId();
  const at = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">
          {label}
        </label>
        <output htmlFor={id} className="font-stencil text-lg font-bold text-room-ink">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{ "--fill": `${at(value)}%` } as React.CSSProperties}
      />
      {marks.length > 0 && (
        <div className="relative h-4" aria-hidden>
          {marks.map((m) => (
            <span
              key={m.value}
              className="absolute -translate-x-1/2 text-[10px] whitespace-nowrap text-room-muted before:absolute before:-top-1.5 before:left-1/2 before:h-1.5 before:w-px before:bg-room-muted"
              // Inset by the knob's radius so marks line up with where the knob sits
              style={{ left: `calc(12px + (100% - 24px) * ${at(m.value) / 100})` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
