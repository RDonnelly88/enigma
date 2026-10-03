"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ALPHABET } from "@/lib/enigma";
import { PRACTICE_CIPHERTEXT, PRACTICE_CRIB, PRACTICE_CRIB_AT } from "@/lib/messages";
import { followLoop } from "@/lib/story/bombe";
import { LINKS, LOOP, TRUE_RIGHT, candidate } from "@/lib/story/checking";
import { MenuGraph } from "@/components/crib/menu-graph";
import { cn } from "@/lib/cn";
import { Gloss, readable } from "@/components/glossary/gloss";
import { BombeMachine, CheckingMachine } from "./bombe-machine";

const STEPS = ["What it's for", "The crib's pairs", "The plugboard problem", "A guess round a loop", "The machine", "Reading the message"];

/** A small piece of text in the typewriter face. */
const T = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("rounded-sm bg-paper px-1 font-type text-paper-ink", className)}>{children}</span>
);

/**
 * The Bombe explained one step at a time, on the practice intercept: what it
 * was for, how a crib and a loop let it test a rotor setting without knowing
 * the plugboard, the machine running, and the checking machine turning its
 * stop into a message.
 */
export function BombeWalkthrough() {
  const [step, setStep] = useState(0);
  return (
    <div className="rounded-xl border border-panel-edge bg-panel p-4 sm:p-6">
      <ol className="rail -mx-1 flex gap-1 overflow-x-auto px-1 pb-1" aria-label="Steps">
        {STEPS.map((name, i) => (
          <li key={name} className="shrink-0">
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
                i === step ? "bg-brass text-brass-ink" : i < step ? "text-room-ink" : "text-room-muted",
              )}
            >
              <span className={cn("grid size-5 place-items-center rounded-full text-[10px]", i === step ? "bg-brass-ink/15" : "bg-panel-edge")}>{i + 1}</span>
              {name}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 min-h-80" data-testid="bombe-step">
        {step === 0 && <Purpose />}
        {step === 1 && <Pairs />}
        {step === 2 && <Plugboard />}
        {step === 3 && <Loop />}
        {step === 4 && <BombeMachine />}
        {step === 5 && <CheckingMachine />}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-panel-edge pt-4">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-panel-edge px-4 py-2 text-sm font-semibold disabled:opacity-30"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <span className="text-xs text-room-muted tabular-nums">
          Step {step + 1} of {STEPS.length}
        </span>
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          disabled={step === STEPS.length - 1}
          className="inline-flex items-center gap-1.5 rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room disabled:opacity-30"
        >
          Next <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

const Prose = readable(function Prose({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl space-y-3 font-serif text-[1.05rem] leading-relaxed text-room-ink/90">{children}</div>;
});

function Purpose() {
  const flow = ["Ciphertext + a guessed word", "The Bombe", "Rotor settings + one plug pair", "Checking machine", "The message, in German"];
  return (
    <Gloss>
      <div className="flex flex-col gap-6">
        <Prose>
          <p>
            <strong>The Bombe did not decode messages.</strong> It answered one question: <em>how was the machine set today?</em>{" "}
            Which rotors, where they started, and a first clue to the plugboard. Once Bletchley had that, people read the
            messages the same way the Germans did, by typing them into a machine set up the same way.
          </p>
          <p>
            It found the setting by ruling out wrong ones, astonishingly fast, using a guessed word from one message. Here is
            the practice intercept from the crib dragger above, worked all the way to the German.
          </p>
        </Prose>
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {flow.map((f, i) => (
            <li key={f} className="flex items-center gap-2">
              <span className={cn("rounded-full border px-3 py-1.5", i === 1 ? "border-brass bg-brass/10 font-semibold" : "border-panel-edge")}>{f}</span>
              {i < flow.length - 1 && <ArrowRight className="size-4 text-room-muted" aria-hidden />}
            </li>
          ))}
        </ol>
      </div>
    </Gloss>
  );
}

function Pairs() {
  const slice = PRACTICE_CIPHERTEXT.slice(PRACTICE_CRIB_AT, PRACTICE_CRIB_AT + PRACTICE_CRIB.length);
  const loopSteps = new Set(LOOP.map((l) => l.step - PRACTICE_CRIB_AT));
  return (
    <Gloss>
      <div className="flex flex-col gap-6">
        <Prose>
          <p>
            The crib, <T>{PRACTICE_CRIB}</T>, sits under the ciphertext at letter {PRACTICE_CRIB_AT + 1}. Line them up and each
            column is a fact: <em>at this letter of the message, this plain letter became that cipher letter.</em>
          </p>
        </Prose>
        <div className="overflow-x-auto">
          <table className="font-type text-base">
            <tbody>
              {[
                ["letter", (i: number) => PRACTICE_CRIB_AT + i + 1],
                ["guessed", (i: number) => PRACTICE_CRIB[i]],
                ["became", (i: number) => slice[i]],
              ].map(([label, cell]) => (
                <tr key={label as string}>
                  <th className="pr-3 text-left font-sans text-[10px] font-semibold tracking-widest text-room-muted uppercase">{label as string}</th>
                  {[...PRACTICE_CRIB].map((_, i) => (
                    <td key={i} className={cn("px-1.5 py-0.5 text-center", loopSteps.has(i) && "bg-brass/20", label === "letter" && "font-sans text-[10px] text-room-muted")}>
                      {(cell as (i: number) => string | number)(i)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="max-w-sm rounded-lg bg-paper p-3 text-paper-ink">
          <MenuGraph links={LINKS} />
        </div>
        <Prose>
          <p>
            Drawn as a diagram, that is the menu. Five of those columns, shaded, join up into a loop: {LOOP.map((l) => `${l.a} became ${l.b} at letter ${l.step + 1}`).join(", ")}, which brings you back to {LOOP[0].a}. Keep that loop in mind.
          </p>
        </Prose>
      </div>
    </Gloss>
  );
}

function Plugboard() {
  return (
    <Gloss>
      <div className="flex flex-col gap-6">
        <Prose>
          <p>
            Why not just try every rotor setting and see which one turns {LOOP[0].a} into {LOOP[0].b} at letter {LOOP[0].step + 1}? Because of the plugboard. It swaps letters on the way into the rotors and again on the way out:
          </p>
        </Prose>
        <div className="flex flex-wrap items-center gap-2 font-type text-lg">
          <T>{LOOP[0].a}</T>
          <ArrowRight className="size-4 text-room-muted" aria-hidden />
          <span className="rounded-md border border-dashed border-danger px-2 py-1 font-sans text-xs text-danger">plugboard: ?</span>
          <ArrowRight className="size-4 text-room-muted" aria-hidden />
          <span className="rounded-md bg-case px-3 py-1 font-sans text-xs text-case-ink">rotors</span>
          <ArrowRight className="size-4 text-room-muted" aria-hidden />
          <span className="rounded-md border border-dashed border-danger px-2 py-1 font-sans text-xs text-danger">plugboard: ?</span>
          <ArrowRight className="size-4 text-room-muted" aria-hidden />
          <T>{LOOP[0].b}</T>
        </div>
        <Prose>
          <p>
            So {LOOP[0].a} could have entered the rotors as any letter at all. To test one rotor setting the obvious way, you would
            have to try it with every possible plugboard, all 150 trillion of them, and there are about a million rotor
            settings. Impossible.
          </p>
          <p>Turing&rsquo;s idea was to stop trying plugboards, and make a guess about just one letter instead.</p>
        </Prose>
      </div>
    </Gloss>
  );
}

function Loop() {
  const [wrong, setWrong] = useState(false);
  const [guess, setGuess] = useState(0);
  const [shown, setShown] = useState(0);
  const right = wrong ? (TRUE_RIGHT + 7) % 26 : TRUE_RIGHT;
  const { chain, consistent } = followLoop(candidate(right), LOOP, guess);
  const reset = () => setShown(0);
  return (
    <Gloss>
      <div className="flex flex-col gap-5">
        <Prose>
          <p>
            Pick a rotor setting to test, and guess what {LOOP[0].a} is plugged to. That one guess, plus the crib, tells you
            what the next letter must be plugged to, and the next, all round the loop. Step through it.
          </p>
        </Prose>
        <div className="grid gap-5 sm:grid-cols-2">
          <div role="radiogroup" aria-label="Rotor setting to test" className="flex gap-2">
            {[false, true].map((w) => (
              <button
                key={String(w)}
                type="button"
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- styled choice pills
                role="radio"
                aria-checked={wrong === w}
                onClick={() => (setWrong(w), reset())}
                className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold", wrong === w ? "border-brass bg-brass text-brass-ink" : "border-panel-edge")}
              >
                {w ? "A wrong setting" : "The right setting"}
              </button>
            ))}
          </div>
          <Slider label={`Guess: ${LOOP[0].a} is plugged to`} value={guess} min={0} max={25} onChange={(v) => (setGuess(v), reset())} format={(v) => ALPHABET[v]} />
        </div>
        <ol className="flex flex-col gap-3" data-testid="loop-walk">
          <li className="text-sm">
            <strong>Guess:</strong> {LOOP[0].a} is plugged to <T>{ALPHABET[guess]}</T>.
          </li>
          {LOOP.slice(0, shown).map((link, i) => (
            <li key={i} className="rounded-lg bg-room p-3 text-sm leading-relaxed">
              At letter {link.step + 1}, the crib says <T>{link.a}</T> became <T>{link.b}</T>. {link.a} is plugged to <T>{chain[i].plug}</T>, so
              it went into the rotors as {chain[i].plug}. The rotors at letter {link.step + 1} turn {chain[i].plug} into <T>{chain[i + 1].plug}</T>. So{" "}
              <strong>
                {link.b} must be plugged to {chain[i + 1].plug}
              </strong>
              .
            </li>
          ))}
        </ol>
        {shown < LOOP.length ? (
          <button type="button" onClick={() => setShown((s) => s + 1)} className="w-fit rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room">
            Follow the next link
          </button>
        ) : (
          <div className={cn("rounded-lg border p-4", consistent ? "border-signal-in bg-signal-in/10" : "border-danger bg-danger/10")} data-testid="loop-result">
            <p className="flex items-center gap-2 font-semibold">
              {consistent ? <Check className="size-4 text-signal-in" /> : <X className="size-4 text-danger" />}
              Back at {LOOP[0].a}: the loop says it&rsquo;s plugged to {chain.at(-1)!.plug}, and we guessed {ALPHABET[guess]}.
            </p>
            <p className="mt-2 text-sm">
              {consistent
                ? "They agree. This guess survives, and this rotor setting might be the one."
                : "That's a contradiction, so the guess was wrong. Try another guess; if every one of the 26 contradicts itself, the rotor setting is wrong and can be thrown away without ever knowing the plugboard."}
            </p>
            {!wrong && !consistent && <p className="mt-2 text-sm text-room-muted">Hint: on the right setting, one of the guesses that survives is the real plug.</p>}
          </div>
        )}
      </div>
    </Gloss>
  );
}
