"use client";

import { useBombeSound } from "@/hooks/use-bombe-sound";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ALPHABET, DEFAULT_SETTINGS, REFLECTORS, encipher, step, type Settings } from "@/lib/enigma";
import { MORSE } from "@/lib/morse";
import type { Visual } from "@/lib/glossary";
import { profile } from "@/lib/story/frequency";

/** Small things to poke at inside a glossary card, one for each kind of idea. */
export function GlossaryVisual({ kind }: { kind: Visual }) {
  const Shown = VISUALS[kind];
  return (
    <div className="rounded-lg border border-panel-edge bg-room p-3 text-sm">
      <Shown />
    </div>
  );
}

const chip = "grid size-7 place-items-center rounded font-type text-sm";
const button = "rounded-full border border-panel-edge px-3 py-1 text-xs font-semibold hover:border-brass";

function Shift() {
  const [by, setBy] = useState(3);
  const word = "ENIGMA";
  const shifted = (ch: string) => ALPHABET[(ALPHABET.indexOf(ch) + by) % 26];
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-3">
        <span className="text-xs font-semibold text-room-muted">Shift each letter by</span>
        <input type="range" min={1} max={25} value={by} onChange={(e) => setBy(Number(e.target.value))} className="slider flex-1" aria-label="Shift" />
        <span className="w-6 text-right font-stencil text-lg font-bold">{by}</span>
      </label>
      <div className="flex gap-1">
        {word.split("").map((ch, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className={chip}>{ch}</span>
            <span className="text-[10px] text-room-muted">↓</span>
            <span className={cn(chip, "bg-brass-soft font-bold")}>{shifted(ch)}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-room-muted">The shift is the key. Anyone who knows it shifts back and reads the message.</p>
    </div>
  );
}

const LAMP_KEY: Settings = { ...DEFAULT_SETTINGS, positions: [6, 11, 18] };
const LAMP_PLAIN = "HALLO";
const LAMP_CIPHER = encipher(LAMP_KEY, LAMP_PLAIN).text;

function Lamp() {
  const [sealed, setSealed] = useState(false);
  const text = sealed ? LAMP_CIPHER : LAMP_PLAIN;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {text.split("").map((ch, i) => (
          <span
            key={i}
            className="grid size-9 place-items-center rounded-full border-2 border-metal-dark font-stencil text-lg font-bold transition-colors motion-reduce:transition-none"
            style={{ background: sealed ? "var(--lamp-on)" : "var(--paper)", color: sealed ? "var(--lamp-ink-on)" : "var(--paper-ink)" }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={button} onClick={() => setSealed((s) => !s)}>
          {sealed ? "Decipher it" : "Encipher it"}
        </button>
        <span className="text-xs text-room-muted">{sealed ? "Ciphertext, as sent" : "Plaintext, as written"}</span>
      </div>
      <p className="text-xs text-room-muted">On Enigma the same settings do both: type either word and the other lights up.</p>
    </div>
  );
}

// One press short of the middle rotor's notch, so the double step comes quickly
const ROTOR_START: Settings = { ...DEFAULT_SETTINGS, positions: [0, 3, 20] };

function Rotor() {
  const [at, setAt] = useState<[number, number, number]>(ROTOR_START.positions);
  const [presses, setPresses] = useState(0);
  const [moved, setMoved] = useState<boolean[]>([false, false, false]);
  const press = () => {
    const next = step({ ...ROTOR_START, positions: at });
    setMoved(next.map((n, i) => n !== at[i]));
    setAt(next);
    setPresses((p) => p + 1);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="crinkle flex gap-1.5 rounded-md border border-case-edge px-2 py-1.5">
          {at.map((p, i) => (
            <span
              key={i}
              className={cn(
                "grid h-9 w-7 place-items-center rounded-sm bg-paper font-stencil text-lg font-bold text-paper-ink",
                moved[i] && presses > 0 && "ring-2 ring-lamp-on",
              )}
            >
              {ALPHABET[p]}
            </span>
          ))}
        </div>
        <button type="button" className={button} onClick={press}>
          Press a key
        </button>
        <button
          type="button"
          className="text-xs text-room-muted underline"
          onClick={() => {
            setAt(ROTOR_START.positions);
            setPresses(0);
            setMoved([false, false, false]);
          }}
        >
          Reset
        </button>
      </div>
      <p className="text-xs text-room-muted">
        {presses === 0
          ? "The right rotor turns on every press, and carries the next one round like a mileometer. Keep pressing."
          : moved[0]
            ? "The middle rotor moved again, carrying the left one with it: that’s the double step."
            : moved[1]
              ? "The right rotor reached its notch and carried the middle one round."
              : `${presses} ${presses === 1 ? "press" : "presses"}: only the right rotor turned.`}
      </p>
    </div>
  );
}

function Reflector() {
  const [pick, setPick] = useState("E");
  const partner = REFLECTORS.B[ALPHABET.indexOf(pick)];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {ALPHABET.split("").map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => setPick(ch)}
            aria-pressed={ch === pick}
            className={cn(chip, "size-6 text-xs", ch === pick ? "bg-brass text-brass-ink" : ch === partner ? "bg-brass-soft font-bold" : "hover:bg-panel")}
          >
            {ch}
          </button>
        ))}
      </div>
      <p>
        <span className="font-type font-bold">{pick}</span> goes in and comes back as <span className="font-type font-bold">{partner}</span>, and{" "}
        {partner} as {pick}. Never as itself.
      </p>
    </div>
  );
}

function Plug() {
  const [cable, setCable] = useState<string>("");
  const [holding, setHolding] = useState<string | null>(null);
  const letters = "ABCDEFGHI".split("");
  const tap = (ch: string) => {
    if (cable.includes(ch)) {
      setCable("");
      setHolding(null);
    } else if (holding && holding !== ch) {
      setCable(holding + ch);
      setHolding(null);
    } else {
      setHolding(ch);
      setCable("");
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="crinkle flex gap-2 rounded-md border border-case-edge px-3 py-2">
        {letters.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => tap(ch)}
            aria-label={`Socket ${ch}`}
            className={cn(
              "grid size-7 place-items-center rounded-full border-2 font-stencil text-xs font-bold text-case-ink",
              cable.includes(ch) ? "border-cable bg-cable/60" : holding === ch ? "border-lamp-on" : "border-metal-dark",
            )}
          >
            {ch}
          </button>
        ))}
      </div>
      <p className="text-xs text-room-muted">
        {cable
          ? `Cable in: ${cable[0]} goes into the rotors as ${cable[1]}, and ${cable[1]} as ${cable[0]}. Tap either end to pull it out.`
          : holding
            ? `Holding ${holding}. Tap another socket to plug the other end.`
            : "Tap two sockets to join them with a cable."}
      </p>
    </div>
  );
}

const CRIB = "WETTER";
const CRIB_CIPHER = "QRWZTEAWLMPV";

function Crib() {
  const [at, setAt] = useState(0);
  const clashes = CRIB.split("").filter((ch, i) => CRIB_CIPHER[at + i] === ch).length;
  return (
    <div className="flex flex-col gap-2">
      <div className="inline-grid w-fit grid-flow-col grid-rows-2 gap-y-0.5 font-type">
        {CRIB_CIPHER.split("").map((c, i) => {
          const k = i - at;
          const crib = k >= 0 && k < CRIB.length ? CRIB[k] : null;
          const clash = crib === c;
          return (
            <span key={i} className="contents">
              <span className={cn("w-5 text-center", clash && "rounded-t bg-signal-turn/30 font-bold")}>{c}</span>
              <span className={cn("w-5 text-center", crib === null ? "text-transparent" : clash ? "rounded-b bg-signal-turn/30 font-bold" : "bg-brass-soft")}>
                {crib ?? "·"}
              </span>
            </span>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={button} disabled={at === 0} onClick={() => setAt((a) => a - 1)} aria-label="Slide the crib left">
          ←
        </button>
        <button type="button" className={button} disabled={at === CRIB_CIPHER.length - CRIB.length} onClick={() => setAt((a) => a + 1)} aria-label="Slide the crib right">
          →
        </button>
        <span className={cn("text-xs font-semibold", clashes ? "text-signal-turn" : "text-signal-in")}>
          {clashes ? "A letter lands on itself: it can’t go here" : "No clash: it could go here"}
        </span>
      </div>
    </div>
  );
}

function Bombe() {
  const [n, setN] = useState(0);
  const [running, setRunning] = useState(false);
  useBombeSound(running);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const STOP = 4 * 676 + 13 * 26 + 2;
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);
  const run = () => {
    if (timer.current) clearInterval(timer.current);
    let at = 0;
    setRunning(true);
    setN(0);
    timer.current = setInterval(() => {
      at = Math.min(STOP, at + 37);
      setN(at);
      if (at === STOP) {
        clearInterval(timer.current!);
        setRunning(false);
      }
    }, 16);
  };
  const drums = [Math.floor(n / 676), Math.floor(n / 26) % 26, n % 26];
  return (
    <div className="flex items-center gap-3">
      <div className="crinkle flex gap-1.5 rounded-md border border-case-edge p-2">
        {drums.map((d, i) => (
          <span key={i} className="grid size-8 place-items-center rounded-full border-2 border-metal-dark bg-paper font-stencil text-sm font-bold text-paper-ink">
            {ALPHABET[d]}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <button type="button" className={button} onClick={run} disabled={running}>
          {running ? "Testing settings…" : n === STOP ? "Run it again" : "Run the Bombe"}
        </button>
        <span className="text-xs text-room-muted">{n === STOP ? "Stop! A setting that fits the crib." : running ? "Every wrong setting rejected." : ""}</span>
      </div>
    </div>
  );
}

const FREQ_TEXT = "WETTERVORHERSAGEBISKAYAWINDAUSSUEDWESTSTAERKEFUENFSICHTMITTELREGEN";

function Freq() {
  const [scrambled, setScrambled] = useState(false);
  const text = scrambled ? encipher(LAMP_KEY, FREQ_TEXT).text : FREQ_TEXT;
  const top = profile(text).slice(0, 8);
  const most = top[0].count;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-20 items-end gap-1.5" aria-label={`Commonest letters: ${top.map((t) => `${t.letter} ${t.count}`).join(", ")}`}>
        {top.map((t, i) => (
          <div key={t.letter} className="flex flex-1 flex-col items-center gap-0.5">
            <div className={cn("w-full rounded-t", i === 0 ? "bg-chart-accent" : "bg-chart-mark")} style={{ height: `${(t.count / most) * 60}px` }} />
            <span className="font-type text-xs">{t.letter}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={button} onClick={() => setScrambled((s) => !s)}>
          {scrambled ? "Show the German" : "Encipher it on Enigma"}
        </button>
        <span className="text-xs text-room-muted">{scrambled ? "Flatter: the fingerprint is smeared." : "Lumpy: E towers over the rest."}</span>
      </div>
    </div>
  );
}

function Morse() {
  const [word, setWord] = useState("SOS");
  const clean = word.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
  return (
    <div className="flex flex-col gap-2">
      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        aria-label="A word to send"
        className="w-40 rounded border border-panel-edge bg-panel px-2 py-1 font-type uppercase"
      />
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {clean.split("").map((ch, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="flex items-center gap-1" aria-label={`${ch}: ${MORSE[ch]}`}>
              {MORSE[ch].split("").map((s, j) => (
                <span key={j} className={cn("h-2 rounded-full bg-brass", s === "." ? "w-2" : "w-6")} />
              ))}
            </span>
            <span className="font-type text-xs">{ch}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const VISUALS: Record<Visual, () => React.JSX.Element> = {
  shift: Shift,
  lamp: Lamp,
  rotor: Rotor,
  reflector: Reflector,
  plug: Plug,
  crib: Crib,
  bombe: Bombe,
  freq: Freq,
  morse: Morse,
};
