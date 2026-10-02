"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { RotorWindow } from "@/components/machine/rotor-window";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { DEFAULT_SETTINGS, encipher, lettersToPositions, press, type Settings } from "@/lib/enigma";

const MESSAGE = "ANGRIFFXIMXMORGENGRAUEN";
const START: Settings = { ...DEFAULT_SETTINGS, rotors: ["IV", "II", "V"], positions: lettersToPositions("BLQ"), plugboard: ["AV", "BS", "CG", "DL", "FU"] };

/** The opening: a machine typing an order, one letter at a time, rotors stepping and a lamp lighting for each. */
export function Hero() {
  const reduced = usePrefersReducedMotion();
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reduced) return;
    // Type a letter, pause at the end, then start the message again
    const tick = setInterval(() => setTyped((n) => (n >= MESSAGE.length + 6 ? 0 : n + 1)), 260);
    return () => clearInterval(tick);
  }, [reduced]);

  // Without motion, the finished line
  const count = reduced ? MESSAGE.length : Math.min(typed, MESSAGE.length);
  const sent = encipher(START, MESSAGE.slice(0, count));
  const last = count > 0 ? press({ ...START, positions: encipher(START, MESSAGE.slice(0, count - 1)).positions }, MESSAGE[count - 1]) : null;

  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center py-16">
      <p className="text-xs font-semibold tracking-[0.3em] text-brass uppercase">1918 – 1945</p>
      <h1 id="hero-title" className="mt-4 font-stencil text-[clamp(4rem,16vw,11rem)] leading-[0.85] font-bold tracking-[0.12em]">
        ENIGMA
      </h1>
      <p className="mt-6 max-w-xl font-serif text-xl leading-relaxed text-room-ink/90 sm:text-2xl">
        The machine Germany trusted with its secrets, how it worked, and how it was broken.
      </p>

      <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="crinkle flex w-fit items-end gap-3 rounded-lg border border-case-edge px-4 py-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <RotorWindow key={i} label={START.rotors[i]} position={sent.positions[i]} />
          ))}
          <div
            className="ml-2 grid size-12 place-items-center rounded-full border-2 border-metal-dark font-stencil text-2xl font-bold transition-colors duration-100 motion-reduce:transition-none"
            style={{
              background: last ? "var(--lamp-on)" : "var(--lamp-off)",
              color: last ? "var(--lamp-ink-on)" : "var(--lamp-ink-off)",
              boxShadow: last ? "0 0 22px 6px var(--lamp-glow)" : "none",
            }}
          >
            {last?.output ?? "·"}
          </div>
        </div>
        <dl className="font-type text-base leading-snug break-all sm:text-lg" aria-label="An order being enciphered">
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 font-sans text-[11px] font-semibold tracking-widest text-room-muted uppercase">Typed</dt>
            <dd>{MESSAGE.slice(0, count).replace(/X/g, " ") || " "}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 font-sans text-[11px] font-semibold tracking-widest text-room-muted uppercase">Sent</dt>
            <dd className="text-brass">{sent.text || " "}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-3 text-sm text-room-muted">&ldquo;Attack at dawn&rdquo;, as an operator would have typed it, with X for each space.</p>

      <div className="mt-12 flex flex-wrap gap-3">
        <a href="#what" className="inline-flex items-center gap-2 rounded-full bg-room-ink px-5 py-2.5 text-sm font-semibold text-room">
          Read the story <ArrowDown className="size-4" />
        </a>
        <Link href="/machine" className="inline-flex items-center rounded-full border border-panel-edge px-5 py-2.5 text-sm font-semibold hover:border-brass">
          Try the machine
        </Link>
      </div>
    </section>
  );
}
