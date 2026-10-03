"use client";

import { useState } from "react";
import { ColumnChart } from "@/components/ui/column-chart";
import { Demo } from "@/components/ui/demo";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/cn";
import { readable } from "@/components/glossary/gloss";
import { ALPHABET, DEFAULT_SETTINGS, ROTORS, encipher, lettersToPositions, type Settings } from "@/lib/enigma";
import { profile, substitute } from "@/lib/story/frequency";

const TEXT =
  "WETTERVORHERSAGEXBISKAYAXWINDXAUSXSUEDWESTXSTAERKEXFUENFXSPAETERXABNEHMENDXSICHTXMITTELXZEITWEISEXREGENXLUFTDRUCKXFALLENDXINXDERXNACHTXWIEDERXSTEIGENDXSEEGANGXVIERXIMXNORDENXFUENFXDIEXTEMPERATURXLIEGTXBEIXZWOELFXGRADXAMXMORGENXNEBELXANXDERXKUESTEXKEINEXBESONDERENXEREIGNISSE";

const ENGLISH =
  "Weather forecast, Bay of Biscay. Wind from the south-west, force five, easing later. Visibility moderate, rain at times. Air pressure falling, rising again overnight. Sea state four, five in the north. Temperature twelve degrees. Fog on the coast in the morning. Nothing else to report.";

const KEY = ROTORS.I.wiring;
const ENIGMA: Settings = { ...DEFAULT_SETTINGS, rotors: ["II", "V", "I"], positions: lettersToPositions("RQX"), plugboard: ["AN", "EZ", "HK", "LU", "RW"] };
const SHOWN = 40;

type Mode = "swap" | "enigma";

const Step = readable(function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold">
        <span className="grid size-6 place-items-center rounded-full bg-brass font-stencil text-xs text-brass-ink">{n}</span>
        {title}
      </h4>
      {children}
    </section>
  );
});

/**
 * Why a fixed swap of the alphabet is no good. Every E becomes the same
 * letter, so the ciphertext keeps the language's fingerprint: the commonest
 * letter is still as common, only renamed. Enigma's turning rotors smear it flat.
 */
export function SwapDemo() {
  const [mode, setMode] = useState<Mode>("swap");
  const cipher = mode === "swap" ? substitute(TEXT, KEY) : encipher(ENIGMA, TEXT).text;
  const plain = profile(TEXT);
  const enciphered = profile(cipher);
  const chart = (p: typeof plain) => p.map((x) => ({ label: x.letter, value: x.count }));

  // What every E in the message turned into
  const fromE = new Set(TEXT.split("").flatMap((ch, i) => (ch === "E" ? [cipher[i]] : [])));
  const eBecame = KEY[ALPHABET.indexOf("E")];
  const top = enciphered[0];

  return (
    <Demo title="Why a simple swap fails" prompt="Switch between the two">
      <div className="flex flex-col gap-8">
        <Step n={1} title="The message: a German weather report">
          <p className="font-type text-sm leading-relaxed break-words">{TEXT.replace(/X/g, " ")}</p>
          <p className="font-serif text-[0.95rem] text-room-muted italic">{ENGLISH}</p>
          <p className="text-sm text-room-muted">
            Operators typed X for each space, because the machine had no space bar. E is by far the commonest letter in
            German, as in English.
          </p>
        </Step>

        <Step n={2} title="Scramble it">
          <div className="w-fit">
            <Segmented
            label="Cipher"
            value={mode}
            onChange={setMode}
            options={[
              { value: "swap", label: "A fixed swap" },
              { value: "enigma", label: "Enigma" },
            ]}
            />
          </div>
          {mode === "swap" ? (
            <div>
              <p className="text-sm text-room-muted">
                The oldest kind of cipher: a secret alphabet, where each letter is always swapped for the same other one.
              </p>
              <div className="rail mt-2 overflow-x-auto" aria-label="The secret alphabet">
                <div className="inline-grid grid-flow-col grid-rows-2 font-type text-sm">
                  {ALPHABET.split("").map((ch, i) => (
                    <span key={ch} className="contents">
                      <span className={cn("w-6 text-center", ch === "E" && "rounded-t bg-brass-soft font-bold")}>{ch}</span>
                      <span className={cn("w-6 text-center text-brass", ch === "E" && "rounded-b bg-brass-soft font-bold")}>{KEY[i]}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-room-muted">
              Enigma&rsquo;s swap changes with every key press, because the rotors turn before each letter.
            </p>
          )}
          <div className="rail overflow-x-auto">
            <div className="inline-grid grid-flow-col grid-rows-2 gap-y-1 font-type text-sm" data-testid="swap-strip">
              {TEXT.slice(0, SHOWN)
                .split("")
                .map((ch, i) => (
                  <span key={i} className="contents">
                    <span className={cn("w-5 text-center", ch === "E" ? "rounded-t bg-brass-soft font-bold" : ch === "X" && "text-room-muted/50")}>{ch}</span>
                    <span className={cn("w-5 text-center text-brass", ch === "E" && "rounded-b bg-brass-soft font-bold")}>{cipher[i]}</span>
                  </span>
                ))}
              <span className="row-span-2 self-center pl-1 text-room-muted">…</span>
            </div>
          </div>
          <p className="text-sm font-semibold" data-testid="swap-e">
            {mode === "swap"
              ? `Every E became ${eBecame}. The same letter, every time.`
              : `In this message, E came out as ${fromE.size} different letters.`}
          </p>
        </Step>

        <Step n={3} title="Count the letters">
          <p className="text-sm text-room-muted">
            A codebreaker&rsquo;s first move: count how often each letter appears in the scrambled message, and compare with
            ordinary German.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h5 className="mb-3 text-sm font-semibold">The German, commonest letter first</h5>
              <ColumnChart title="Letter counts in the weather report" data={chart(plain)} highlight={0} labels={{ 0: `${plain[0].letter} ×${plain[0].count}` }} valueHeading="Count" height={150} />
            </div>
            <div>
              <h5 className="mb-3 text-sm font-semibold">The scrambled message, commonest letter first</h5>
              <ColumnChart
                title="Letter counts in the scrambled message"
                data={chart(enciphered)}
                highlight={0}
                labels={{ 0: `${top.letter} ×${top.count}` }}
                valueHeading="Count"
                height={150}
              />
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed">
            {mode === "swap"
              ? `The two shapes are identical: the ${plain[0].count} Es are now ${plain[0].count} ${eBecame}s. A codebreaker guesses that the commonest scrambled letter is E, the next is the next commonest German letter, and so on, until words appear. Ciphers like this were broken by hand over a thousand years ago.`
              : `The fingerprint is gone. Spread across ${fromE.size} letters, the Es no longer stand out, the counts flatten towards the same for every letter, and counting gets a codebreaker nowhere.`}
          </p>
        </Step>
      </div>
    </Demo>
  );
}
