"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { ALPHABET } from "@/lib/enigma";
import { keySheet, settingsFor } from "@/lib/story/keysheet";
import { characteristic, cycles, indicators, pairing, partialPairing } from "@/lib/story/rejewski";
import { cn } from "@/lib/cn";

const SHEET = keySheet();
const NAMES = ["1st → 4th", "2nd → 5th", "3rd → 6th"] as const;

/**
 * Rejewski's characteristic, rebuilt from a simulated morning's traffic. As
 * indicators come in, the letter pairs fill in until the cycles close. The
 * cycle lengths are the fingerprint of the day's rotor setting, and the
 * plugboard can't touch them.
 */
export function RejewskiDemo() {
  const [day, setDay] = useState(0);
  const [messages, setMessages] = useState(120);
  const [cables, setCables] = useState(10);
  const key = SHEET[day];
  const settings = useMemo(() => ({ ...settingsFor(key, key.basic), plugboard: key.plugboard.slice(0, cables) }), [key, cables]);
  const unplugged = useMemo(() => ({ ...settings, plugboard: [] }), [settings]);
  const seen = useMemo(() => indicators(settings, messages, day + 1), [settings, messages, day]);

  return (
    <Demo title="Rejewski's fingerprint" prompt="Intercept a morning's traffic">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Slider label="Day of the month" value={day} min={0} max={SHEET.length - 1} onChange={setDay} format={(v) => `Day ${v + 1}`} />
          <Slider label="Messages intercepted" value={messages} min={0} max={150} onChange={setMessages} format={(v) => `${v}`} />
          <Slider label="Cables plugged" value={cables} min={0} max={10} onChange={setCables} format={(v) => `${v} cables`} />
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">First indicators of the day</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 font-type text-sm">
              {seen.slice(0, 8).map((ind, i) => (
                <li key={i}>
                  <span className="text-signal-in">{ind[0]}</span>
                  {ind.slice(1, 3)} <span className="text-signal-in">{ind[3]}</span>
                  {ind.slice(4)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          {([0, 1, 2] as const).map((first) => {
            const known = partialPairing(seen, first);
            const found = cycles(known);
            const complete = known.every((x) => x >= 0);
            const truth = characteristic(pairing(unplugged, first));
            return (
              <div key={first} data-testid={`pairing-${first}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="font-semibold">
                    Letter {NAMES[first]}
                  </h4>
                  <span className="text-xs text-room-muted tabular-nums">{known.filter((x) => x >= 0).length} of 26 letters known</span>
                </div>
                {/* The fingerprint as a bar: each cycle a segment as wide as it is long */}
                <div className="mt-2 flex h-3 gap-[2px] overflow-hidden rounded-full bg-panel-edge" aria-hidden>
                  {found.map((c, i) => (
                    <span key={i} className={i % 2 ? "bg-chart-mark" : "bg-chart-accent"} style={{ width: `${(c.length / 26) * 100}%` }} />
                  ))}
                </div>
                <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 font-type text-sm">
                  {found.length === 0 ? (
                    <span className="text-room-muted">No cycle closes yet. Intercept more messages.</span>
                  ) : (
                    found.map((c, i) => (
                      <span key={i} className={cn("rounded-sm px-1", i % 2 ? "bg-chart-mark/20" : "bg-chart-accent/20")}>
                        ({c.map((x) => ALPHABET[x]).join("")})
                      </span>
                    ))
                  )}
                </p>
                {complete && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm" data-testid={`fingerprint-${first}`}>
                    <span className="font-semibold">Fingerprint {characteristic(known).join(" ")}</span>
                    {characteristic(known).join() === truth.join() && (
                      <span className="inline-flex items-center gap-1 text-xs text-signal-in">
                        <Check className="size-3.5" /> same with no cables at all
                      </span>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-8 max-w-2xl space-y-3 font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
        <p>
          Each indicator&rsquo;s 1st and 4th letters hide the same letter, enciphered three key presses apart. A morning of
          messages ties every letter to another, and following those ties round always comes back where it started, in
          cycles. The cycles always come in pairs of equal length.
        </p>
        <p>
          Now plug or unplug cables. The letters in the cycles change, but the lengths never do: the plugboard only renames
          letters, and renaming can&rsquo;t change the shape. The lengths depend on the rotors alone. Rejewski&rsquo;s team
          catalogued them for every rotor order and position, so each morning they could look the day&rsquo;s rotors up,
          then work out the plugboard by hand.
        </p>
      </div>
    </Demo>
  );
}
