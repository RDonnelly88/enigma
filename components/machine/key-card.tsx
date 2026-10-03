"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Stamp } from "@/components/ui/stamp";
import { ALPHABET, GREEK_ROTORS, M3_REFLECTORS, M4_REFLECTORS, ROTORS, type Settings } from "@/lib/enigma";
import { keyCode, readKeyCode } from "@/lib/share";
import { cn } from "@/lib/cn";

const letters = (ns: number[]) => ns.map((n) => ALPHABET[n]).join(" ");

/** The parts of a key in the order the card lists them, with the German a key sheet used. */
function rows(s: Settings) {
  const m4 = s.model === "M4";
  return [
    { label: "Reflector", german: "Umkehrwalze", value: s.reflector },
    { label: "Rotors, left to right", german: "Walzenlage", value: (m4 ? [s.greek, ...s.rotors] : s.rotors).join(" ") },
    { label: "Rings", german: "Ringstellung", value: letters(m4 ? [s.greekRing, ...s.rings] : s.rings) },
    { label: "Start", german: "Grundstellung", value: letters(m4 ? [s.greekPosition, ...s.positions] : s.positions) },
    { label: "Cables", german: "Steckerverbindungen", value: s.plugboard.join(" ") || "none" },
  ];
}

/**
 * A key written out as a card to hand over, like a strip cut from a key
 * sheet: everything the other machine needs, and nothing of the message.
 */
export function KeyCard({ settings, from, to, onPrint }: { settings: Settings; from?: string; to?: string; onPrint?: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <figure data-testid="key-card" className="print-me relative rounded-sm border-2 border-dashed border-paper-muted/60 bg-paper p-4 font-type text-paper-ink shadow-md">
        <Stamp tilt={-6} className="absolute top-3 right-3 text-xs">Geheim</Stamp>
        <p className="font-sans text-[10px] font-semibold tracking-[0.25em] text-paper-muted uppercase">Key card</p>
        {(from || to) && (
          <p className="mt-1 font-sans text-sm">
            {to && <>For {to}</>}
            {to && from && " · "}
            {from && <>from {from}</>}
          </p>
        )}
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
          {rows(settings).map((r) => (
            <div key={r.label} className="contents">
              <dt className="font-sans text-xs leading-6 text-paper-muted">
                {r.label} <span className="italic">({r.german})</span>
              </dt>
              <dd className="break-words">{r.value}</dd>
            </div>
          ))}
        </dl>
        <figcaption className="mt-3 border-t border-dashed border-paper-muted/50 pt-2 font-sans text-xs text-paper-muted">
          Or type the whole key as one line: <span className="font-type text-paper-ink">{keyCode(settings)}</span>
        </figcaption>
      </figure>
      <button type="button" onClick={() => {
          onPrint?.();
          window.print();
        }} className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brass underline underline-offset-2">
        <Printer className="size-4" /> Print the key card
      </button>
    </div>
  );
}

const field = "rounded-sm border border-paper-muted/60 bg-transparent px-2 py-1.5 font-type text-base text-paper-ink focus:outline-2 focus:outline-paper-ink";
const caption = "font-sans text-[11px] font-semibold tracking-widest text-paper-muted uppercase";

/**
 * Setting the machine from a key card, part by part, as the operator at the
 * other end did. A whole key code pasted in works as well.
 */
export function KeyCardForm({ onSet }: { onSet: (settings: Settings) => void }) {
  const [m4, setM4] = useState(false);
  const [reflector, setReflector] = useState("B");
  const [greek, setGreek] = useState("Beta");
  const [rotors, setRotors] = useState(["I", "II", "III"]);
  const [rings, setRings] = useState("");
  const [start, setStart] = useState("");
  const [cables, setCables] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const wheels = m4 ? 4 : 3;
  const reflectors = m4 ? M4_REFLECTORS : M3_REFLECTORS;

  const submit = () => {
    const pad = (t: string) => t.toUpperCase().replace(/[^A-Z]/g, "").padEnd(wheels, "A");
    const fromCard = [reflector, (m4 ? [greek, ...rotors] : rotors).join(" "), pad(rings), pad(start), cables.trim() || "no cables"].join(" · ");
    const settings = readKeyCode(code.trim() || fromCard);
    setError(!settings);
    if (settings) onSet(settings);
  };

  return (
    <form
      aria-label="Key card"
      className="flex flex-col gap-4 rounded-sm bg-paper p-4 text-paper-ink shadow-md"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={caption}>Copy your key card onto the machine</p>
        <fieldset className="flex gap-3 text-sm">
          <legend className="sr-only">Which machine</legend>
          {[false, true].map((navy) => (
            <label key={String(navy)} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="machine"
                checked={m4 === navy}
                onChange={() => {
                  setM4(navy);
                  setReflector(navy ? "B Thin" : "B");
                }}
                className="accent-paper-ink"
              />
              {navy ? "Four rotors" : "Three rotors"}
            </label>
          ))}
        </fieldset>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={caption}>Reflector</span>
          <select value={reflector} onChange={(e) => setReflector(e.target.value)} className={field}>
            {reflectors.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <fieldset className="flex flex-col gap-1">
          <legend className={caption}>Rotors, left to right</legend>
          <div className="mt-1 flex gap-1.5">
            {m4 && (
              <select aria-label="Greek wheel" value={greek} onChange={(e) => setGreek(e.target.value)} className={field}>
                {Object.keys(GREEK_ROTORS).map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            )}
            {rotors.map((r, i) => (
              <select
                key={i}
                aria-label={`Rotor ${["left", "middle", "right"][i]}`}
                value={r}
                onChange={(e) => setRotors(rotors.map((x, j) => (j === i ? e.target.value : x)))}
                className={cn(field, "min-w-0 flex-1")}
              >
                {Object.keys(ROTORS).map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col gap-1">
          <span className={caption}>Rings</span>
          <input value={rings} onChange={(e) => setRings(e.target.value)} placeholder={"A".repeat(wheels)} maxLength={wheels * 2} autoComplete="off" spellCheck={false} className={cn(field, "uppercase")} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={caption}>Start</span>
          <input value={start} onChange={(e) => setStart(e.target.value)} placeholder={"A".repeat(wheels)} maxLength={wheels * 2} autoComplete="off" spellCheck={false} className={cn(field, "uppercase")} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className={caption}>Cables</span>
          <input value={cables} onChange={(e) => setCables(e.target.value)} placeholder="AV BS CG" autoComplete="off" spellCheck={false} className={cn(field, "uppercase")} />
        </label>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-paper-muted hover:text-paper-ink">Sent the key as one line instead?</summary>
        <label className="mt-2 flex flex-col gap-1">
          <span className={caption}>Key code</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="B · II IV V · BUL · BLA · AV BS" autoComplete="off" spellCheck={false} className={field} />
        </label>
      </details>
      <button type="submit" className="w-fit rounded-md bg-paper-ink px-4 py-2 text-sm font-semibold text-paper">
        Set the machine and read it
      </button>
      {error && (
        <p className="text-sm text-danger" role="alert">
          That isn&rsquo;t a key the machine can use. Check each line against the card: no rotor used twice, and no letter in two cables.
        </p>
      )}
    </form>
  );
}
