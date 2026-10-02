"use client";

import { useState } from "react";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { duration, plugboardWays, roughly, rotorOrders } from "@/lib/keyspace";

const SPEEDS = [
  { rate: 1n, label: "one a second" },
  { rate: 1_000n, label: "a thousand a second" },
  { rate: 1_000_000n, label: "a million a second" },
  { rate: 1_000_000_000n, label: "a billion a second" },
  { rate: 1_000_000_000_000n, label: "a trillion a second" },
];

/**
 * How many ways an operator could set the machine, built up from its parts,
 * and how long trying them all would take. Every slider multiplies the total.
 */
export function KeyspaceDemo() {
  const [box, setBox] = useState(5);
  const [cables, setCables] = useState(10);
  const [rings, setRings] = useState(false);
  const [speed, setSpeed] = useState(2);

  const orders = rotorOrders(box);
  const starts = 26n ** 3n;
  const plugs = plugboardWays(cables);
  // Only the middle and right rings change anything; the left ring just relabels the left rotor
  const ringFactor = rings ? 676n : 1n;
  const keys = orders * starts * plugs * ringFactor;
  const time = keys / SPEEDS[speed].rate;

  const factors = [
    { label: "rotor orders", value: orders },
    { label: "start positions", value: starts },
    { label: "plugboard wirings", value: plugs },
    ...(rings ? [{ label: "ring settings that matter", value: ringFactor }] : []),
  ];

  return (
    <Demo title="How many keys?" prompt="Build up the machine">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Slider
            label="Rotors in the box"
            value={box}
            min={3}
            max={8}
            onChange={setBox}
            format={(v) => `${v} rotors`}
            marks={[
              { value: 5, label: "army" },
              { value: 8, label: "navy" },
            ]}
          />
          <Slider label="Plugboard cables" value={cables} min={0} max={13} onChange={setCables} format={(v) => `${v} cables`} marks={[{ value: 10, label: "army" }]} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={rings} onChange={(e) => setRings(e.target.checked)} className="size-4 accent-brass" />
            Count the ring settings too
          </label>
          <Slider
            label="An attacker tries"
            value={speed}
            min={0}
            max={SPEEDS.length - 1}
            onChange={setSpeed}
            format={(v) => SPEEDS[v].label}
          />
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">Possible keys</p>
            <p className="mt-1 font-sans text-4xl font-semibold break-all sm:text-5xl" data-testid="keyspace-total">
              {keys.toLocaleString("en-GB")}
            </p>
            <p className="mt-1 text-sm text-room-muted">{roughly(keys)}</p>
          </div>
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-type text-sm text-room-muted">
            {factors.map((f, i) => (
              <span key={f.label}>
                {i > 0 && <span className="mr-2">×</span>}
                <span className="text-room-ink">{f.value.toLocaleString("en-GB")}</span> {f.label}
              </span>
            ))}
          </p>
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">To try them all</p>
            <p className="mt-1 font-sans text-3xl font-semibold" data-testid="keyspace-time">
              {duration(time)}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-6 max-w-2xl font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
        Even at a million keys a second, a speed no machine of the 1940s came near, the army&rsquo;s Enigma would take
        millions of years to try exhaustively, and a new key came into force every day. Nobody ever broke Enigma by trying
        every key. It was broken by finding ways to avoid trying most of them.
      </p>
    </Demo>
  );
}
