"use client";

import { useMemo, useState } from "react";
import { ColumnChart } from "@/components/ui/column-chart";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { climbHistory } from "@/lib/codebreaker";
import { CODEBREAKER_PRACTICE, SIX_CABLE_KEY } from "@/lib/messages";

/**
 * The plugboard climb, one step at a time. With the right rotors found, start
 * with no cables, try every pair of letters, keep the cable that makes the text
 * look most like German, and repeat until no cable helps.
 */
export function ClimbDemo() {
  const steps = useMemo(() => climbHistory(CODEBREAKER_PRACTICE[0].ciphertext, { ...SIX_CABLE_KEY, plugboard: [] }, "german"), []);
  const [at, setAt] = useState(0);
  const step = steps[at];
  // How German it reads, scaled between where the climb started and where it finished
  const first = steps[0].score;
  const last = steps.at(-1)!.score;
  const percent = (s: number) => Math.round(((s - first) / (last - first)) * 100);

  return (
    <Demo title="Climbing to the plugboard" prompt="Step through the climb">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Slider
            label="Step"
            value={at}
            min={0}
            max={steps.length - 1}
            onChange={setAt}
            format={(v) => (v === 0 ? "no cables" : `${v} ${v === 1 ? "cable" : "cables"}`)}
          />
          <ul className="flex min-h-8 flex-wrap gap-1.5" aria-label="Cables so far">
            {step.plugboard.map((pair) => (
              <li key={pair} className="rounded-sm bg-cable px-2 py-1 font-stencil text-sm font-bold tracking-widest text-white">
                {pair[0]}–{pair[1]}
              </li>
            ))}
          </ul>
          <ColumnChart
            title="How German the text reads after each step"
            data={steps.map((s, i) => ({ label: String(i), value: percent(s.score) }))}
            highlight={at}
            onPick={setAt}
            format={(v) => `${v}% of the way`}
            valueHeading="Progress"
            height={120}
          />
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">The message so far</p>
          <p className="mt-2 font-type text-lg leading-snug break-all" data-testid="climb-text">
            {step.text.replace(/X/g, " ")}
          </p>
        </div>
      </div>
      <p className="mt-8 max-w-2xl font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
        Each step tries all 325 ways to add or move a cable and keeps the best. Scored on how often each pair of letters
        appears in German, the text sharpens a little with every cable, words surfacing out of the noise, until the sixth
        cable reads it clean and no change helps any more. Run this from each of the few hundred best rotor settings, and
        the right one is the one that ends in German.
      </p>
    </Demo>
  );
}
