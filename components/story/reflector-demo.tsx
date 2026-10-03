"use client";

import { useState } from "react";
import { TryIt } from "@/components/story/try-it";
import { Demo } from "@/components/ui/demo";
import { ALPHABET, REFLECTORS } from "@/lib/enigma";
import { cn } from "@/lib/cn";

const WIRING = REFLECTORS.B;
const R = 120;
const C = 150;
// Rounded because the server and the browser disagree in the last decimal place of
// cos and sin, and React refuses markup that differs between the two
const round = (n: number) => Math.round(n * 100) / 100;
const at = (i: number, r = R) => {
  const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
  return { x: round(C + r * Math.cos(angle)), y: round(C + r * Math.sin(angle)) };
};

/**
 * Reflector B as a ring of 26 letters joined in 13 pairs. Pick a letter to see
 * its partner. Because every letter is paired with another, never itself, a
 * key can never light its own lamp.
 */
export function ReflectorDemo() {
  const [picked, setPicked] = useState(4);
  const partner = WIRING.charCodeAt(picked) - 65;
  const pairs = ALPHABET.split("")
    .map((_, i) => [i, WIRING.charCodeAt(i) - 65] as const)
    .filter(([a, b]) => a < b);

  return (
    <Demo title="The reflector" prompt="Pick a letter">
      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <svg
          viewBox="0 0 300 300"
          className="mx-auto w-full max-w-xs"
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG is the image
          role="img"
          aria-label={`Reflector B pairs ${ALPHABET[picked]} with ${ALPHABET[partner]}`}
        >
          <circle cx={C} cy={C} r={R + 18} className="fill-case" />
          {pairs.map(([a, b]) => {
            const lit = a === picked || b === picked;
            const p = at(a, R - 12);
            const q = at(b, R - 12);
            return (
              <path
                key={a}
                d={`M ${p.x} ${p.y} Q ${C} ${C} ${q.x} ${q.y}`}
                fill="none"
                stroke={lit ? "var(--lamp-on)" : "var(--case-muted)"}
                strokeOpacity={lit ? 1 : 0.4}
                strokeWidth={lit ? 3 : 1}
              />
            );
          })}
          {ALPHABET.split("").map((ch, i) => {
            const p = at(i);
            return (
              <text
                key={ch}
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                className={cn("font-stencil text-[13px]", i === picked || i === partner ? "fill-lamp-on font-bold" : "fill-case-muted")}
              >
                {ch}
              </text>
            );
          })}
        </svg>
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-1">
            {ALPHABET.split("").map((ch, i) => (
              <button
                key={ch}
                type="button"
                aria-pressed={i === picked}
                onClick={() => setPicked(i)}
                className={cn(
                  "grid size-7 place-items-center rounded-full font-stencil text-sm font-bold",
                  i === picked ? "bg-brass text-brass-ink" : i === partner ? "bg-brass-soft text-room-ink" : "bg-room text-room-muted hover:text-room-ink",
                )}
              >
                {ch}
              </button>
            ))}
          </div>
          <p className="font-serif text-2xl" aria-live="polite" data-testid="reflector-pair">
            {ALPHABET[picked]} <span className="text-brass">⟷</span> {ALPHABET[partner]}
          </p>
          <div className="space-y-3 font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
            <p>
              After the third rotor the current meets the reflector, a wheel that never turns. It joins the letters in
              thirteen fixed pairs and sends the current back through all three rotors by a different route.
            </p>
            <p>
              It was a clever trick. Whatever the rotors do, the route from A to G is the route from G to A run backwards,
              so the same settings that encipher a message also decipher it, and one machine does both jobs.
            </p>
            <p>
              It was also the flaw that sank the machine. No letter is paired with itself, so <em>no letter can ever be
              enciphered as itself</em>. Knowing what a letter can&rsquo;t be turned out to be enough to start breaking it.
            </p>
          </div>
        </div>
      </div>
      <TryIt lesson="never-itself">Prove it on the machine</TryIt>
    </Demo>
  );
}
