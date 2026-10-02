"use client";

import { useState } from "react";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { indexOfCoincidence } from "@/lib/codebreaker";
import { partlyRight } from "@/lib/story/ioc";
import { cn } from "@/lib/cn";

const TEXT =
  "ANXDASXOBERKOMMANDOXDERXWEHRMACHTXDIEXUEBUNGXDERXDRITTENXDIVISIONXBEGINNTXAMXMONTAGXUMXSECHSXUHRXDIEXTRUPPENXSAMMELNXSICHXIMXRAUMXNOERDLICHXDERXSTADT";
const RANDOM = 1 / 26;
const GERMAN = indexOfCoincidence(Uint8Array.from(TEXT, (c) => c.charCodeAt(0) - 65));
const numbers = (t: string) => Uint8Array.from(t, (c) => c.charCodeAt(0) - 65);

/**
 * The index of coincidence: the chance that two letters picked from a text are
 * the same. Random letters match about one time in 26; German, heavy with E and
 * N, about twice as often. A rotor setting that gets even part of a message
 * right lifts it measurably, which is how the search tells nearly right from wrong.
 */
export function IocDemo() {
  const [share, setShare] = useState(30);
  const text = partlyRight(TEXT, share / 100);
  const ioc = indexOfCoincidence(numbers(text));
  const at = (v: number) => `${Math.min(100, Math.max(0, ((v - 0.03) / (0.085 - 0.03)) * 100))}%`;

  return (
    <Demo title="Index of coincidence" prompt="How much is right?">
      <Slider label="Letters that are right" value={share} min={0} max={100} step={5} onChange={setShare} format={(v) => `${v}%`} />
      <p className="mt-4 font-type text-sm leading-relaxed break-all" aria-label="The text with some letters scrambled">
        {text.split("").map((ch, i) => (
          <span key={i} className={cn(ch === TEXT[i] ? "text-room-ink" : "text-room-muted/50")}>
            {ch}
          </span>
        ))}
      </p>
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">Index of coincidence</span>
          <span className="font-sans text-2xl font-semibold tabular-nums" data-testid="ioc-value">
            {ioc.toFixed(4)}
          </span>
        </div>
        <div className="relative mt-2 h-2 rounded-full bg-panel-edge">
          <div className="absolute inset-y-0 left-0 rounded-full bg-chart-accent transition-[width] motion-reduce:transition-none" style={{ width: at(ioc) }} />
          {[
            { v: RANDOM, label: "random letters" },
            { v: GERMAN, label: "German" },
          ].map((m) => (
            <div key={m.label} className="absolute -top-1 h-4 w-px bg-room-ink/60" style={{ left: at(m.v) }}>
              <span className="absolute top-4 -translate-x-1/2 text-[10px] whitespace-nowrap text-room-muted">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-10 max-w-2xl font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
        Try a rotor setting with no plugboard, and the letters that happen to pass unplugged come out right. Even a third of
        the text being right lifts the score above random. Score all 27 million settings this way and the true one is
        usually among the best few hundred. With ten cables, though, only six letters pass unplugged, the lift all but
        vanishes, and the true setting drowns among the lucky wrong ones.
      </p>
    </Demo>
  );
}
