"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { ALPHABET } from "@/lib/enigma";
import { THREE_ROTOR, WEATHER_REPORT, fourRotor, twin } from "@/lib/story/atlantic";
import { machineLink } from "@/lib/share";
import { cn } from "@/lib/cn";

const groups = (t: string) => t.match(/.{1,5}/g)?.join(" ") ?? "";

/** One machine's output, with the letters that agree with the other machine shown full and the rest marked. */
function Output({ label, text, other, testid }: { label: string; text: string; other: string; testid: string }) {
  return (
    <div className="min-w-0 rounded-sm bg-paper p-3 text-paper-ink shadow-sm">
      <p className="text-[10px] font-semibold tracking-widest text-paper-muted uppercase">{label}</p>
      <p className="mt-1 font-type text-base break-all" data-testid={testid}>
        {[...groups(text)].map((c, i, all) => {
          const at = all.slice(0, i).filter((x) => x !== " ").length;
          return (
            <span key={i} className={c !== " " && c !== other[at] ? "text-danger" : undefined}>
              {c}
            </span>
          );
        })}
      </p>
    </div>
  );
}

/**
 * The navy's four-rotor machine beside the army's three-rotor one, on the same
 * key. Turn the fourth wheel and watch the two agree at one place only.
 */
export function M4Twin() {
  const [fourth, setFourth] = useState(3);
  const [text, setText] = useState(WEATHER_REPORT);
  const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
  const { three, four, same, identical } = twin(letters, fourth);

  return (
    <Demo title="The fourth wheel" prompt="Turn it to A">
      <div className="flex flex-col gap-5">
        <p className="max-w-2xl text-sm leading-relaxed">
          Both machines have rotors {THREE_ROTOR.rotors.join(" ")} at the same rings and start, and the same ten cables. The one
          on the right is a U-boat&rsquo;s M4, with the fourth wheel, Beta, squeezed in beside a thin reflector.
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">Message</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="rounded-md border border-panel-edge bg-room px-3 py-2 font-type text-base uppercase focus:outline-2 focus:outline-brass"
          />
        </label>
        <Slider label="Fourth wheel at" value={fourth} min={0} max={25} onChange={setFourth} format={(v) => ALPHABET[v]} />
        <div className="grid gap-3 md:grid-cols-2">
          <Output label="Three rotors, reflector B" text={three} other={four} testid="m3-out" />
          <Output label={`Four rotors, Beta at ${ALPHABET[fourth]}, thin reflector B`} text={four} other={three} testid="m4-out" />
        </div>
        {letters && (
          <p
            className={cn("flex items-start gap-2 text-sm font-semibold", identical ? "text-signal-in" : "text-room-ink")}
            data-testid="twin-verdict"
            aria-live="polite"
          >
            {identical ? <Check className="mt-0.5 size-4 shrink-0" /> : <X className="mt-0.5 size-4 shrink-0 text-danger" />}
            {identical
              ? "Identical, letter for letter. With the fourth wheel at A, the M4 is the three-rotor machine."
              : `${same} of ${letters.length} letters agree, by chance. Anywhere but A, it is a different machine.`}
          </p>
        )}
        <p className="text-sm text-room-muted">
          Try it on the{" "}
          <Link href={machineLink(fourRotor(fourth), letters)} className="text-brass underline underline-offset-2">
            machine
          </Link>
          , set up as this M4.
        </p>
      </div>
    </Demo>
  );
}
