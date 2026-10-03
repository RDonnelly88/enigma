"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Lightbulb, Play, RotateCcw, Timer } from "lucide-react";
import { MenuGraph } from "@/components/crib/menu-graph";
import { Gloss, readable } from "@/components/glossary/gloss";
import { Plugboard } from "@/components/machine/plugboard";
import { store, useStored } from "@/hooks/use-stored";
import { cn } from "@/lib/cn";
import { ALPHABET } from "@/lib/enigma";
import { ordersOf, runBombe, testLetter, type Stop } from "@/lib/story/bombe-run";
import { ANSWERS, CHALLENGE, CIPHERTEXT, PENALTY, RIGHT_ANSWER, checkStop, cribPlacements, hint, menuAt, rating, solved } from "@/lib/story/challenge";

export const BREAK_STORE = "enigma.break";
export type BreakResult = { seconds: number; hints: number; mistakes: number; date: string };

export function parseBreak(raw: string | null): BreakResult | null {
  if (!raw) return null;
  try {
    const r = JSON.parse(raw) as BreakResult;
    return typeof r.seconds === "number" && typeof r.hints === "number" ? r : null;
  } catch {
    return null;
  }
}

// Called from event handlers only; kept out here so render stays pure
const now = () => Date.now();
const today = () => new Date().toISOString();

export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

type Stage = "brief" | "crib" | "menu" | "bombe" | "check" | "act";

const STAGES: { id: Stage; label: string }[] = [
  { id: "crib", label: "Crib" },
  { id: "menu", label: "Menu" },
  { id: "bombe", label: "Bombes" },
  { id: "check", label: "Plugboard" },
  { id: "act", label: "Act" },
];

const ORDERS = ordersOf([...CHALLENGE.rotors]);
const POSITIONS = 26 ** 3;
const SLICE = 800;
const letters = (start: Stop["start"]) => start.map((n) => ALPHABET[n]).join(" ");
const words = (text: string) => text.split("X");
const PLAIN_WORDS = words(CHALLENGE.plain);

// Enough of the vocabulary to recognise a garbled word, in the order the message uses it
const GLOSSARY = [
  ["SIEBEN", "seven"],
  ["ANGRIFF", "attack"],
  ["AUF", "on"],
  ["GELEITZUG", "convoy"],
  ["QUADRAT", "square"],
  ["ACHT", "eight"],
  ["DREI", "three"],
  ["SIEBZEHN", "seventeen"],
  ["UHR", "o’clock"],
  ["JAGDSCHUTZ", "fighter escort"],
  ["DURCH", "by"],
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-panel-edge bg-panel p-5 sm:p-8">
      <h2 className="font-stencil text-3xl leading-tight font-bold tracking-wide">{title}</h2>
      {/* Each stage is one block of reading for the glossary */}
      <Gloss>{children}</Gloss>
    </section>
  );
}

const Say = readable(function Say({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "bad" | "good" }) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "rounded-lg px-4 py-3 text-sm leading-relaxed",
        tone === "bad" && "bg-signal-turn/15 text-room-ink",
        tone === "good" && "bg-signal-in/15 text-room-ink",
        tone === "neutral" && "bg-room text-room-ink",
      )}
      data-testid="break-say"
    >
      {children}
    </p>
  );
});

const button = "inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold";
const primary = cn(button, "bg-room-ink text-room disabled:opacity-40");
const secondary = cn(button, "border border-panel-edge hover:border-brass");

/**
 * Break an intercept the way Hut 6 did: place the crib, read the menu, run a
 * Bombe for every rotor order, then find the last cables on the checking
 * machine until the German reads, and act on it. Timed, with hints that cost.
 */
export function BreakIntercept({ onCertificate }: { onCertificate: () => void }) {
  const saved = parseBreak(useStored(BREAK_STORE));
  const [stage, setStage] = useState<Stage>("brief");
  const [started, setStarted] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [say, setSay] = useState<{ text: React.ReactNode; tone: "neutral" | "bad" | "good" } | null>(null);
  const [offset, setOffset] = useState(0);
  const [locked, setLocked] = useState<number | null>(null);
  const [progress, setProgress] = useState<number[]>(() => ORDERS.map(() => 0));
  const [running, setRunning] = useState(false);
  const [stops, setStops] = useState<Stop[] | null>(null);
  const [cables, setCables] = useState<string[]>([]);
  const [hinted, setHinted] = useState<ReturnType<typeof hint>>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (started === null) return;
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 500);
    return () => clearInterval(tick);
  }, [started]);

  const go = (next: Stage) => {
    setStage(next);
    setSay(null);
  };
  const wrong = (text: React.ReactNode) => {
    setMistakes((m) => m + 1);
    setSay({ text, tone: "bad" });
  };

  const restart = () => {
    store(BREAK_STORE, null);
    setStage("brief");
    setStarted(null);
    setElapsed(0);
    setMistakes(0);
    setHints(0);
    setSay(null);
    setOffset(0);
    setLocked(null);
    setProgress(ORDERS.map(() => 0));
    setStops(null);
    setCables([]);
    setHinted(null);
    setPicked(null);
  };

  if (saved && stage === "brief") {
    return (
      <Panel title="Intercept broken">
        <Result result={saved} />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onCertificate} className={primary}>
            See your certificate <ArrowRight className="size-4" />
          </button>
          <button type="button" onClick={restart} className={secondary}>
            <RotateCcw className="size-4" /> Break it again
          </button>
        </div>
      </Panel>
    );
  }

  // Penalties go on the clock as they happen, so the time shown is the time that counts
  const shown = elapsed + hints * PENALTY.hint + mistakes * PENALTY.mistake;
  const header = stage !== "brief" && (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <ol className="flex flex-wrap gap-1.5" aria-label="Stages">
        {STAGES.map((s, i) => {
          const here = STAGES.findIndex((x) => x.id === stage);
          return (
            <li
              key={s.id}
              aria-current={s.id === stage ? "step" : undefined}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                i < here ? "bg-signal-in/20 text-room-ink" : i === here ? "bg-brass text-brass-ink" : "bg-room text-room-muted",
              )}
            >
              {i + 1}. {s.label}
            </li>
          );
        })}
      </ol>
      <div className="flex items-center gap-3">
        <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 text-xs font-semibold text-room-muted hover:text-room-ink">
          <RotateCcw className="size-3.5" /> Start again
        </button>
        <p className="inline-flex items-center gap-2 font-stencil text-2xl font-bold tabular-nums" aria-label={`Time ${clock(shown)}`}>
          <Timer className="size-5 text-brass" aria-hidden />
          {clock(shown)}
        </p>
      </div>
    </div>
  );

  if (stage === "brief") {
    return (
      <Panel title="Hut 6, 1941. An intercept has just come in.">
        <p className="max-w-2xl font-serif text-lg leading-relaxed">
          A Luftwaffe signals post has sent an order to its bombers. Somewhere a convoy is about to be attacked. You have no
          key, only what Hut 6 knows, and a Bombe. Break it, read it, and warn the convoy.
        </p>
        <div className="rounded-lg bg-room p-4">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-brass uppercase">The intercept</p>
          <p className="mt-2 font-type text-lg leading-relaxed tracking-wider break-all">{CIPHERTEXT.match(/.{1,5}/g)!.join(" ")}</p>
        </div>
        <ul className="flex max-w-2xl flex-col gap-2 text-sm leading-relaxed">
          <li>
            <strong>The crib.</strong> Messages from this post start with a short serial number, then the address{" "}
            <span className="font-type">AN KAMPFGESCHWADER ZWEI</span>, &ldquo;to Bomber Wing 2&rdquo;, typed as{" "}
            <span className="font-type">{CHALLENGE.crib}</span>.
          </li>
          <li>
            <strong>The wheels.</strong> Today&rsquo;s rotors are I, II and III, in an order nobody knows. The rings are at A.
          </li>
          <li>
            <strong>The scoring.</strong> The clock runs from the moment you start. Mistakes add {PENALTY.mistake} seconds; hints add a minute.
          </li>
        </ul>
        <button
          type="button"
          onClick={() => {
            setStarted(now());
            go("crib");
          }}
          className={primary}
        >
          <Play className="size-4" /> Start the clock
        </button>
      </Panel>
    );
  }

  if (stage === "crib") {
    const placement = cribPlacements()[offset];
    const shown = CIPHERTEXT.slice(0, CHALLENGE.window + CHALLENGE.crib.length - 1);
    return (
      <Panel title="Place the crib">
        {header}
        <p className="max-w-2xl leading-relaxed">
          Slide the address along the start of the message. No letter can be enciphered as itself, so anywhere a crib letter
          sits on the same cipher letter, it can&rsquo;t be there. Find a place with no clash and lock it in.
        </p>
        <div className="rail overflow-x-auto pb-2">
          <div className="inline-grid grid-flow-col grid-rows-2 gap-y-1 font-type text-base" data-testid="crib-strip">
            {shown.split("").map((c, i) => {
              const k = i - offset;
              const crib = k >= 0 && k < CHALLENGE.crib.length ? CHALLENGE.crib[k] : null;
              const clash = crib !== null && crib === c;
              return (
                <span key={i} className="contents">
                  <span className={cn("w-6 text-center", clash && "rounded-t bg-signal-turn/30 font-bold")}>{c}</span>
                  <span
                    className={cn(
                      "w-6 text-center",
                      crib === null ? "text-transparent" : clash ? "rounded-b bg-signal-turn/30 font-bold" : "bg-brass-soft text-room-ink",
                    )}
                  >
                    {crib ?? "·"}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" aria-label="Move the crib left" disabled={offset === 0} onClick={() => setOffset((o) => o - 1)} className={secondary}>
            <ArrowLeft className="size-4" />
          </button>
          <span className="min-w-28 text-center text-sm font-semibold tabular-nums" data-testid="crib-offset">
            Starts at letter {offset + 1}
          </span>
          <button
            type="button"
            aria-label="Move the crib right"
            disabled={offset === CHALLENGE.window - 1}
            onClick={() => setOffset((o) => o + 1)}
            className={secondary}
          >
            <ArrowRight className="size-4" />
          </button>
          <span className={cn("text-sm font-semibold", placement.clashes.length ? "text-signal-turn" : "text-signal-in")}>
            {placement.clashes.length ? `${placement.clashes.length} ${placement.clashes.length === 1 ? "clash" : "clashes"}` : "No clashes"}
          </span>
        </div>
        <button
          type="button"
          className={primary}
          onClick={() => {
            if (placement.clashes.length) {
              const at = placement.clashes[0];
              wrong(
                <>
                  Clash at letter {offset + at + 1}: the crib&rsquo;s {CHALLENGE.crib[at]} sits on a cipher {CHALLENGE.crib[at]}, and Enigma
                  never enciphers a letter as itself.
                </>,
              );
              return;
            }
            setLocked(offset);
            go("menu");
          }}
        >
          Lock it in
        </button>
        {say && <Say tone={say.tone}>{say.text}</Say>}
      </Panel>
    );
  }

  const links = menuAt(locked ?? 0);
  const test = testLetter(links);

  if (stage === "menu") {
    const degree = (letter: string) => links.filter((l) => l.a === letter || l.b === letter).length;
    return (
      <Panel title="Read the menu">
        {header}
        <p className="max-w-2xl leading-relaxed">
          This is the Bombe&rsquo;s menu for your crib. Each line joins a crib letter to the cipher letter it became, numbered
          by its place in the message. The Bombe guesses the plug of one letter and follows the lines to see whether the guess
          holds up. <strong>Which letter would you start from?</strong>
        </p>
        <div className="rounded-lg bg-paper p-3 text-paper-ink">
          <MenuGraph links={links} picked={picked ?? undefined} onPick={setPicked} />
        </div>
        {picked && (
          <>
            <Say tone="good">
              {degree(picked) === degree(test) ? (
                <>
                  Good choice. {picked} has {degree(picked)} lines, more than any other letter, so a guess for its plug sets off the
                  most checks at once and a wrong guess hits a contradiction fastest. Bletchley called it the central letter.
                </>
              ) : (
                <>
                  That would work, but {picked} has only {degree(picked)} {degree(picked) === 1 ? "line" : "lines"}, so a guess for its
                  plug sets off fewer checks and a wrong one survives longer. The Bombe starts from the busiest letter, {test}, with{" "}
                  {degree(test)} lines.
                </>
              )}
            </Say>
            <button type="button" className={primary} onClick={() => go("bombe")}>
              Wire the Bombe to {test} <ArrowRight className="size-4" />
            </button>
          </>
        )}
      </Panel>
    );
  }

  if (stage === "bombe") {
    const run = async () => {
      setRunning(true);
      const found: Stop[] = [];
      for (let o = 0; o < ORDERS.length; o++) {
        for (let n = 0; n < POSITIONS; n += SLICE) {
          if (!alive.current) return;
          found.push(...runBombe(ORDERS[o], links, test, n, Math.min(POSITIONS, n + SLICE)));
          const done = Math.min(POSITIONS, n + SLICE);
          setProgress((p) => p.map((v, i) => (i === o ? done : v)));
          // Let the drums be drawn between slices
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      setRunning(false);
      setStops(found);
    };
    const stop = stops?.[0];
    return (
      <Panel title="Run the Bombes">
        {header}
        <p className="max-w-2xl leading-relaxed">
          Nobody knows today&rsquo;s rotor order, so Hut 6 runs one Bombe for each of the six. Each tries all 17,576 starting
          positions, testing a guess for <strong className="font-type">{test}</strong> against the whole menu, and stops
          wherever a guess survives.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="bombes">
          {ORDERS.map((order, i) => {
            const n = Math.min(progress[i], POSITIONS - 1);
            const drums = [Math.floor(n / 676), Math.floor(n / 26) % 26, n % 26];
            const mine = stops?.filter((s) => s.order.join() === order.join()).length;
            return (
              <div key={order.join()} className="crinkle rounded-lg border border-case-edge p-3 text-case-ink">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-case-muted uppercase">Order {order.join(" ")}</p>
                <div className="mt-2 flex gap-1.5" aria-hidden>
                  {drums.map((d, k) => (
                    <span key={k} className="grid size-8 place-items-center rounded-full border-2 border-metal-dark bg-paper font-stencil text-sm font-bold text-paper-ink">
                      {ALPHABET[d]}
                    </span>
                  ))}
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-case-edge">
                  <div className="h-full bg-lamp-on" style={{ width: `${(progress[i] / POSITIONS) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-case-muted">
                  {mine === undefined ? (progress[i] ? "Running…" : "Waiting") : mine ? `${mine} ${mine === 1 ? "stop" : "stops"}` : "No stops"}
                </p>
              </div>
            );
          })}
        </div>
        {stops === null && (
          <button type="button" onClick={run} disabled={running} className={primary}>
            <Play className="size-4" /> {running ? "Running…" : "Start the Bombes"}
          </button>
        )}
        {stops && !stop && (
          <>
            <Say tone="bad">
              Not one stop on any rotor order: every setting contradicted itself. So the crib can&rsquo;t sit at letter{" "}
              {(locked ?? 0) + 1}. It didn&rsquo;t clash, but it&rsquo;s still in the wrong place. Try another.
            </Say>
            <button
              type="button"
              className={primary}
              onClick={() => {
                setStops(null);
                setProgress(ORDERS.map(() => 0));
                setPicked(null);
                go("crib");
              }}
            >
              <ArrowLeft className="size-4" /> Back to the crib
            </button>
          </>
        )}
        {stop && (
          <>
            <div className="rounded-lg border-2 border-signal-in bg-room p-4" data-testid="bombe-stop">
              <p className="font-stencil text-2xl font-bold tracking-widest text-signal-in">STOP</p>
              <p className="mt-1">
                Rotor order <strong>{stop.order.join(" ")}</strong>, rotors at <strong className="font-type">{letters(stop.start)}</strong>.
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                The guess that survived also settles every other letter in the menu. It gives {stop.pairs.length} cables:{" "}
                <span className="font-type">{stop.pairs.join(" ")}</span>. The army used ten.
              </p>
            </div>
            <button
              type="button"
              className={primary}
              onClick={() => {
                setCables(stop.pairs);
                go("check");
              }}
            >
              Take it to the checking machine <ArrowRight className="size-4" />
            </button>
          </>
        )}
      </Panel>
    );
  }

  const stop = stops![0];

  if (stage === "check") {
    const text = checkStop(stop.order, stop.start, cables);
    const done = solved(cables);
    return (
      <Panel title="Find the last cables">
        {header}
        <p className="max-w-2xl leading-relaxed">
          The checking machine is set to the stop, with the Bombe&rsquo;s cables plugged. Most of it reads, but some words
          are garbled: those letters go through cables the menu never touched. Look at a garbled word, work out what it should
          say, and plug the wrong letter to the right one.
        </p>
        <p className="font-type text-lg leading-loose" data-testid="check-text">
          {words(text).map((w, i) => (
            <span key={i}>
              <span className={cn(w !== PLAIN_WORDS[i] && "rounded bg-signal-turn/20 underline decoration-signal-turn decoration-wavy")}>{w}</span>{" "}
            </span>
          ))}
        </p>
        <div className="rounded-lg bg-room p-4 text-sm">
          <p className="font-semibold">Useful German</p>
          <p className="mt-1 leading-relaxed text-room-muted">
            {GLOSSARY.map(([de, en]) => (
              <span key={de} className="mr-3 inline-block">
                <span className="font-type text-room-ink">{de}</span> {en}
              </span>
            ))}
          </p>
        </div>
        <div className="crinkle rounded-lg border border-case-edge px-3 py-4">
          <Plugboard pairs={cables} onChange={setCables} />
        </div>
        <p className="text-sm text-room-muted">{cables.length} of 10 cables plugged.</p>
        {done ? (
          <>
            <Say tone="good">It reads. Every word is German.</Say>
            <button type="button" className={primary} onClick={() => go("act")}>
              Read the order <ArrowRight className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            className={secondary}
            onClick={() => {
              setHints((h) => h + 1);
              setHinted(hint(cables));
            }}
          >
            <Lightbulb className="size-4" /> A hint (adds a minute)
          </button>
        )}
        {hinted && !done && (
          <Say>
            {hinted.got ? (
              <>
                <span className="font-type">{hinted.got}</span> should say <span className="font-type">{hinted.want}</span>. Where
                you see <strong>{hinted.wrong}</strong> it should be <strong>{hinted.right}</strong>: plug {hinted.wrong} to{" "}
                {hinted.right}.
              </>
            ) : (
              <>
                Try a cable from {hinted.wrong} to {hinted.right}.
              </>
            )}
          </Say>
        )}
      </Panel>
    );
  }

  // stage === "act"
  const finish = () => {
    const seconds = Math.floor((now() - started!) / 1000) + hints * PENALTY.hint + mistakes * PENALTY.mistake;
    store(BREAK_STORE, { seconds, hints, mistakes, date: today() } satisfies BreakResult);
    setStarted(null);
    setStage("brief");
  };
  return (
    <Panel title="Warn the convoy">
      {header}
      <p className="font-type text-lg leading-relaxed">{CHALLENGE.plain.replace(/X/g, " ")}</p>
      <div className="rounded-lg bg-room p-4 text-sm">
        <p className="font-semibold">A translator&rsquo;s notes</p>
        <p className="mt-1 leading-relaxed text-room-muted">
          ANGRIFF attack · AUF on · GELEITZUG convoy · IM QUADRAT in square · ACHT DREI eight three · UM at · SIEBZEHN UHR
          seventeen hundred · JAGDSCHUTZ fighter escort
        </p>
      </div>
      <p className="font-semibold">Where and when will the bombers strike?</p>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Where and when">
        {ANSWERS.map((a, i) => (
          <button
            key={a}
            type="button"
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- answer cards; native radios can't look like this
            role="radio"
            aria-checked={false}
            onClick={() => (i === RIGHT_ANSWER ? finish() : wrong("Read it again: the square and the time are both in the order."))}
            className="rounded-lg border border-panel-edge bg-room px-4 py-3 text-left font-semibold hover:border-brass"
          >
            {a}
          </button>
        ))}
      </div>
      {say && <Say tone={say.tone}>{say.text}</Say>}
    </Panel>
  );
}

function Result({ result }: { result: BreakResult }) {
  return (
    <div className="flex flex-col gap-4" data-testid="break-result">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-room p-3">
          <p className="font-stencil text-4xl font-bold tabular-nums">{clock(result.seconds)}</p>
          <p className="text-xs text-room-muted">time, with penalties</p>
        </div>
        <div className="rounded-lg bg-room p-3">
          <p className="font-stencil text-4xl font-bold">{result.hints}</p>
          <p className="text-xs text-room-muted">{result.hints === 1 ? "hint" : "hints"}</p>
        </div>
        <div className="rounded-lg bg-room p-3">
          <p className="font-stencil text-4xl font-bold">{result.mistakes}</p>
          <p className="text-xs text-room-muted">{result.mistakes === 1 ? "mistake" : "mistakes"}</p>
        </div>
      </div>
      <p className="font-stencil text-3xl font-bold tracking-wide text-brass">{rating(result.seconds)}</p>
      <p className="max-w-2xl font-serif text-lg leading-relaxed">
        &ldquo;{CHALLENGE.english}&rdquo; The warning goes out under Ultra. When the bombers arrive, the convoy&rsquo;s fighters
        are already waiting.
      </p>
    </div>
  );
}
