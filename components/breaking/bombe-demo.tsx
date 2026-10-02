"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { MenuGraph } from "@/components/crib/menu-graph";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { menu } from "@/lib/crib";
import { ALPHABET, type Settings } from "@/lib/enigma";
import { PRACTICE_CIPHERTEXT, PRACTICE_CRIB, PRACTICE_CRIB_AT, PRACTICE_KEY } from "@/lib/messages";
import { findLoop, followLoop, survivors } from "@/lib/story/bombe";
import { cn } from "@/lib/cn";

const LINKS = menu(PRACTICE_CIPHERTEXT, PRACTICE_CRIB, PRACTICE_CRIB_AT);
const LOOP = findLoop(LINKS)!;

/**
 * Turing's test on a real loop from the practice crib. Choose a rotor setting
 * and a guess for one letter's plug, and follow the guess round the loop. At a
 * wrong setting it nearly always contradicts itself; that contradiction, found
 * electrically for every setting in turn, is what the Bombe searched for.
 */
export function BombeDemo() {
  const [right, setRight] = useState(0);
  const [guess, setGuess] = useState(0);
  const settings: Settings = useMemo(
    () => ({ ...PRACTICE_KEY, positions: [PRACTICE_KEY.positions[0], PRACTICE_KEY.positions[1], right] }),
    [right],
  );
  const { chain, consistent } = followLoop(settings, LOOP, guess);
  const alive = survivors(settings, LOOP);
  const start = LOOP[0].a;

  return (
    <Demo title="Turing's loop" prompt="Test a setting">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Slider label="Right rotor starts at" value={right} min={0} max={25} onChange={setRight} format={(v) => ALPHABET[v]} />
          <Slider label={`Guess: ${start} is plugged to`} value={guess} min={0} max={25} onChange={setGuess} format={(v) => ALPHABET[v]} />
          <div className="rounded-lg bg-room p-3">
            <MenuGraph links={LINKS} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">Following the loop</p>
          <ol className="mt-3 flex flex-col gap-2" data-testid="loop-chain">
            {LOOP.map((link, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="font-type">
                  {chain[i].letter}↔{chain[i].plug}
                </span>
                <ArrowRight className="size-3.5 text-room-muted" aria-hidden />
                <span className="text-room-muted">
                  at letter {link.step + 1} the rotors turn {chain[i].plug} into {chain[i + 1].plug}, so
                </span>
                <span className="font-type">
                  {chain[i + 1].letter}↔{chain[i + 1].plug}
                </span>
              </li>
            ))}
          </ol>
          <p
            className={cn("mt-4 flex items-center gap-2 font-semibold", consistent ? "text-signal-in" : "text-danger")}
            data-testid="loop-verdict"
          >
            {consistent ? <Check className="size-4" /> : <X className="size-4" />}
            {consistent
              ? `Back at ${start}, plugged to ${chain.at(-1)!.plug}: the guess holds.`
              : `Back at ${start}, but now plugged to ${chain.at(-1)!.plug}, not ${ALPHABET[guess]}: a contradiction.`}
          </p>

          <p className="mt-6 text-[11px] font-semibold tracking-widest text-room-muted uppercase">
            Every guess at this setting: {alive.length} of 26 survive
          </p>
          <fieldset className="mt-2 grid grid-cols-13 gap-1">
            <legend className="sr-only">Try any guess</legend>
            {ALPHABET.split("").map((ch, i) => (
              <button
                key={ch}
                type="button"
                onClick={() => setGuess(i)}
                aria-pressed={i === guess}
                aria-label={`${start} plugged to ${ch}: ${alive.includes(ch) ? "survives" : "contradicts itself"}`}
                className={cn(
                  "grid h-7 place-items-center rounded-sm font-stencil text-xs font-bold",
                  alive.includes(ch) ? "bg-signal-in text-white" : "bg-room text-room-muted",
                  i === guess && "outline-2 outline-room-ink",
                )}
              >
                {ch}
              </button>
            ))}
          </fieldset>
        </div>
      </div>
      <div className="mt-8 max-w-2xl space-y-3 font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
        <p>
          A crib says which plain letter became which cipher letter at each step. Guess one plugboard pair and the crib
          forces the next, and the next, all the way round a loop and back to the start. If the guess comes back changed,
          it was wrong, or the rotors were.
        </p>
        <p>
          At a wrong setting nearly every guess contradicts itself. Somewhere among these 26 settings is the one the
          message was really sent on; find it, and the guesses that survive point to the real plugboard. The Bombe did
          this electrically for all 26 guesses at once, ran through every setting of a rotor order in about twenty
          minutes, and stopped only when a setting survived. Its operators then tested each stop by hand.
        </p>
      </div>
    </Demo>
  );
}
