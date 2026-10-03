"use client";

import { useState } from "react";
import { ColumnChart } from "@/components/ui/column-chart";
import { TryIt } from "@/components/story/try-it";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { plugboardWays, roughly } from "@/lib/keyspace";

const CABLES = Array.from({ length: 14 }, (_, n) => n);
const WAYS = CABLES.map((n) => plugboardWays(n));
const MOST = WAYS.reduce((best, w, n) => (w > WAYS[best] ? n : best), 0);
const EXACT = new Map(WAYS.map((w) => [Number(w), w.toLocaleString("en-GB")]));

/**
 * How many ways the plugboard can be wired for each number of cables. The
 * count rises steeply, peaks at eleven, then falls: with more cables there are
 * fewer letters left over to choose between.
 */
export function PlugboardDemo() {
  const [cables, setCables] = useState(10);
  const ways = WAYS[cables];

  return (
    <Demo title="The plugboard" prompt="Add cables">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Slider
            label="Cables"
            value={cables}
            min={0}
            max={13}
            onChange={setCables}
            format={(v) => `${v} ${v === 1 ? "cable" : "cables"}`}
            marks={[{ value: 10, label: "army" }]}
          />
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">Ways to plug them</p>
            <p className="mt-1 font-sans text-2xl font-semibold break-all text-room-ink tabular-nums sm:text-3xl" data-testid="plug-ways">
              {ways.toLocaleString("en-GB")}
            </p>
            <p className="mt-1 text-sm text-room-muted">{cables === 0 ? "Nothing plugged, nothing swapped." : roughly(ways)}</p>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Ways to plug the board, by number of cables (each line ten times the last)</h4>
          <ColumnChart
            title="Plugboard arrangements by number of cables, log scale"
            data={CABLES.map((n) => ({ label: String(n), value: Number(WAYS[n]) }))}
            highlight={cables}
            log
            // Chart values are floats; show the exact count for whichever column it is
            format={(v) => (EXACT.get(v) ?? roughly(BigInt(Math.round(v))))}
            labels={{ [MOST]: "most", 10: "army" }}
            onPick={setCables}
            valueHeading="Ways to plug"
          />
        </div>
      </div>
      <div className="mt-6 max-w-2xl space-y-3 font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
        <p>
          The plugboard on the front of the machine swaps pairs of letters with short cables, once on the way into the rotors
          and again on the way out. It added nothing a codebreaker could reconstruct from a captured machine, because it
          was rewired every day.
        </p>
        <p>
          The numbers grow fast, but not forever. Eleven cables give the most arrangements; with more, there are fewer
          spare letters left to choose between, and thirteen cables give fewer arrangements than nine. The army settled on ten.
        </p>
      </div>
      <TryIt lesson="plug">Plug a cable on the machine</TryIt>
    </Demo>
  );
}
