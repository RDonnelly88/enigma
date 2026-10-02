"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { ALPHABET } from "@/lib/enigma";
import { keySheet, settingsFor, type DailyKey } from "@/lib/story/keysheet";
import { sendMessage } from "@/lib/story/procedure";
import { machineLink } from "@/lib/share";
import { cn } from "@/lib/cn";

const SHEET = keySheet();
const MORSE: Record<string, string> = {
  A: "·–", B: "–···", C: "–·–·", D: "–··", E: "·", F: "··–·", G: "––·", H: "····", I: "··", J: "·–––", K: "–·–", L: "·–··", M: "––",
  N: "–·", O: "–––", P: "·––·", Q: "––·–", R: "·–·", S: "···", T: "–", U: "··–", V: "···–", W: "·––", X: "–··–", Y: "–·––", Z: "––··",
};

const two = (n: number) => String(n + 1).padStart(2, "0");
const letters = (ns: number[]) => ns.map((n) => ALPHABET[n]).join("");
const groups = (text: string) => text.match(/.{1,5}/g)?.join(" ") ?? "";

/** The day's key and the 1930s sending procedure, sharing the day picked on the sheet. */
export function OperatorDemos() {
  const [day, setDay] = useState(0);
  const key = SHEET[day];
  return (
    <>
      <KeySheet selected={day} onSelect={setDay} />
      <Procedure dayKey={key} />
    </>
  );
}

function KeySheet({ selected, onSelect }: { selected: number; onSelect: (day: number) => void }) {
  const key = SHEET[selected];
  return (
    <Demo title="A month of keys" prompt="Pick a day">
      <div className="rounded-sm bg-paper p-4 text-paper-ink shadow-md sm:p-5">
        <p className="text-center font-type text-sm tracking-[0.3em] uppercase">Geheime Kommandosache</p>
        <p className="mt-1 text-center text-xs text-paper-muted">A practice sheet laid out like a 1930s army key list</p>
        <div className="mt-4 max-h-80 overflow-auto">
          <table className="w-full min-w-[34rem] text-left font-type text-sm">
            <thead className="sticky top-0 bg-paper text-[11px] tracking-wider text-paper-muted">
              <tr>
                <th className="py-1.5 pr-3 font-normal">Tag</th>
                <th className="py-1.5 pr-3 font-normal">Walzenlage</th>
                <th className="py-1.5 pr-3 font-normal">Ringstellung</th>
                <th className="py-1.5 pr-3 font-normal">Steckerverbindungen</th>
                <th className="py-1.5 font-normal">Grundstellung</th>
              </tr>
            </thead>
            <tbody>
              {SHEET.map((k, i) => (
                <tr key={k.day} className={cn("border-t border-paper-ink/10", i === selected && "bg-brass/20")}>
                  <td className="py-1 pr-3">
                    <button
                      type="button"
                      aria-pressed={i === selected}
                      aria-label={`Day ${k.day}`}
                      onClick={() => onSelect(i)}
                      className="w-8 rounded-sm text-left font-bold underline-offset-2 hover:underline"
                    >
                      {two(k.day - 1)}
                    </button>
                  </td>
                  <td className="py-1 pr-3 whitespace-nowrap">{k.rotors.join(" ")}</td>
                  <td className="py-1 pr-3 whitespace-nowrap">{k.rings.map(two).join(" ")}</td>
                  <td className="py-1 pr-3 whitespace-nowrap">{k.plugboard.join(" ")}</td>
                  <td className="py-1 whitespace-nowrap">{letters(k.basic)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[1fr_auto] sm:items-end">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          <Field label="Rotors, left to right" value={key.rotors.join(" ")} />
          <Field label="Rings" value={key.rings.map(two).join(" ")} />
          <Field label="Cables" value={`${key.plugboard.length} pairs`} />
          <Field label="Basic setting" value={letters(key.basic)} />
        </dl>
        <Link
          href={machineLink(settingsFor(key, key.basic), "")}
          className="w-fit rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room"
        >
          Set the machine to day {key.day}
        </Link>
      </div>
      <div className="mt-6 max-w-2xl space-y-3 font-serif text-[1.05rem] leading-relaxed text-room-ink/90">
        <p>
          Every unit on a network used the same settings each day, printed on a sheet issued a month at a time. At
          midnight the operator opened the machine, fitted the day&rsquo;s rotors in the right order, turned each ring to
          its number, and plugged the cables.
        </p>
        <p>
          The sheets were the most closely guarded part of the system. A captured machine told an enemy how Enigma worked;
          a captured key sheet let them read every message on that network for a month.
        </p>
      </div>
    </Demo>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">{label}</dt>
      <dd className="font-type text-base">{value}</dd>
    </div>
  );
}

function Procedure({ dayKey }: { dayKey: DailyKey }) {
  const [messageKey, setMessageKey] = useState([22, 23, 17]);
  const [text, setText] = useState("ANGRIFF IM MORGENGRAUEN");
  const mk = letters(messageKey);
  const plaintext = text.toUpperCase().replace(/[^A-Z ]/g, "").trim().replace(/ +/g, "X");
  const sent = useMemo(() => sendMessage(dayKey, mk, plaintext), [dayKey, mk, plaintext]);

  const steps: { title: string; body: React.ReactNode }[] = [
    {
      title: "Set up the day's key",
      body: (
        <>
          Rotors {dayKey.rotors.join(" ")}, rings {dayKey.rings.map(two).join(" ")}, ten cables: day {dayKey.day} from the sheet.
        </>
      ),
    },
    {
      title: "Turn to the basic setting",
      body: (
        <>
          The sheet&rsquo;s Grundstellung, <Mono>{letters(dayKey.basic)}</Mono>, the same for everyone that day.
        </>
      ),
    },
    {
      title: "Type the message key, twice",
      body: (
        <>
          The operator makes up three letters, <Mono>{mk}</Mono>, and types them twice in case one is garbled in sending.
          The lamps light <Indicator value={sent.indicator} />.
        </>
      ),
    },
    {
      title: "Turn to the message key",
      body: (
        <>
          Now the rotors go to <Mono>{mk}</Mono>, so every message starts somewhere different and no two share a setting.
        </>
      ),
    },
    {
      title: "Type the message",
      body: (
        <>
          <Mono>{plaintext || "…"}</Mono> lights <Mono>{groups(sent.body) || "…"}</Mono>
        </>
      ),
    },
    {
      title: "Send it by Morse",
      body: (
        <>
          The six indicator letters go first, then the message in groups of five. In dots and dashes the indicator alone is{" "}
          <span className="mt-1 block font-mono text-base font-bold tracking-[0.2em] text-brass" data-testid="morse">
            {sent.indicator.split("").map((c) => MORSE[c]).join("   ")}
          </span>
        </>
      ),
    },
  ];

  return (
    <Demo title="Sending a message, 1930s" prompt="Choose a message key">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          {["First", "Second", "Third"].map((label, i) => (
            <Slider
              key={label}
              label={`${label} letter of the key`}
              value={messageKey[i]}
              min={0}
              max={25}
              onChange={(v) => setMessageKey((k) => k.map((x, j) => (j === i ? v : x)))}
              format={(v) => ALPHABET[v]}
            />
          ))}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">Message</span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={60}
              spellCheck={false}
              className="rounded-md border border-panel-edge bg-room px-3 py-2 font-type uppercase focus:outline-2 focus:outline-brass"
            />
          </label>
        </div>
        <ol className="relative flex flex-col gap-5 border-l border-panel-edge pl-6">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[2.15rem] grid size-7 place-items-center rounded-full border border-brass bg-panel font-stencil text-sm font-bold text-brass">
                {i + 1}
              </span>
              <h4 className="font-semibold">{s.title}</h4>
              <p className="mt-1 text-sm leading-relaxed break-words text-room-ink/85">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-8 rounded-lg border border-danger/40 p-4">
        <h4 className="font-semibold text-danger">The flaw</h4>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed">
          Typing the key twice meant the 1st and 4th letters of every indicator were the same letter, enciphered three key
          presses apart; likewise the 2nd and 5th, and the 3rd and 6th. Every operator on the network did this from the
          same basic setting, every day. In 1932 a Polish mathematician, Marian Rejewski, showed that a day&rsquo;s worth
          of these indicators gave away the rotor wiring and the day&rsquo;s key.{" "}
          <Link href="/crib" className="font-semibold text-brass underline underline-offset-2">
            How he did it
          </Link>
          .
        </p>
      </div>
    </Demo>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-type text-[0.95rem] break-all">{children}</span>;
}

/** The six indicator letters, with each pair that hides the same letter tinted alike. */
function Indicator({ value }: { value: string }) {
  const tint = ["bg-signal-in/25", "bg-signal-out/30", "bg-signal-turn/25"];
  return (
    <span className="inline-flex gap-0.5 align-baseline font-type" data-testid="indicator">
      {value.split("").map((c, i) => (
        <span key={i} className={cn("rounded-sm px-1", tint[i % 3], i === 3 && "ml-1.5")}>
          {c}
        </span>
      ))}
    </span>
  );
}
