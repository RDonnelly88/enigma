"use client";

import { useBombeSound } from "@/hooks/use-bombe-sound";
import { Gloss } from "@/components/glossary/gloss";
import { useEffect, useRef, useState } from "react";
import { Check, Power, X, Zap } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Demo } from "@/components/ui/demo";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/cn";
import { ALPHABET } from "@/lib/enigma";
import { ANSWER, LOOP, POSITIONS, follow, letter, spread } from "@/lib/story/be-the-bombe";

const GUESSES = Array.from({ length: 26 }, (_, g) => g);
type Tried = Record<number, boolean>;

/**
 * The Bombe's test played by hand on a three-letter loop: guess E's cable,
 * carry it round the cards, see whether it comes back to itself. Then the
 * same test as the machine ran it, with current lighting every consequence
 * of a guess at once.
 */
export function BeTheBombe() {
  const [at, setAt] = useState(0);
  const [tried, setTried] = useState<Tried>({});
  const [guess, setGuess] = useState<number | null>(null);
  const position = POSITIONS[at];

  const move = (next: number) => {
    setAt(next);
    setTried({});
    setGuess(null);
  };
  const tryGuess = (g: number) => {
    setGuess(g);
    setTried((t) => ({ ...t, [g]: follow(position.cards, g).consistent }));
  };
  const tryAll = () => setTried(Object.fromEntries(GUESSES.map((g) => [g, follow(position.cards, g).consistent])));

  const count = Object.keys(tried).length;
  const survivor = GUESSES.find((g) => tried[g]);
  const allWrong = count === 26 && survivor === undefined;

  return (
    <Demo title="Be the Bombe" prompt="Guess a cable, follow it round">
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold">1. The crib gives you a loop</h4>
          <div className="flex flex-wrap items-center gap-6">
            <LoopDiagram />
            <ul className="flex flex-col gap-1.5 text-sm">
              {LOOP.map((l) => (
                <li key={l.at}>
                  At letter {l.at}, <span className="font-type font-bold">{l.from}</span> became{" "}
                  <span className="font-type font-bold">{l.to}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-room-muted">
            Each card below shows what the rotors do at one of those letters, with the plugboard left out: every letter swapped
            with a partner, never with itself. If you know which letter E is plugged to, the cards tell you Q&rsquo;s plug,
            then T&rsquo;s, then E&rsquo;s again. These cards are simplified, but they work exactly the way the rotors do.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold">2. Set the drums, then guess E&rsquo;s cable</h4>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold tracking-widest text-room-muted uppercase">Drums at</span>
            <Segmented
              label="Drum position"
              value={String(at)}
              onChange={(v) => move(Number(v))}
              options={POSITIONS.map((p, i) => ({ value: String(i), label: p.drums }))}
            />
          </div>
          {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a row of buttons, labelled as one control */}
          <div className="flex flex-wrap gap-1" role="group" aria-label="Guess E's plug">
            {GUESSES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => tryGuess(g)}
                aria-label={`Guess E is plugged to ${letter(g)}`}
                aria-pressed={guess === g}
                className={cn(
                  "grid size-8 place-items-center rounded font-type text-sm font-bold transition-colors",
                  tried[g] === true && "bg-signal-in text-white",
                  tried[g] === false && "bg-signal-turn/25 text-room-ink line-through decoration-2",
                  tried[g] === undefined && "bg-room hover:bg-brass-soft",
                  guess === g && "ring-2 ring-brass",
                )}
              >
                {letter(g)}
              </button>
            ))}
          </div>
          {guess !== null && <Trace cards={position.cards} guess={guess} />}
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={tryAll} className="rounded-full border border-panel-edge px-4 py-1.5 text-sm font-semibold hover:border-brass">
              Try every guess
            </button>
            <span className="text-sm text-room-muted" data-testid="bombe-tally">
              {count} of 26 guesses tried{survivor !== undefined ? `, and ${letter(survivor)} survives` : count ? ", all contradicted" : ""}
            </span>
          </div>
          {allWrong && (
            <p className="rounded-lg bg-signal-turn/15 px-4 py-3 text-sm leading-relaxed" data-testid="bombe-verdict">
              <strong>Every guess contradicts itself.</strong> So the drums can&rsquo;t be at {position.drums}, whatever the plugboard is.
              You&rsquo;ve ruled out a rotor position without knowing a single cable. Move the drums on.
            </p>
          )}
          {survivor !== undefined && (
            <p className="rounded-lg bg-signal-in/15 px-4 py-3 text-sm leading-relaxed" data-testid="bombe-verdict">
              <strong>Stop!</strong> At {position.drums}, the guess E&nbsp;=&nbsp;{letter(survivor)} goes all the way round and comes back
              to itself. This position might be the key, and you already know one cable: E is plugged to {letter(survivor)}.
            </p>
          )}
        </section>

        <Wires key={at} cards={position.cards} right={position.right} drums={position.drums} />
      </div>
    </Demo>
  );
}

/** The guess carried card by card, each step drawn as a lookup on that card. */
function Trace({ cards, guess }: { cards: number[][]; guess: number }) {
  const { hops, consistent } = follow(cards, guess);
  return (
    <Gloss>
      <div className="flex flex-col gap-2 rounded-lg border border-panel-edge bg-room p-3" data-testid="bombe-trace">
        <p className="text-sm">
          Guess: <strong className="font-type">E</strong> is plugged to <strong className="font-type">{letter(guess)}</strong>.
        </p>
        {hops.slice(1).map((hop, i) => {
          const into = hops[i].plug;
          return (
            <div key={i} className="flex flex-col gap-1">
              <p className="text-sm">
                Card for letter {LOOP[i].at}: <span className="font-type font-bold">{letter(into)}</span> swaps with{" "}
                <span className="font-type font-bold">{letter(hop.plug)}</span>, so <strong className="font-type">{hop.letter}</strong> is
                plugged to <strong className="font-type">{letter(hop.plug)}</strong>.
              </p>
              <Card card={cards[i]} highlight={into} />
            </div>
          );
        })}
        <p className={cn("flex items-center gap-1.5 text-sm font-semibold", consistent ? "text-signal-in" : "text-signal-turn")}>
          {consistent ? <Check className="size-4" /> : <X className="size-4" />}
          {consistent
            ? `It comes back to ${letter(guess)}. The guess holds up.`
            : `But you said E is plugged to ${letter(guess)}. A cable can’t go two places: this guess is wrong.`}
        </p>
      </div>
    </Gloss>
  );
}

/** One lookup card: the alphabet over each letter's partner, with the column being read picked out. */
function Card({ card, highlight }: { card: number[]; highlight: number }) {
  // On a narrow screen the card scrolls; keep the column being read in view
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rail.current;
    const cell = el?.querySelector<HTMLElement>("[data-read]");
    if (el && cell) el.scrollLeft = cell.offsetLeft - el.clientWidth / 2;
  }, [highlight]);
  return (
    <div ref={rail} className="rail relative overflow-x-auto">
      <div className="inline-grid grid-flow-col grid-rows-2 rounded bg-paper px-1 py-0.5 font-type text-xs text-paper-ink">
        {ALPHABET.split("").map((ch, i) => (
          <span key={ch} className="contents">
            <span data-read={i === highlight || undefined} className={cn("w-5 text-center", i === highlight && "rounded-t bg-brass font-bold text-brass-ink")}>
              {ch}
            </span>
            <span className={cn("w-5 text-center text-paper-muted", i === highlight && "rounded-b bg-brass font-bold text-brass-ink")}>
              {letter(card[i])}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The machine's version. A cable of 26 wires stands for E's 26 possible
 * plugs; current fed into one runs round the loop and comes back on the wire
 * that guess implies, then on again, lighting every plug it leads to.
 */
function Wires({ cards, right, drums }: { cards: number[][]; right: boolean; drums: string }) {
  const reduced = useReducedMotion();
  const [start, setStart] = useState(1);
  const [lit, setLit] = useState<Set<number> | null>(null);
  const [running, setRunning] = useState(false);
  useBombeSound(running);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const run = (from: number) => {
    if (timer.current) clearInterval(timer.current);
    setStart(from);
    const rounds = spread(cards, from);
    if (reduced) {
      setLit(rounds.at(-1)!);
      return;
    }
    let i = 0;
    setRunning(true);
    setLit(rounds[0]);
    timer.current = setInterval(() => {
      i++;
      if (i >= rounds.length) {
        clearInterval(timer.current!);
        setRunning(false);
        return;
      }
      setLit(rounds[i]);
    }, 90);
  };

  const done = lit !== null && !running;
  const all = done && lit.size === 26;

  return (
    <Gloss>
      <section className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold">3. Now do it the machine&rsquo;s way</h4>
        <p className="max-w-2xl text-sm leading-relaxed text-room-muted">
          The Bombe didn&rsquo;t try guesses one at a time. E had a cable of 26 wires, one for each possible plug. Current fed into one
          wire ran through the drums round the loop and came back on the wire that guess leads to, then on again, lighting every
          guess the first one implies, all in an instant.
        </p>
        <div className="crinkle rounded-lg border border-case-edge p-3">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-case-muted uppercase">E&rsquo;s 26 wires · drums at {drums}</p>
          <div className="flex flex-wrap gap-1" data-testid="bombe-wires">
            {ALPHABET.split("").map((ch, i) => {
              const on = lit?.has(i);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => run(i)}
                  disabled={running}
                  aria-label={`Feed current into wire ${ch}`}
                  className={cn(
                    "grid size-7 place-items-center rounded-full border-2 font-stencil text-xs font-bold transition-colors duration-150 motion-reduce:transition-none",
                    on ? "border-lamp-glow bg-lamp-on text-lamp-ink-on shadow-[0_0_10px_2px_var(--lamp-glow)]" : "border-metal-dark bg-lamp-off text-lamp-ink-off",
                    i === start && lit && "ring-2 ring-case-ink",
                  )}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => run(start)}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room disabled:opacity-50"
          >
            <Power className="size-4" /> Switch on, current into wire {letter(start)}
          </button>
          <span className="text-xs text-room-muted">Or tap any wire to feed it.</span>
        </div>
        {done && (
          <p className={cn("rounded-lg px-4 py-3 text-sm leading-relaxed", all ? "bg-signal-turn/15" : "bg-signal-in/15")} data-testid="wires-verdict">
            {all ? (
              <>
                <strong>All 26 lit.</strong> Every guess leads to every other, so none of them can be E&rsquo;s cable: the position is
                impossible. The drums click on to the next one, about twenty times a second on a real Bombe.
              </>
            ) : lit.size === 1 ? (
              <>
                <strong>Only {letter(start)} lights.</strong> The current goes round and comes straight back to the wire it started
                on: that guess agrees with itself. E is plugged to {letter(start)}.
              </>
            ) : (
              <>
                <strong>Only {lit.size} of 26 lit.</strong> Not everything, so the position can&rsquo;t be thrown out and the Bombe stops.
                The answer is among the dark wires.{" "}
                {right && (
                  <button type="button" onClick={() => run(ANSWER)} className="inline-flex items-center gap-1 font-semibold text-brass underline">
                    <Zap className="size-3.5" /> Feed wire {letter(ANSWER)}
                  </button>
                )}
              </>
            )}
          </p>
        )}
        <p className="max-w-2xl text-xs leading-relaxed text-room-muted">
          A real menu had several loops, joined through Gordon Welchman&rsquo;s diagonal board, which uses the fact that a cable works
          both ways. With that, a wrong position lit every wire and a right one left exactly one dark: the answer.
        </p>
      </section>
    </Gloss>
  );
}

const NODE = { E: { x: 60, y: 18 }, Q: { x: 108, y: 100 }, T: { x: 12, y: 100 } } as const;

/** The three crib letters and the links between them, closing into a loop. */
function LoopDiagram() {
  return (
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline diagram, read out as one picture
    <svg viewBox="0 0 120 120" className="w-28 shrink-0" role="img" aria-label="E to Q at letter 5, Q to T at letter 9, T to E at letter 12">
      {LOOP.map((l) => {
        const a = NODE[l.from as keyof typeof NODE];
        const b = NODE[l.to as keyof typeof NODE];
        return (
          <g key={l.at}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--signal-turn)" strokeWidth={2.5} />
            <text
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2}
              dy={4}
              textAnchor="middle"
              className="fill-room-ink text-[10px] font-semibold"
              paintOrder="stroke"
              stroke="var(--panel)"
              strokeWidth={4}
            >
              {l.at}
            </text>
          </g>
        );
      })}
      {Object.entries(NODE).map(([name, p]) => (
        <g key={name}>
          <circle cx={p.x} cy={p.y} r={13} fill="var(--case)" />
          <text x={p.x} y={p.y + 5} textAnchor="middle" className="fill-case-ink font-stencil text-[14px] font-bold">
            {name}
          </text>
        </g>
      ))}
    </svg>
  );
}
