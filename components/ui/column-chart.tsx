"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Datum = { label: string; value: number };

type Props = {
  /** What the chart shows, read out to screen readers and used for the table's caption. */
  title: string;
  data: Datum[];
  /** Index of the column to pick out in the accent colour. */
  highlight?: number;
  /** For values that span many orders of magnitude, such as plugboard arrangements. */
  log?: boolean;
  format?: (value: number) => string;
  /** Short value labels to draw above chosen columns, so the story reads without hovering. */
  labels?: Record<number, string>;
  /** Clicking a column picks it, for charts that double as a control. */
  onPick?: (index: number) => void;
  valueHeading?: string;
  height?: number;
};

const tickValues = (max: number, log: boolean) => {
  if (log) {
    const top = Math.ceil(Math.log10(Math.max(max, 1)));
    const step = top > 9 ? 3 : top > 4 ? 2 : 1;
    return Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => 10 ** (i * step));
  }
  const raw = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw || 1));
  const nice = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((m) => m >= raw) ?? raw;
  return Array.from({ length: Math.floor(max / nice) + 1 }, (_, i) => i * nice);
};

const compact = (n: number) =>
  n >= 1e3 ? new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 0 }).format(n) : String(n);

/**
 * A single-series column chart. Columns are thin with a rounded top and a
 * surface gap between them; one can be highlighted; every value is reachable
 * by hover, by keyboard focus, and in the table underneath.
 */
export function ColumnChart({
  title,
  data,
  highlight,
  log = false,
  format = (v) => v.toLocaleString("en-GB"),
  labels = {},
  onPick,
  valueHeading = "Value",
  height = 200,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const ticks = tickValues(max, log);
  const top = log ? ticks.at(-1)! : Math.max(ticks.at(-1)!, max);
  const scale = (v: number) => (log ? (v <= 1 ? 0 : Math.log10(v) / Math.log10(top)) : v / top);
  const shown = hover ?? null;

  return (
    <div>
      <div className="flex gap-2">
        {/* Axis labels carry the values that aren't labelled directly */}
        <div className="relative w-10 shrink-0 text-right text-[10px] text-room-muted tabular-nums" style={{ height }} aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${scale(t) * 100}%` }}>
              {log ? `10^${Math.round(Math.log10(t))}`.replace("10^0", "1").replace(/\^(\d+)/, (_, e) => toSuperscript(e)) : compact(t)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1" style={{ height }}>
          {ticks.map((t) => (
            <div key={t} aria-hidden className="absolute inset-x-0 h-px bg-panel-edge" style={{ bottom: `${scale(t) * 100}%` }} />
          ))}
          <fieldset className="absolute inset-0 m-0 flex min-w-0 items-end justify-around gap-[2px] border-0 p-0">
            <legend className="sr-only">{title}</legend>
            {data.map((d, i) => (
              <button
                key={d.label}
                type="button"
                aria-label={`${d.label}: ${format(d.value)}`}
                aria-pressed={onPick ? highlight === i : undefined}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => onPick?.(i)}
                // The hit area is the whole column slot, not just the painted bar
                className={cn("group relative flex h-full max-w-8 flex-1 items-end justify-center outline-none", !onPick && "cursor-default")}
              >
                <span
                  className={cn(
                    "block w-full max-w-6 rounded-t-[4px] transition-[height,background-color] duration-300 motion-reduce:transition-none",
                    i === highlight ? "bg-chart-accent" : "bg-chart-mark",
                    "group-hover:brightness-110 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-room-ink",
                  )}
                  style={{ height: `${Math.max(scale(d.value) * 100, d.value > 0 ? 1 : 0)}%` }}
                />
                {labels[i] && (
                  <span
                    className="pointer-events-none absolute text-[10px] font-semibold whitespace-nowrap text-room-ink"
                    style={{ bottom: `calc(${scale(d.value) * 100}% + 4px)` }}
                  >
                    {labels[i]}
                  </span>
                )}
              </button>
            ))}
          </fieldset>
          {shown !== null && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-panel-edge bg-room px-2.5 py-1.5 text-xs shadow-lg"
              style={{
                left: `${((shown + 0.5) / data.length) * 100}%`,
                bottom: `calc(${scale(data[shown].value) * 100}% + 10px)`,
              }}
            >
              <span className="block font-semibold text-room-ink">{format(data[shown].value)}</span>
              <span className="block text-room-muted">{data[shown].label}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-1 ml-12 flex justify-around gap-[2px] text-[10px] text-room-muted" aria-hidden>
        {data.map((d, i) => (
          <span key={d.label} className={cn("max-w-8 flex-1 text-center", i === highlight && "font-bold text-room-ink")}>
            {d.label}
          </span>
        ))}
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs text-room-muted hover:text-room-ink">Show as a table</summary>
        <table className="mt-2 w-full text-left text-xs tabular-nums">
          <caption className="sr-only">{title}</caption>
          <thead className="text-room-muted">
            <tr>
              <th className="py-1 font-semibold">Item</th>
              <th className="py-1 text-right font-semibold">{valueHeading}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.label} className={cn("border-t border-panel-edge", i === highlight && "font-bold")}>
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right">{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function toSuperscript(digits: string) {
  return digits.replace(/\d/g, (d) => SUPERSCRIPT[Number(d)]);
}
