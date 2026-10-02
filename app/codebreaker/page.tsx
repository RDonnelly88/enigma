"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Square } from "lucide-react";
import { PlugStage, RotorStage, Stage, readable } from "@/components/codebreaker/stages";
import { useCodebreaker } from "@/hooks/use-codebreaker";
import { DEFAULT_OPTIONS, looksReadable, type Language } from "@/lib/codebreaker";
import { ALPHABET } from "@/lib/enigma";
import { CODEBREAKER_PRACTICE } from "@/lib/messages";
import { machineLink } from "@/lib/share";
import { cn } from "@/lib/cn";

/** Below this the statistics have too little to work with to be worth the wait. */
const MIN_LETTERS = 100;

const groups = (text: string) => text.match(/.{1,5}/g)?.join(" ") ?? "";

export default function CodebreakerPage() {
  const [ciphertext, setCiphertext] = useState(CODEBREAKER_PRACTICE[0].ciphertext);
  const [language, setLanguage] = useState<Language>(CODEBREAKER_PRACTICE[0].language);
  const { run, start, stop, reset } = useCodebreaker();
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (run.status !== "running") return;
    const tick = setInterval(() => setNow(performance.now()), 200);
    return () => clearInterval(tick);
  }, [run.status]);

  const letters = ciphertext.toUpperCase().replace(/[^A-Z]/g, "");
  const running = run.status === "running";
  const seconds = ((run.status === "running" ? now : run.finishedAt) - run.startedAt) / 1000;
  const result = run.result;
  const broken = result ? looksReadable(result.score, language) : false;
  const german = language === "german";

  const rotorState = run.status === "idle" ? "waiting" : run.plugs || result ? "done" : "running";
  const plugState = !run.rotors || run.rotors.done < run.rotors.total ? "waiting" : result ? "done" : "running";

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-4 pb-10">
      <div className="max-w-prose">
        <h1 className="font-stencil text-2xl font-bold tracking-wider">Codebreaker</h1>
        <p className="mt-1 text-sm text-room-muted">
          No key, no crib, just the ciphertext. This is the statistical attack James Gillogly published in 1995, run
          here in your browser. It tries every rotor setting, keeps the ones whose output looks least random, then
          climbs its way to the plugboard. It works when the message is long and the plugboard light. When it
          isn&rsquo;t, statistics aren&rsquo;t enough, which is why Bletchley Park relied on{" "}
          <Link href="/crib" className="underline underline-offset-2">cribs</Link> and the Bombe.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <section aria-label="The intercept" className="flex min-w-0 flex-col gap-4 self-start rounded-sm bg-paper p-4 text-paper-ink shadow-md">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Practice intercepts</span>
            {CODEBREAKER_PRACTICE.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={running}
                aria-pressed={ciphertext === p.ciphertext}
                onClick={() => {
                  setCiphertext(p.ciphertext);
                  setLanguage(p.language);
                  reset();
                }}
                className={cn(
                  "rounded-sm border px-3 py-2 text-left transition-colors disabled:opacity-50",
                  ciphertext === p.ciphertext ? "border-paper-ink bg-paper-ink/5" : "border-paper-muted/40 hover:border-paper-ink/60",
                )}
              >
                <span className="block text-sm font-semibold">{p.title}</span>
                <span className="block text-xs text-paper-muted">{p.story}</span>
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-widest text-paper-muted uppercase">
              Ciphertext · {letters.length} letters
            </span>
            <textarea
              value={ciphertext}
              onChange={(e) => {
                setCiphertext(e.target.value);
                reset();
              }}
              disabled={running}
              rows={6}
              spellCheck={false}
              className="resize-y rounded-sm border border-paper-muted/60 bg-transparent px-2 py-1.5 font-type text-base break-all uppercase focus:outline-2 focus:outline-paper-ink"
            />
          </label>

          <fieldset className="flex items-center gap-3 text-sm" disabled={running}>
            <legend className="sr-only">Language of the message</legend>
            <span className="text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Language</span>
            {(["german", "english"] as const).map((l) => (
              <label key={l} className="flex items-center gap-1.5">
                <input type="radio" name="language" checked={language === l} onChange={() => setLanguage(l)} className="accent-paper-ink" />
                {l === "german" ? "German" : "English"}
              </label>
            ))}
          </fieldset>

          <p className="text-xs text-paper-muted">
            Assumes reflector B and rotors I to V, as on the army&rsquo;s machine. Messages you make on the{" "}
            <Link href="/" className="underline underline-offset-2">machine</Link> work too: copy the lit letters and paste them in.
          </p>

          {running ? (
            <button type="button" onClick={stop} className="flex items-center justify-center gap-2 rounded-sm bg-danger px-4 py-2.5 font-semibold text-paper">
              <Square className="size-4" /> Stop
            </button>
          ) : (
            <button
              type="button"
              disabled={letters.length < MIN_LETTERS}
              onClick={() => start(letters, { ...DEFAULT_OPTIONS, language })}
              className="flex items-center justify-center gap-2 rounded-sm bg-case px-4 py-2.5 font-semibold text-case-ink disabled:opacity-50"
            >
              <Play className="size-4" /> {run.status === "idle" ? "Break it" : "Try again"}
            </button>
          )}
          {letters.length < MIN_LETTERS && (
            <p className="text-xs text-danger">Needs at least {MIN_LETTERS} letters. Short messages give the statistics nothing to stand on.</p>
          )}
        </section>

        <div className="flex min-w-0 flex-col gap-4" aria-live="polite">
          {run.status !== "idle" && (
            <p className="text-sm text-room-muted tabular-nums">
              {running ? "Working" : run.status === "stopped" ? "Stopped" : "Finished"} · {seconds.toFixed(1)}s
            </p>
          )}

          <Stage number={1} title="Find the rotors" state={rotorState}>
            {run.rotors ? <RotorStage {...run.rotors} /> : run.status === "idle" ? null : <p className="text-sm text-paper-muted">Starting…</p>}
          </Stage>

          <Stage number={2} title="Find the plugboard" state={plugState}>
            {run.plugs && <PlugStage {...run.plugs} german={german} />}
          </Stage>

          <Stage number={3} title="Settle the rings" state={result ? "done" : run.polishing ? "running" : "waiting"}>
            {(run.polishing || result) && (
              <p className="text-sm text-paper-muted">
                Fine-tunes the ring settings, which decide when the middle and left rotors turn, now that the plugboard
                makes the score sharp enough to tell.
              </p>
            )}
          </Stage>

          {result && (
            <section
              aria-label="Result"
              data-testid="verdict"
              data-broken={broken || undefined}
              className={cn("rounded-sm p-4 shadow-md", broken ? "bg-paper text-paper-ink ring-2 ring-signal-in" : "bg-paper text-paper-ink ring-2 ring-danger")}
            >
              <h2 className={cn("font-stencil text-xl font-bold tracking-wider", broken ? "text-signal-in" : "text-danger")}>
                {broken ? "Broken" : "Not broken"}
              </h2>
              {broken ? (
                <>
                  <p className="mt-2 font-type text-lg leading-snug break-all">{readable(result.text, german)}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Rotors</dt>
                      <dd className="font-type">{result.settings.rotors.join(" ")}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Rings</dt>
                      <dd className="font-type">{result.settings.rings.map((r) => ALPHABET[r]).join(" ")}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Start</dt>
                      <dd className="font-type">{result.settings.positions.map((p) => ALPHABET[p]).join(" ")}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Cables</dt>
                      <dd className="font-type">{result.settings.plugboard.join(" ") || "none"}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-paper-muted">
                    The rings and start letters may differ from the ones the operator set and still read the message:
                    turning a ring and its rotor together changes nothing until a notch comes round.
                  </p>
                  <Link
                    href={machineLink(result.settings, letters)}
                    className="mt-3 inline-flex rounded-sm bg-case px-3 py-2 text-sm font-semibold text-case-ink"
                  >
                    Check it on the machine
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm">
                    The best it found still reads as nonsense:{" "}
                    <span className="font-type break-all">{groups(result.text.slice(0, 40))}…</span>
                  </p>
                  <p className="mt-2 text-sm text-paper-muted">
                    With many cables, so few letters pass the plugboard untouched that the right rotors don&rsquo;t
                    stand out from the wrong ones in stage 1, and the search never gets near them. A longer message
                    helps. So does a guess at a word in it, which is where the{" "}
                    <Link href="/crib" className="underline underline-offset-2">crib dragger</Link> and Turing&rsquo;s
                    Bombe come in.
                  </p>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
