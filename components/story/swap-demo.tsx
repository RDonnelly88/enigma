"use client";

import { useState } from "react";
import { ColumnChart } from "@/components/ui/column-chart";
import { Demo } from "@/components/ui/demo";
import { Segmented } from "@/components/ui/segmented";
import { DEFAULT_SETTINGS, ROTORS, encipher, lettersToPositions, type Settings } from "@/lib/enigma";
import { profile, substitute } from "@/lib/story/frequency";

const TEXT =
  "WETTERVORHERSAGEXBISKAYAXWINDXAUSXSUEDWESTXSTAERKEXFUENFXSPAETERXABNEHMENDXSICHTXMITTELXZEITWEISEXREGENXLUFTDRUCKXFALLENDXINXDERXNACHTXWIEDERXSTEIGENDXSEEGANGXVIERXIMXNORDENXFUENFXDIEXTEMPERATURXLIEGTXBEIXZWOELFXGRADXAMXMORGENXNEBELXANXDERXKUESTEXKEINEXBESONDERENXEREIGNISSE";

const ENIGMA: Settings = { ...DEFAULT_SETTINGS, rotors: ["II", "V", "I"], positions: lettersToPositions("RQX"), plugboard: ["AN", "EZ", "HK", "LU", "RW"] };

type Mode = "swap" | "enigma";

/**
 * Why a fixed swap of the alphabet is no good. Every E becomes the same
 * letter, so the ciphertext keeps the language's fingerprint: the commonest
 * letter is still as common, only renamed. Enigma's turning rotors smear it flat.
 */
export function SwapDemo() {
  const [mode, setMode] = useState<Mode>("swap");
  const cipher =
    mode === "swap" ? substitute(TEXT, ROTORS.I.wiring) : encipher(ENIGMA, TEXT).text;
  const plain = profile(TEXT);
  const enciphered = profile(cipher);
  const chart = (p: typeof plain) => p.map((x) => ({ label: x.letter, value: x.count }));

  return (
    <Demo title="Why a simple swap fails" prompt="Switch between the two">
      <Segmented
        label="Cipher"
        value={mode}
        onChange={setMode}
        options={[
          { value: "swap", label: "A fixed swap" },
          { value: "enigma", label: "Enigma" },
        ]}
      />
      <p className="mt-4 font-type text-sm leading-snug break-all text-room-muted" data-testid="swap-cipher">
        {cipher.slice(0, 90)}…
      </p>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <h4 className="mb-3 text-sm font-semibold">Letters in the weather report, commonest first</h4>
          <ColumnChart title="Letter counts in the plaintext" data={chart(plain)} highlight={0} labels={{ 0: `${plain[0].letter} ×${plain[0].count}` }} valueHeading="Count" height={150} />
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Letters in the ciphertext, commonest first</h4>
          <ColumnChart
            title="Letter counts in the ciphertext"
            data={chart(enciphered)}
            highlight={0}
            labels={{ 0: `${enciphered[0].letter} ×${enciphered[0].count}` }}
            valueHeading="Count"
            height={150}
          />
        </div>
      </div>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-room-muted">
        {mode === "swap"
          ? `The two shapes are identical. E is the commonest letter in German, and here every E became ${substitute("E", ROTORS.I.wiring)}, so a codebreaker counting letters would spot it at once, then the next commonest, and so on. Ciphers like this were being broken by hand a thousand years ago.`
          : "The fingerprint is gone. Because the rotors turn with every key press, each E comes out as a different letter, and the counts flatten towards the same for every letter. Counting letters no longer gets you anywhere."}
      </p>
    </Demo>
  );
}
