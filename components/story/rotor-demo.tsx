"use client";

import { useState } from "react";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { ALPHABET, ROTORS } from "@/lib/enigma";
import { cn } from "@/lib/cn";

const WIRING = ROTORS.I.wiring;
const ROW = 16;
const TOP = 24;
const LEFT = 36;
const RIGHT = 244;

/** Where contact `c` comes out of rotor I when the rotor is turned `p` places. */
const through = (c: number, p: number) => (((WIRING.charCodeAt((c + p) % 26) - 65 - p) % 26) + 26) % 26;

/**
 * One rotor on its own: 26 contacts in, 26 out, and the wires between. Turn
 * it and every wire shifts, so the same key comes out somewhere else.
 */
export function RotorDemo() {
  const [position, setPosition] = useState(0);
  const [letter, setLetter] = useState(0);
  const [typed, setTyped] = useState<{ position: number; out: number }[]>([]);
  const out = through(letter, position);
  const y = (i: number) => TOP + i * ROW + ROW / 2;

  const type = () => {
    // A key press turns the rotor first, then the current flows
    const next = (position + 1) % 26;
    setPosition(next);
    setTyped((t) => [...t, { position: next, out: through(letter, next) }].slice(-8));
  };

  return (
    <Demo title="One rotor" prompt="Turn it, pick a letter, press the key">
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <svg
          viewBox={`0 0 280 ${TOP + ROW * 26 + 8}`}
          className="mx-auto w-full max-w-xs"
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG is the image
          role="img"
          aria-label={`Rotor I turned to ${ALPHABET[position]}: ${ALPHABET[letter]} goes in and ${ALPHABET[out]} comes out`}
        >
          <text x={LEFT} y={12} textAnchor="middle" className="fill-room-muted text-[9px] font-semibold tracking-widest">IN</text>
          <text x={RIGHT} y={12} textAnchor="middle" className="fill-room-muted text-[9px] font-semibold tracking-widest">OUT</text>
          <rect x={LEFT + 14} y={TOP - 4} width={RIGHT - LEFT - 28} height={ROW * 26 + 8} rx={10} className="fill-case" />
          {ALPHABET.split("").map((_, i) => {
            const to = through(i, position);
            const lit = i === letter;
            return (
              <path
                key={i}
                d={`M ${LEFT + 14} ${y(i)} C ${(LEFT + RIGHT) / 2} ${y(i)}, ${(LEFT + RIGHT) / 2} ${y(to)}, ${RIGHT - 14} ${y(to)}`}
                fill="none"
                stroke={lit ? "var(--lamp-on)" : "var(--case-muted)"}
                strokeOpacity={lit ? 1 : 0.35}
                strokeWidth={lit ? 2.5 : 1}
              />
            );
          })}
          {ALPHABET.split("").map((ch, i) => (
            <g key={ch}>
              <text x={LEFT} y={y(i) + 4} textAnchor="middle" className={cn("font-stencil text-[12px]", i === letter ? "fill-brass font-bold" : "fill-room-muted")}>
                {ch}
              </text>
              <text x={RIGHT} y={y(i) + 4} textAnchor="middle" className={cn("font-stencil text-[12px]", i === out ? "fill-brass font-bold" : "fill-room-muted")}>
                {ch}
              </text>
            </g>
          ))}
        </svg>

        <div className="flex flex-col gap-6">
          <Slider label="Rotor turned to" value={position} min={0} max={25} onChange={setPosition} format={(v) => ALPHABET[v]} />
          <div>
            <p className="mb-2 text-[11px] font-semibold tracking-widest text-room-muted uppercase">Key</p>
            <div className="flex flex-wrap gap-1">
              {ALPHABET.split("").map((ch, i) => (
                <button
                  key={ch}
                  type="button"
                  aria-pressed={i === letter}
                  onClick={() => {
                    setLetter(i);
                    setTyped([]);
                  }}
                  className={cn(
                    "grid size-7 place-items-center rounded-full font-stencil text-sm font-bold",
                    i === letter ? "bg-brass text-brass-ink" : "bg-room text-room-muted hover:text-room-ink",
                  )}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <p className="font-serif text-lg">
            With the rotor at <strong>{ALPHABET[position]}</strong>, <strong>{ALPHABET[letter]}</strong> goes in and{" "}
            <strong className="text-brass">{ALPHABET[out]}</strong> comes out.
          </p>
          <div>
            <button type="button" onClick={type} className="rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room">
              Press {ALPHABET[letter]}
            </button>
            {typed.length > 0 && (
              <p className="mt-3 font-type text-lg tracking-widest" aria-live="polite" data-testid="rotor-typed">
                {typed.map((t) => ALPHABET[t.out]).join(" ")}
              </p>
            )}
            <p className="mt-2 text-sm text-room-muted">
              Each press turns the rotor one place before the current flows, so pressing the same key again and again gives a
              different letter each time. One rotor still repeats itself every 26 letters, which is why Enigma used three.
            </p>
          </div>
        </div>
      </div>
    </Demo>
  );
}
