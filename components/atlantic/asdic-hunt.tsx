"use client";

import { useEffect, useRef, useState } from "react";
import { Radio, RotateCcw, Waves } from "lucide-react";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { UBoat } from "@/components/art/silhouettes";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { BEAM, hunt, move, ping, sector, type Echo, type Hunt } from "@/lib/story/asdic";
import { playDepthCharge, playPing } from "@/lib/sound";
import { cn } from "@/lib/cn";

/** The plot's outer ring, in yards. */
const REACH = 2500;
const R = 120;
const at = (bearing: number, range: number) => {
  const r = (range / REACH) * R;
  const a = ((bearing - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)] as const;
};

type Heard = { bearing: number; echo: Echo | null };
type Ending = "sunk" | "missed";

/**
 * Hunt the U-boat with ASDIC. Ultra says roughly which way to look; the escort
 * trains its beam, pings, and listens for an echo: its delay gives the range,
 * its note whether the U-boat is closing. Then the depth charges.
 */
export function AsdicHunt() {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(1);
  const [boat, setBoat] = useState<Hunt>(() => hunt(1));
  const [bearing, setBearing] = useState(0);
  const [pings, setPings] = useState(0);
  const [heard, setHeard] = useState<Heard | null>(null);
  const [listening, setListening] = useState(false);
  const [ending, setEnding] = useState<Ending | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const start = (next: number) => {
    clearTimeout(timer.current);
    setN(next);
    setBoat(hunt(next));
    setPings(0);
    setHeard(null);
    setListening(false);
    setEnding(null);
  };

  const send = () => {
    const echo = ping(boat, bearing);
    playPing(echo ?? undefined);
    setPings((p) => p + 1);
    setListening(true);
    // The answer comes when the echo would: out and back through the water
    const wait = reduced ? 0 : echo ? echo.after * 1000 : 2000;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setHeard({ bearing, echo });
      setListening(false);
      setBoat((b) => move(b, pings));
    }, wait);
  };

  // A pattern dropped on a held contact sinks the U-boat; dropped on nothing, it only shakes the fish
  const attack = () => {
    [0, 0.35, 0.7, 1.05, 1.4].forEach((t) => playDepthCharge(t));
    setEnding(heard?.echo ? "sunk" : "missed");
  };

  const contact = heard?.echo ? at(heard.bearing, heard.echo.range) : null;
  const beam = (b: number) => {
    const [x1, y1] = at(b - BEAM, REACH);
    const [x2, y2] = at(b + BEAM, REACH);
    return `M0 0 L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <Demo title="Hunt the U-boat" prompt="Train the beam, then ping">
      <div className="flex flex-col gap-5">
        <p className="max-w-2xl text-sm leading-relaxed">
          Ultra has put your escort near the pack, and a U-boat has dived ahead of the convoy. Ultra can&rsquo;t say exactly
          where it is: that is ASDIC&rsquo;s job. Train the beam, send a ping, and listen. Turn your sound on to hear the echo.
        </p>
        <p className="flex items-center gap-2 text-sm font-semibold text-signal-in" data-testid="asdic-hint">
          <Radio className="size-4 shrink-0" /> Ultra: a U-boat to the {sector(hunt(n).bearing)}, within 2,500 yards.
        </p>

        <div className="grid items-center gap-5 md:grid-cols-[minmax(0,20rem)_1fr]">
          <svg
            viewBox="-140 -140 280 280"
            className="w-full max-w-xs justify-self-center rounded-full bg-case"
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG is the image
            role="img"
            aria-label={`The ASDIC plot, with the beam on ${bearing} degrees.${
              heard?.echo ? ` A contact at ${heard.echo.range} yards on ${heard.bearing} degrees.` : ""
            }`}
          >
            {[1000, 2000, REACH].map((r) => (
              <circle key={r} r={(r / REACH) * R} className="fill-none stroke-case-ink/25" strokeDasharray={r === REACH ? undefined : "3 4"} />
            ))}
            {[0, 90, 180, 270].map((b) => {
              const [x, y] = at(b, REACH + 260);
              return (
                <text key={b} x={x} y={y + 4} textAnchor="middle" className="fill-case-ink/60 font-stencil text-[11px] font-bold">
                  {"NESW"[b / 90]}
                </text>
              );
            })}
            <g transform={`rotate(${bearing})`}>
              <path d={beam(0)} className={cn("fill-signal-in/25", listening && "art-pulse")} />
            </g>
            {heard && !heard.echo && (
              <path d={beam(heard.bearing)} className="fill-none stroke-case-ink/30" strokeDasharray="2 3" />
            )}
            {contact && (
              <g transform={`translate(${contact[0]} ${contact[1]})`} data-testid="asdic-contact">
                <circle r={9} className="fill-none stroke-lamp-on art-pulse" strokeWidth={2} />
                <circle r={3.5} className="fill-lamp-on" />
              </g>
            )}
            {ending === "sunk" && contact && (
              <g transform={`translate(${contact[0] - 12} ${contact[1] + 16})`}>
                <UBoat className="text-cable" transform="rotate(20) scale(0.13)" periscope={false} />
              </g>
            )}
            {/* Your escort at the centre of the plot */}
            <path d="M0 -8 L4 4 L0 2 L-4 4 Z" className="fill-case-ink" />
          </svg>

          <div className="flex flex-col gap-4">
            <Slider label="Beam bearing" value={bearing} min={0} max={355} step={5} onChange={setBearing} format={(v) => `${String(v).padStart(3, "0")}°`} />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={send}
                disabled={listening || !!ending}
                className="inline-flex items-center gap-1.5 rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room disabled:opacity-50"
              >
                <Waves className="size-4" /> Ping
              </button>
              <button
                type="button"
                onClick={attack}
                disabled={!heard || listening || !!ending}
                className="rounded-full border border-cable px-4 py-2 text-sm font-semibold text-cable disabled:opacity-40"
              >
                Drop depth charges
              </button>
            </div>
            <p className="min-h-12 text-sm leading-relaxed" data-testid="asdic-says" aria-live="polite">
              {ending === "sunk"
                ? `A pattern of depth charges goes down on the contact. Oil and wreckage come to the surface: the U-boat is sunk, found in ${pings} ${pings === 1 ? "ping" : "pings"}.`
                : ending === "missed"
                  ? "The charges go down on empty sea. Without a contact, there was nothing to aim at, and the U-boat slips away."
                  : listening
                    ? "Listening…"
                    : heard?.echo
                      ? `Echo! ${heard.echo.range.toLocaleString("en-GB")} yards on ${heard.bearing}°, back after ${heard.echo.after.toFixed(1)} seconds. The note is ${
                          heard.echo.shift > 0 ? "higher: it is closing" : "lower: it is opening the range"
                        }. Drop depth charges while you hold it, or ping again.`
                      : heard
                        ? `No echo on ${heard.bearing}°. Nothing there; try another bearing.`
                        : "No ping sent yet."}
            </p>
            {ending && (
              <button
                type="button"
                onClick={() => start(n + 1)}
                className="inline-flex items-center gap-1 self-start text-sm text-room-muted underline underline-offset-2 hover:text-room-ink"
              >
                <RotateCcw className="size-3.5" /> Another U-boat
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-room-muted">
          Simplified: a real ASDIC operator swept the beam a few degrees at a time, listening after every ping, and lost contact
          in the final run in as the escort passed over the U-boat. Ultra found the packs; ASDIC, radar and aircraft found the
          boats.
        </p>
      </div>
    </Demo>
  );
}
