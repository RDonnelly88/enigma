"use client";

import { TypeOut } from "./type-out";
import { Listen } from "@/components/ui/listen";
import { Gloss } from "@/components/glossary/gloss";
import { Stamp } from "@/components/ui/stamp";
import { useState } from "react";
import Link from "next/link";
import { MenuGraph } from "@/components/crib/menu-graph";
import { Transmitter } from "@/components/machine/transmitter";
import { Slider } from "@/components/ui/slider";
import { ALPHABET, lettersToPositions } from "@/lib/enigma";
import { machineLink } from "@/lib/share";
import { CRIB, DAY_KEY, ORDER, WEATHER, type DayData } from "@/lib/story/day";
import type { Artefact } from "@/lib/story/day-events";
import { settingsFor } from "@/lib/story/keysheet";
import { cn } from "@/lib/cn";

const groups = (t: string) => t.match(/.{1,5}/g)?.join(" ") ?? "";
const spaced = (t: string) => t.replace(/X/g, " ");
const two = (n: number) => String(n + 1).padStart(2, "0");

function Paper({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-sm bg-paper p-4 font-type text-sm leading-relaxed text-paper-ink shadow-md", className)}>{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-[10px] font-semibold tracking-widest text-paper-muted uppercase">{children}</p>;
}

/** The Bombe's run on the right rotor: drag through its positions and see where the loop test stops. */
function BombeScan({ day, solved }: { day: DayData; solved: boolean }) {
  const [at, setAt] = useState(0);
  const here = day.scan[at];
  return (
    <Gloss>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-13 gap-1" aria-hidden>
          {day.scan.map((s) => (
            <span
              key={s.position}
              className={cn(
                "grid h-7 place-items-center rounded-sm font-stencil text-[11px] font-bold",
                s.stops.length ? "bg-chart-accent text-white" : "bg-room text-room-muted",
                s.position === at && "outline-2 outline-room-ink",
                solved && s.position === day.truePosition && "ring-2 ring-signal-in ring-offset-1 ring-offset-panel",
              )}
            >
              {ALPHABET[s.position]}
            </span>
          ))}
        </div>
        <Slider label="Right drum at" value={at} min={0} max={25} onChange={setAt} format={(v) => ALPHABET[v]} />
        <p className="text-sm" data-testid="bombe-at" aria-live="polite">
          {here.stops.length
            ? `Stop. The loop holds if ${day.loop![0].a} is plugged to ${here.stops.join(" or ")}.`
            : "No stop: every guess contradicts itself round the loop."}
          {solved && here.position === day.truePosition && " This is the stop that reads."}
        </p>
        <p className="text-xs text-room-muted">
          Shown here for the right rotor alone. A real run covered all 17,576 positions of a rotor order in about twenty minutes, on menus with several loops, so far fewer false stops came out.
        </p>
      </div>
    </Gloss>
  );
}

/** `typing` is set while the clock has just reached this event, for its paperwork to be typed out in front of the reader. */
export function ArtefactView({ id, day, time, typing = false }: { id: Artefact; day: DayData; time: number; typing?: boolean }) {
  switch (id) {
    case "key-sheet":
      return (
        <Gloss>
          <Paper>
            <Label>Geheime Kommandosache · day 08</Label>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <dt className="text-paper-muted">Walzenlage</dt>
              <dd>{DAY_KEY.rotors.join(" ")}</dd>
              <dt className="text-paper-muted">Ringstellung</dt>
              <dd>{DAY_KEY.rings.map(two).join(" ")}</dd>
              <dt className="text-paper-muted">Stecker</dt>
              <dd className="break-words">{DAY_KEY.plugboard.join(" ")}</dd>
            </dl>
          </Paper>
        </Gloss>
      );
    case "weather-plain":
      return (
        <Gloss>
          <Paper>
            <p>
              <TypeOut text={spaced(WEATHER.plain)} typing={typing} />
            </p>
            <p className="mt-2 font-serif text-[0.95rem] text-paper-muted italic">{WEATHER.english}</p>
          </Paper>
        </Gloss>
      );
    case "encipher":
      return (
        <Gloss>
          <Paper>
            <Label>Indicator</Label>
            <p>
              Start <strong>{WEATHER.start}</strong>, sent in the clear · message key {WEATHER.messageKey} enciphers as{" "}
              <strong>{day.weather.enciphered}</strong>
            </p>
            <Label>Message</Label>
            <p className="break-all" data-testid="day-cipher">
              <TypeOut text={groups(day.weather.body)} typing={typing} />
            </p>
            <Link
              href={machineLink(settingsFor(DAY_KEY, lettersToPositions(WEATHER.messageKey)), WEATHER.plain)}
              className="mt-3 inline-block font-sans text-xs font-semibold text-brass underline underline-offset-2"
            >
              Encipher it yourself on the machine
            </Link>
          </Paper>
        </Gloss>
      );
    case "transmit":
      return (
        <Gloss>
          <div className="flex flex-col gap-3">
            <Paper>
              <Label>Preamble (illustrative)</Label>
              <p>
                0600 = {day.weather.body.length} = {WEATHER.start} {day.weather.enciphered} =
              </p>
            </Paper>
            <Transmitter text={day.weather.body.slice(0, 20)} onTransmit={() => {}} />
          </div>
        </Gloss>
      );
    case "intercept":
      return (
        <Gloss>
          <Paper className="border-l-4 border-signal-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>RAF Chicksands · message form · 0601</Label>
              <Listen text={day.weather.enciphered + day.weather.body} tone="paper" />
            </div>
            <p className="mt-1">
              Indicator {WEATHER.start} {day.weather.enciphered} · {day.weather.body.length} letters
            </p>
            <p className="mt-1 break-all">{groups(day.weather.body)}</p>
          </Paper>
        </Gloss>
      );
    case "registry":
      return (
        <Gloss>
          <Paper className="border-l-4 border-signal-in">
            <Label>Hut 6 registration</Label>
            <dl className="mt-1 grid grid-cols-2 gap-x-4">
              <dt className="text-paper-muted">Network</dt>
              <dd>Red (Luftwaffe general)</dd>
              <dt className="text-paper-muted">Key today</dt>
              <dd>{time >= 11 * 60 + 45 ? "broken" : "not yet broken"}</dd>
            </dl>
          </Paper>
        </Gloss>
      );
    case "crib":
      return (
        <Gloss>
          <Paper className="border-l-4 border-signal-in">
            <p className="tracking-[0.2em] break-all">{day.weather.body.slice(0, CRIB.length)}</p>
            <p className="tracking-[0.2em] break-all text-signal-in">{CRIB}</p>
            <p className="mt-2 font-sans text-xs text-paper-muted">
              No letter lands on itself, so the crib can sit at the start. {day.cribSurvivors} of {day.crib.length} positions survive the rule; Hut 6&rsquo;s knowledge of this station picks the first.
            </p>
          </Paper>
        </Gloss>
      );
    case "menu":
      return (
        <Gloss>
          <div className="rounded-lg bg-paper p-3 text-paper-ink">
            <MenuGraph links={day.links} />
          </div>
        </Gloss>
      );
    case "bombe":
      return <BombeScan day={day} solved={time >= 11 * 60 + 20} />;
    case "decrypt":
      return (
        <Gloss>
          <Paper className="border-l-4 border-signal-in">
            <Label>Checking machine</Label>
            <p>
              {WEATHER.start} {day.weather.enciphered} → message key <strong>{day.readWeather.messageKey}</strong>
            </p>
            <p className="mt-1" data-testid="day-decrypt">
              <TypeOut text={spaced(day.readWeather.text)} typing={typing} />
            </p>
          </Paper>
        </Gloss>
      );
    case "hut3":
      return (
        <Gloss>
          <Paper className="border-l-4 border-signal-in">
            <Label>Hut 3 · translation</Label>
            <p className="font-serif">
              <TypeOut text={WEATHER.english} typing={typing} />
            </p>
          </Paper>
        </Gloss>
      );
    case "order":
      return (
        <Gloss>
          <Paper>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>
                Indicator {ORDER.start} {day.order.enciphered}
              </Label>
              <Listen text={day.order.enciphered + day.order.body} tone="paper" />
            </div>
            <p className="break-all">{groups(day.order.body)}</p>
          </Paper>
        </Gloss>
      );
    case "order-read":
      return (
        <Gloss>
          <Paper className="border-l-4 border-signal-in">
            <p>
              <TypeOut text={spaced(day.readOrder.text)} typing={typing} />
            </p>
            <p className="mt-2 font-serif text-[0.95rem] text-paper-muted italic">{ORDER.english}</p>
          </Paper>
        </Gloss>
      );
    case "ultra":
      return (
        <Gloss>
          <Paper className="relative border-l-4 border-signal-in uppercase">
            <Stamp tilt={-7} className="absolute top-2 right-3 text-sm">Most secret</Stamp>
            <Label>Ultra</Label>
            <p>To Fighter Command. Bomber wing ordered to attack convoy, grid square 74, at 1600 hours. Source to be protected.</p>
          </Paper>
        </Gloss>
      );
    default:
      return null;
  }
}
