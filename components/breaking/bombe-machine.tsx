"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Pause, Play, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ALPHABET, step as stepRotors, type Settings } from "@/lib/enigma";
import { PRACTICE_ENGLISH, PRACTICE_PLAINTEXT } from "@/lib/messages";
import { DISCOVERY, LOOP, SCAN, TRUE_RIGHT, candidate, partialRead } from "@/lib/story/checking";
import { cn } from "@/lib/cn";

/** The rotor windows as they stand for a given letter of the message. */
function windowsAt(settings: Settings, index: number) {
  let at = settings;
  for (let i = 0; i <= index; i++) at = { ...at, positions: stepRotors(at) };
  return at.positions.map((p) => ALPHABET[p]).join("");
}

const R = 110;
const C = 150;

/**
 * The Bombe, drawn: one set of drums for each link of the loop, each standing
 * where an Enigma would be at that letter of the message, wired round in a
 * ring. Run it, and it tries the right drum at every position, stopping
 * wherever a guess survives the loop. Then test the stop.
 */
export function BombeMachine() {
  const [right, setRight] = useState(0);
  const [running, setRunning] = useState(false);
  const [tested, setTested] = useState<number | null>(null);
  // Nothing has been tested until the first run
  const [started, setStarted] = useState(false);
  const here = SCAN[right];
  const stopped = started && here.stops.length > 0;
  const drums = useMemo(() => LOOP.map((l) => windowsAt(candidate(right), l.step)), [right]);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      setRight((r) => {
        const next = (r + 1) % 26;
        // The Bombe stops by itself when the test holds
        if (SCAN[next].stops.length > 0) setRunning(false);
        return next;
      });
    }, 350);
    return () => clearInterval(tick);
  }, [running]);

  const read = tested !== null ? partialRead([`${LOOP[0].a}${SCAN[tested].stops[0]}`].map((p) => [...p].sort().join("")), tested) : null;
  const reads = tested === TRUE_RIGHT;

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
        Each set of drums copies an Enigma&rsquo;s rotors, without a plugboard, turned to where they would be at one letter
        of the loop. Cables at the back join them in the loop&rsquo;s order, so electricity does the guessing: all 26 guesses
        go round at once. Run it.
      </p>
      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <svg
          viewBox="0 0 300 300"
          className="mx-auto w-full max-w-xs"
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG is the image
          role="img"
          aria-label={`Bombe drums with the right drum at ${ALPHABET[right]}: ${stopped ? "stopped" : "running on"}`}
        >
          <circle cx={C} cy={C} r={R} fill="none" stroke={stopped ? "var(--signal-in)" : "var(--case-muted)"} strokeWidth={stopped ? 4 : 2} strokeDasharray={stopped ? undefined : "4 6"} />
          {LOOP.map((l, i) => {
            const angle = (i / LOOP.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.round((C + R * Math.cos(angle)) * 100) / 100;
            const y = Math.round((C + R * Math.sin(angle)) * 100) / 100;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <rect x={-34} y={-22} width={68} height={44} rx={8} className="fill-case" stroke="var(--case-edge)" />
                {[...drums[i]].map((d, j) => (
                  <g key={j} transform={`translate(${-20 + j * 20} -6)`}>
                    <circle r={8.5} className="fill-paper" />
                    <text y={4} textAnchor="middle" className="fill-paper-ink font-stencil text-[11px] font-bold">
                      {d}
                    </text>
                  </g>
                ))}
                <text y={17} textAnchor="middle" className="fill-case-muted text-[8px]">
                  {l.a}→{l.b} · letter {l.step + 1}
                </text>
              </g>
            );
          })}
          <text x={C} y={C - 4} textAnchor="middle" className={cn("font-stencil text-[22px] font-bold", stopped ? "fill-signal-in" : "fill-room-muted")}>
            {stopped ? "STOP" : running ? "…" : "READY"}
          </text>
          <text x={C} y={C + 16} textAnchor="middle" className="fill-room-muted text-[10px]">
            right drum at {ALPHABET[right]}
          </text>
        </svg>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setTested(null);
                if (!started) {
                  // The first position is tested before the drums move; it may be a stop itself
                  setStarted(true);
                  if (SCAN[right].stops.length === 0) setRunning(true);
                  return;
                }
                if (!running && stopped) setRight((r) => (r + 1) % 26);
                setRunning((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room"
            >
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
              {running ? "Pause" : stopped ? "Carry on" : "Run the Bombe"}
            </button>
            {stopped && !running && (
              <button
                type="button"
                onClick={() => setTested(right)}
                className="rounded-full border border-brass px-4 py-2 text-sm font-semibold text-brass hover:bg-brass hover:text-brass-ink"
              >
                Test this stop
              </button>
            )}
          </div>
          <div className="grid grid-cols-13 gap-1" aria-hidden>
            {SCAN.map((s) => (
              <span
                key={s.right}
                className={cn(
                  "grid h-6 place-items-center rounded-sm font-stencil text-[10px] font-bold",
                  s.right === right ? "bg-room-ink text-room" : s.right < right && s.stops.length ? "bg-chart-accent text-white" : "bg-room text-room-muted",
                )}
              >
                {ALPHABET[s.right]}
              </span>
            ))}
          </div>
          <p className="text-sm" data-testid="bombe-status" aria-live="polite">
            {stopped
              ? `Stop at ${ALPHABET[right]}: the loop holds if ${LOOP[0].a} is plugged to ${here.stops.join(" or ")}. Most stops are false; test it.`
              : running
                ? "Testing each position. Every guess is contradicting itself, so it moves on."
                : "Ready. The drums will turn through every position of the right rotor."}
          </p>
          {read && (
            <div className={cn("rounded-lg border p-3 text-sm", reads ? "border-signal-in bg-signal-in/10" : "border-danger bg-danger/10")} data-testid="stop-test">
              <p className="flex items-center gap-2 font-semibold">
                {reads ? <Check className="size-4 text-signal-in" /> : <X className="size-4 text-danger" />}
                {reads ? "Words are appearing. This is the setting." : "Gibberish. A false stop: carry on."}
              </p>
              <p className="mt-1 font-type break-all">{read.text.slice(0, 48)}…</p>
              {reads && <p className="mt-1 text-room-muted">Go to the next step to finish the plugboard.</p>}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-room-muted">
        To keep this quick, only the right drum turns here. A real Bombe ran through all 17,576 positions of a rotor order in
        about twenty minutes, on menus with several loops, which threw out far more wrong settings.
      </p>
    </div>
  );
}

/**
 * The checking machine: the stop gives the rotors and one plugboard pair.
 * With them set, the rest of the plugboard comes out letter by letter, as
 * fragments of German suggest which pairs must be plugged.
 */
export function CheckingMachine() {
  const [pairs, setPairs] = useState(1);
  const read = partialRead(DISCOVERY.slice(0, pairs));
  const done = pairs === DISCOVERY.length;
  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-2xl font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
        The stop gave the rotor settings and one plug, {DISCOVERY[0][0]}↔{DISCOVERY[0][1]}. On the checking machine, those already
        turn part of the message into German. Fragments of words show which other letters must be swapped, and each pair
        found makes more of it readable.
      </p>
      <Slider
        label="Plugboard pairs found"
        value={pairs}
        min={1}
        max={DISCOVERY.length}
        onChange={setPairs}
        format={(v) => `${v} of ${DISCOVERY.length}`}
      />
      <ul className="flex flex-wrap gap-1.5" aria-label="Pairs found">
        {DISCOVERY.slice(0, pairs).map((p) => (
          <li key={p} className="rounded-sm bg-cable px-2 py-0.5 font-stencil text-sm font-bold tracking-widest text-white">
            {p[0]}–{p[1]}
          </li>
        ))}
      </ul>
      <div className="rounded-lg bg-paper p-4 text-paper-ink">
        <p className="font-sans text-[10px] font-semibold tracking-widest text-paper-muted uppercase">
          {read.correct} of {read.total} letters reading right
        </p>
        <p className="mt-2 font-type text-lg leading-snug break-all" data-testid="checking-text">
          {[...read.text].map((c, i) => (
            <span key={i} className={c === PRACTICE_PLAINTEXT[i] ? "" : "text-paper-muted/50"}>
              {c === "X" && c === PRACTICE_PLAINTEXT[i] ? " " : c}
            </span>
          ))}
        </p>
      </div>
      {done && (
        <div className="rounded-xl border-2 border-signal-in p-5" data-testid="message-read">
          <p className="font-stencil text-2xl font-bold tracking-wide text-signal-in">Message read</p>
          <p className="mt-2 font-type text-lg">{PRACTICE_PLAINTEXT.replace(/X/g, " ")}</p>
          <p className="mt-3 font-serif text-lg italic">{PRACTICE_ENGLISH}</p>
          <p className="mt-3 text-sm text-room-muted">
            And with the key found, every other message on the same network that day could be read at once, by anyone
            with a machine set the same way.
          </p>
        </div>
      )}
    </div>
  );
}
