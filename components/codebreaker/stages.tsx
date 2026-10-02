"use client";

import { Check, Loader2 } from "lucide-react";
import { ALPHABET } from "@/lib/enigma";
import type { Candidate } from "@/lib/codebreaker";
import { cn } from "@/lib/cn";

const RANDOM_IOC = 1 / 26;
const GERMAN_IOC = 0.076;

const letters = (numbers: number[]) => numbers.map((n) => ALPHABET[n]).join(" ");

/** Index of coincidence on a scale from random letters to German. */
function Gauge({ value }: { value: number }) {
  const at = (v: number) => `${Math.min(100, Math.max(0, ((v - 0.03) / (0.08 - 0.03)) * 100))}%`;
  return (
    <div className="mt-3">
      <div className="relative h-2 rounded-full bg-paper-ink/10">
        <div className="absolute inset-y-0 left-0 rounded-full bg-signal-in" style={{ width: at(value) }} />
        {[
          { v: RANDOM_IOC, label: "random" },
          { v: GERMAN_IOC, label: "German" },
        ].map((mark) => (
          <div key={mark.label} className="absolute -top-1 h-4 w-px bg-paper-ink/50" style={{ left: at(mark.v) }}>
            <span className="absolute top-4 -translate-x-1/2 text-[10px] whitespace-nowrap text-paper-muted">{mark.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Stage({
  number,
  title,
  state,
  children,
}: {
  number: number;
  title: string;
  state: "waiting" | "running" | "done";
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-label={`Stage ${number}: ${title}`}
      className={cn("rounded-sm bg-paper p-4 text-paper-ink shadow-md transition-opacity", state === "waiting" && "opacity-50")}
    >
      <h2 className="flex items-center gap-2 font-semibold">
        <span className="grid size-6 place-items-center rounded-full bg-case text-xs text-case-ink">
          {state === "done" ? <Check className="size-3.5" /> : state === "running" ? <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" /> : number}
        </span>
        {title}
      </h2>
      {children && <div className="mt-3">{children}</div>}
    </section>
  );
}

export function RotorStage({ done, total, best }: { done: number; total: number; best: Candidate[] }) {
  // Every start position for all three rotors, and every point the middle rotor might first step
  const perOrder = 26 ** 4;
  return (
    <>
      <p className="text-sm text-paper-muted">
        With the plugboard left empty, every rotor order and start position. The right rotors leave the text slightly
        less random, and the index of coincidence picks that up.
      </p>
      <progress
        value={done}
        max={total}
        aria-label="Rotor orders tried"
        className="mt-3 block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-paper-ink/10 [&::-moz-progress-bar]:bg-paper-ink [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-paper-ink"
      />
      <p className="mt-1.5 text-xs text-paper-muted tabular-nums">
        {(done * perOrder).toLocaleString("en-GB")} of {(total * perOrder).toLocaleString("en-GB")} settings · {done} of {total} rotor orders
      </p>
      {best.length > 0 && (
        <>
          <Gauge value={best[0].ioc} />
          <table className="mt-7 w-full text-left text-sm tabular-nums">
            <thead className="text-[11px] tracking-widest text-paper-muted uppercase">
              <tr>
                <th className="pb-1 font-semibold">Rotors</th>
                <th className="pb-1 font-semibold">Start</th>
                <th className="pb-1 text-right font-semibold">Score</th>
              </tr>
            </thead>
            <tbody className="font-type">
              {best.map((c, i) => (
                <tr key={i} className={cn(i === 0 && "font-bold")}>
                  <td>{c.rotors.join(" ")}</td>
                  <td>{letters(c.positions)}</td>
                  <td className="text-right">{c.ioc.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-paper-muted">
            The right answer rarely tops this list. It only has to make the shortlist of the best few hundred, and the
            plugboard search sorts them out.
          </p>
        </>
      )}
    </>
  );
}

/** German as it was sent, with X between words; put the spaces back to read it. */
export function readable(text: string, german: boolean) {
  return german ? text.replace(/X/g, " ") : text;
}

export function PlugStage({
  candidate,
  of,
  plugboard,
  text,
  german,
}: {
  candidate: number;
  of: number;
  plugboard: string[];
  text: string;
  german: boolean;
}) {
  return (
    <>
      <p className="text-sm text-paper-muted">
        For each of the {of} best rotor settings, plug in whichever cable makes the text look most like the language,
        and keep going until no cable helps. Showing the best so far, after {candidate} of {of}.
      </p>
      <ul className="mt-3 flex min-h-8 flex-wrap gap-1.5" aria-label="Cables found">
        {plugboard.map((pair) => (
          <li key={pair} className="rounded-sm bg-cable px-2 py-1 font-stencil text-sm font-bold tracking-widest text-white">
            {pair[0]}–{pair[1]}
          </li>
        ))}
      </ul>
      <p className="mt-3 line-clamp-4 font-type text-base break-all" data-testid="emerging">
        {readable(text, german)}
      </p>
    </>
  );
}
