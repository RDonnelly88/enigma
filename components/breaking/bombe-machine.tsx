"use client";

import { useBombeSound } from "@/hooks/use-bombe-sound";
import { Gloss } from "@/components/glossary/gloss";
import { useEffect, useMemo, useState } from "react";
import { Check, Pause, Play, RotateCcw, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ALPHABET, step as stepRotors, type Settings } from "@/lib/enigma";
import { PRACTICE_ENGLISH, PRACTICE_PLAINTEXT } from "@/lib/messages";
import { DISCOVERY, FROM_STOP, LOOP, SCAN, candidate, partialRead, testStop } from "@/lib/story/checking";
import { playChecking, playReject, playStrikes } from "@/lib/sound";
import { cn } from "@/lib/cn";

/** The rotor windows as they stand for a given letter of the message. */
function windowsAt(settings: Settings, index: number) {
  let at = settings;
  for (let i = 0; i <= index; i++) at = { ...at, positions: stepRotors(at) };
  return at.positions.map((p) => ALPHABET[p]).join("");
}

const R = 110;
const C = 150;

/** How long a stop's test takes, and how long each position takes to try. */
const TEST_MS = 900;
const STEP_MS = 300;

type Phase = "ready" | "running" | "testing" | "found";
/** What became of each position the drums reached: no stop, a stop thrown out on test, or the stop that held. */
type Outcome = "none" | "false" | "true";

const groupsOf = (t: string) => t.slice(0, 45).match(/.{1,5}/g)!.join(" ");

/**
 * The Bombe, drawn: one set of drums for each link of the loop, each standing
 * where an Enigma would be at that letter of the message, wired round in a
 * ring. Run it, and it tries the right drum at every position, stopping
 * wherever a guess survives the loop. Each stop is tested at once against the
 * whole menu, as the hut did, and the run goes on by itself until a stop holds.
 * Afterwards every position can be looked at to see why it failed.
 */
export function BombeMachine() {
  const [right, setRight] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [paused, setPaused] = useState(false);
  const [outcomes, setOutcomes] = useState<(Outcome | null)[]>(() => SCAN.map(() => null));
  const [inspect, setInspect] = useState<number | null>(null);
  useBombeSound(phase === "running" && !paused);
  const drums = useMemo(() => LOOP.map((l) => windowsAt(candidate(right), l.step)), [right]);
  const record = (at: number, outcome: Outcome) => setOutcomes((o) => o.map((v, i) => (i === at ? outcome : v)));

  // The drums turn until the loop holds somewhere, and the stop goes for testing
  useEffect(() => {
    if (phase !== "running" || paused) return;
    const tick = setTimeout(() => {
      const next = (right + 1) % 26;
      setRight(next);
      if (SCAN[next].stops.length > 0) setPhase("testing");
      else record(next, "none");
    }, STEP_MS);
    return () => clearTimeout(tick);
  }, [phase, paused, right]);

  // A tested stop either holds, and the run is over, or is thrown out and the drums carry on
  useEffect(() => {
    if (phase !== "testing" || paused) return;
    const holds = testStop(right).holds;
    playChecking();
    const verdict = setTimeout(() => (holds ? playStrikes(1) : playReject()), TEST_MS * 0.5);
    const done = setTimeout(() => {
      record(right, holds ? "true" : "false");
      if (holds) {
        setPhase("found");
        setInspect(right);
      } else {
        setPhase("running");
      }
    }, TEST_MS);
    return () => {
      clearTimeout(verdict);
      clearTimeout(done);
    };
  }, [phase, paused, right]);

  const start = () => {
    setRight(0);
    setOutcomes(SCAN.map(() => null));
    setInspect(null);
    setPaused(false);
    // The first position is tried before the drums move; it may be a stop itself
    if (SCAN[0].stops.length > 0) setPhase("testing");
    else {
      setOutcomes(SCAN.map((_, i) => (i === 0 ? "none" : null)));
      setPhase("running");
    }
  };
  const stopped = phase === "testing" || phase === "found";
  const found = phase === "found";
  const candidates = SCAN.filter((s) => s.stops.length > 0 && (outcomes[s.right] || (phase === "testing" && s.right === right)));
  const thrownOut = outcomes.filter((o) => o === "false").length;

  return (
    <Gloss>
      <div className="flex flex-col gap-6">
        <p className="max-w-2xl font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
          Each set of drums copies an Enigma&rsquo;s rotors, without a plugboard, turned to where they would be at one letter
          of the loop. Cables at the back join them in the loop&rsquo;s order, so electricity does the guessing: all 26 guesses
          go round at once. Every stop is tested straight away, and the run goes on until one holds. Run it.
        </p>
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <svg
            viewBox="0 0 300 300"
            className="mx-auto w-full max-w-xs"
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG is the image
            role="img"
            aria-label={`Bombe drums with the right drum at ${ALPHABET[right]}: ${found ? "the setting found" : stopped ? "stopped, testing" : "running on"}`}
          >
            <circle
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke={found ? "var(--signal-in)" : stopped ? "var(--brass)" : "var(--case-muted)"}
              strokeWidth={stopped ? 4 : 2}
              strokeDasharray={stopped ? undefined : "4 6"}
            />
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
            <text
              x={C}
              y={C - 4}
              textAnchor="middle"
              className={cn("font-stencil text-[22px] font-bold", found ? "fill-signal-in" : stopped ? "fill-brass" : "fill-room-muted")}
            >
              {found ? "FOUND" : stopped ? "STOP" : phase === "running" ? "…" : "READY"}
            </text>
            <text x={C} y={C + 16} textAnchor="middle" className="fill-room-muted text-[10px]">
              right drum at {ALPHABET[right]}
            </text>
          </svg>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {phase === "ready" || found ? (
                <button type="button" onClick={start} className="inline-flex items-center gap-1.5 rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room">
                  {found ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
                  {found ? "Run it again" : "Run the Bombe"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room"
                >
                  {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                  {paused ? "Carry on" : "Pause"}
                </button>
              )}
              {phase !== "ready" && (
                <span className="text-sm text-room-muted" data-testid="thrown-out">
                  {thrownOut} false {thrownOut === 1 ? "stop" : "stops"} thrown out
                </span>
              )}
            </div>
            <p className="text-sm" data-testid="bombe-status" aria-live="polite">
              {found
                ? `Stop at ${ALPHABET[right]}, and the test holds. Pick any letter below to see why the others failed.`
                : phase === "testing"
                  ? `Stop at ${ALPHABET[right]}. Testing it against the whole menu…`
                  : phase === "running"
                    ? "Trying each position. Wherever every guess contradicts itself round the loop, it moves straight on."
                    : "Ready. The drums will turn through every position of the right rotor."}
            </p>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-widest text-room-muted uppercase">Right drum positions</p>
              <div className="grid grid-cols-13 gap-1">
                {SCAN.map((s) => {
                  const outcome = outcomes[s.right];
                  const label = `${ALPHABET[s.right]}: ${
                    outcome === "true" ? "the stop that held" : outcome === "false" ? "a stop, thrown out" : outcome === "none" ? "no stop" : "not reached"
                  }`;
                  return (
                    <button
                      key={s.right}
                      type="button"
                      disabled={!found || outcome === null}
                      onClick={() => setInspect(s.right)}
                      aria-label={label}
                      aria-pressed={found ? inspect === s.right : undefined}
                      title={label}
                      className={cn(
                        "grid h-7 place-items-center rounded-sm font-stencil text-[11px] font-bold disabled:cursor-default",
                        outcome === "true"
                          ? "bg-signal-in text-white"
                          : outcome === "false"
                            ? "bg-danger/75 text-white line-through"
                            : outcome === "none"
                              ? "bg-panel-edge text-room-muted"
                              : "bg-room text-room-muted/60",
                        !found && s.right === right && phase !== "ready" && "outline-2 outline-room-ink",
                        found && inspect === s.right && "outline-2 outline-offset-1 outline-brass",
                        found && outcome !== null && "hover:outline-2 hover:outline-brass/60",
                      )}
                    >
                      {ALPHABET[s.right]}
                    </button>
                  );
                })}
              </div>
            </div>
            {candidates.length > 0 && (
              <div data-testid="candidates">
                <p className="mb-1.5 text-[11px] font-semibold tracking-widest text-room-muted uppercase">Candidates</p>
                <ul className="flex flex-wrap gap-1.5">
                  {candidates.map((s) => {
                    const outcome = outcomes[s.right];
                    return (
                      <li
                        key={s.right}
                        className={cn(
                          "rounded-sm border px-2 py-0.5 font-type text-xs",
                          outcome === "true" ? "border-signal-in text-signal-in" : outcome === "false" ? "border-danger/60 text-danger line-through" : "border-brass text-brass",
                        )}
                      >
                        {ALPHABET[s.right]}: {s.stops.map((g) => `${LOOP[0].a}↔${g}`).join(", ")}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {found && inspect !== null && outcomes[inspect] && <Why at={inspect} outcome={outcomes[inspect]!} />}
          </div>
        </div>
        <p className="text-xs text-room-muted">
          To keep this quick, only the right drum turns here. A real Bombe ran through all 17,576 positions of a rotor order in
          about twenty minutes, on menus with several loops, which threw out far more wrong settings before any reached a test.
        </p>
      </div>
    </Gloss>
  );
}

/** The message as it reads at a setting, letters that happen to be right shown full, the rest faint. */
function Reading({ text }: { text: string }) {
  return (
    <p className="mt-1 font-type break-all">
      {[...groupsOf(text)].map((c, i, all) => {
        const at = all.slice(0, i).filter((x) => x !== " ").length;
        return (
          <span key={i} className={c !== " " && c === PRACTICE_PLAINTEXT[at] ? "" : "opacity-45"}>
            {c}
          </span>
        );
      })}
      …
    </p>
  );
}

/** Why one position failed, or why it held, once the run is over. */
function Why({ at, outcome }: { at: number; outcome: Outcome }) {
  const letter = ALPHABET[at];
  if (outcome === "none") {
    return (
      <div className="rounded-lg border border-panel-edge p-3 text-sm" data-testid="stop-test">
        <p className="font-semibold">No stop at {letter}.</p>
        <p className="mt-1 text-room-muted">
          All 26 guesses for {LOOP[0].a}&rsquo;s plug came back round the loop as something else, so the drums never paused here. Set
          to {letter}, the message reads:
        </p>
        <Reading text={partialRead([], at).text} />
      </div>
    );
  }
  const test = testStop(at);
  return (
    <div className={cn("rounded-lg border p-3 text-sm", test.holds ? "border-signal-in bg-signal-in/10" : "border-danger bg-danger/10")} data-testid="stop-test">
      <p className="font-semibold">{test.holds ? `${letter}: this is the setting.` : `${letter}: a false stop, thrown out.`}</p>
      <ul className="mt-2 flex flex-col gap-3">
        {test.tried.map(({ guess, check }) => (
          <li key={guess}>
            <p className="flex items-start gap-2">
              {check.clash ? <X className="mt-0.5 size-4 shrink-0 text-danger" /> : <Check className="mt-0.5 size-4 shrink-0 text-signal-in" />}
              <span>
                {LOOP[0].a}↔{guess}:{" "}
                {check.clash
                  ? `then ${check.clash.letter} would need plugging to both ${check.clash.plugs[0]} and ${check.clash.plugs[1]}. Impossible.`
                  : `every link agrees, and gives ${check.pairs.length} plugs: ${check.pairs.join(" ")}.`}
              </span>
            </p>
            <p className="mt-1 text-room-muted">{check.clash ? "With the plugs it had found before then, the message reads:" : "With them, the message reads:"}</p>
            <Reading text={partialRead(check.pairs, at).text} />
          </li>
        ))}
      </ul>
      {test.holds && <p className="mt-2 text-room-muted">Words are already showing. Go to the next step to finish the plugboard.</p>}
    </div>
  );
}

/**
 * The checking machine: the stop gives the rotors and the plugs its test found.
 * With them set, the rest of the plugboard comes out letter by letter, as
 * fragments of German suggest which pairs must be plugged.
 */
export function CheckingMachine() {
  const [pairs, setPairs] = useState(FROM_STOP.length);
  const read = partialRead(DISCOVERY.slice(0, pairs));
  const done = pairs === DISCOVERY.length;
  return (
    <Gloss>
      <div className="flex flex-col gap-5">
        <p className="max-w-2xl font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
          The stop gave the rotor settings, and its test gave {FROM_STOP.length} plugs. On the checking machine, those already turn
          most of the message into German. Fragments of words show which of the last letters must be swapped, and each pair found
          makes more of it readable.
        </p>
        <Slider
          label="Plugboard pairs found"
          value={pairs}
          min={FROM_STOP.length}
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
    </Gloss>
  );
}
