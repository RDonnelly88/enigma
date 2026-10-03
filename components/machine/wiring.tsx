"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ALPHABET, toLetter, type Hop, type Keypress, type Settings, type Stage } from "@/lib/enigma";

const COLUMN = 52;
const GAP = 26;
const TOP = 44;
const ROW = 19;
const HEIGHT = TOP + ROW * 26 + 10;

type Column = { stage: Stage | "keys"; label: string; sub?: string };

function columns(settings: Settings, positions: Settings["positions"]): Column[] {
  const [l, m, r] = settings.rotors;
  return [
    { stage: "reflector", label: "UKW", sub: settings.reflector },
    ...(settings.model === "M4"
      ? [{ stage: "greek" as const, label: settings.greek, sub: toLetter(settings.greekPosition) }]
      : []),
    { stage: "left", label: l, sub: toLetter(positions[0]) },
    { stage: "middle", label: m, sub: toLetter(positions[1]) },
    { stage: "right", label: r, sub: toLetter(positions[2]) },
    { stage: "plugboard", label: "Plugs" },
    { stage: "keys", label: "Keys" },
  ];
}

const y = (contact: number) => TOP + ROW * contact + ROW / 2;
const colour = (hop: Pick<Hop, "direction">) =>
  hop.direction === "in" ? "var(--signal-in)" : hop.direction === "turn" ? "var(--signal-turn)" : "var(--signal-out)";

/**
 * The current's route through the machine, drawn the way it would look with
 * every component opened out side by side: in from the key on the right,
 * leftwards through each wheel, round the reflector and back out to a lamp.
 */
export function Wiring({ settings, press, focus }: { settings: Settings; press: Keypress | null; focus?: number }) {
  const reduced = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  // On a narrow screen the diagram scrolls; start at the keys, where the current begins
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);
  const cols = columns(settings, press?.positions ?? settings.positions);
  const width = cols.length * COLUMN + (cols.length - 1) * GAP;
  const left = (stage: Column["stage"]) => cols.findIndex((c) => c.stage === stage) * (COLUMN + GAP);
  const right = (stage: Column["stage"]) => left(stage) + COLUMN;

  // Each hop crosses one component, then a straight wire carries it to the next
  // Each segment belongs to a hop of the path, so one hop can be picked out
  const segments: { d: string; stroke: string; hop: number }[] = [];
  if (press) {
    const first = press.path[0];
    segments.push({ d: `M ${left("keys") + COLUMN / 2} ${y(first.from)} H ${right("plugboard")}`, stroke: colour(first), hop: 0 });
    press.path.forEach((hop, i) => {
      const stroke = colour(hop);
      if (hop.direction === "turn") {
        const x = right("reflector");
        segments.push({ d: `M ${x} ${y(hop.from)} C ${x - COLUMN * 0.9} ${y(hop.from)}, ${x - COLUMN * 0.9} ${y(hop.to)}, ${x} ${y(hop.to)}`, stroke, hop: i });
      } else if (hop.direction === "in") {
        segments.push({ d: `M ${right(hop.stage)} ${y(hop.from)} L ${left(hop.stage)} ${y(hop.to)}`, stroke, hop: i });
      } else {
        segments.push({ d: `M ${left(hop.stage)} ${y(hop.from)} L ${right(hop.stage)} ${y(hop.to)}`, stroke, hop: i });
      }
      const next = press.path[i + 1];
      if (next) {
        const fromX = hop.direction === "in" ? left(hop.stage) : right(hop.stage);
        const toX = next.direction === "in" || next.direction === "turn" ? right(next.stage) : left(next.stage);
        segments.push({ d: `M ${fromX} ${y(hop.to)} H ${toX}`, stroke: colour(next), hop: i + 1 });
      }
    });
    const last = press.path.at(-1)!;
    segments.push({ d: `M ${right("plugboard")} ${y(last.to)} H ${left("keys") + COLUMN / 2}`, stroke: colour(last), hop: press.path.length - 1 });
  }

  // The contacts the current touched, column by column
  const touched = new Map<Column["stage"], Set<number>>();
  const touch = (stage: Column["stage"], ...contacts: number[]) =>
    contacts.forEach((c) => touched.set(stage, (touched.get(stage) ?? new Set()).add(c)));
  if (press) {
    press.path.forEach((hop) => touch(hop.stage, hop.from, hop.to));
    touch("keys", press.path[0].from, press.path.at(-1)!.to);
  }
  const step = reduced ? 0 : 0.6 / Math.max(segments.length, 1);

  return (
    <figure>
      <div ref={scroller} className="overflow-x-auto">
      <svg
        viewBox={`-4 0 ${width + 8} ${HEIGHT}`}
        className="mx-auto block w-full min-w-[24rem] max-w-3xl"
        // An inline SVG is the image; there's no <img> to swap in
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="img"
        aria-label={
          press
            ? `${press.input} enters on the right, passes ${press.path.map((h) => toLetter(h.to)).join(", ")}, and lights ${press.output}`
            : "Wiring diagram. Press a key to trace its path."
        }
      >
        {cols.map((col) => {
          const x = left(col.stage);
          return (
            <g key={col.stage}>
              <text x={x + COLUMN / 2} y={14} textAnchor="middle" className="fill-case-ink font-stencil text-[13px] font-bold">
                {col.label}
              </text>
              {col.sub && (
                <text x={x + COLUMN / 2} y={30} textAnchor="middle" className="fill-case-muted font-stencil text-[11px]">
                  {col.sub}
                </text>
              )}
              <rect x={x} y={TOP - 4} width={COLUMN} height={ROW * 26 + 8} rx={8} className="fill-key stroke-case-edge" strokeWidth={1.5} />
              {ALPHABET.split("").map((letter, i) => (
                <text
                  key={letter}
                  x={x + COLUMN / 2}
                  y={y(i) + 4}
                  textAnchor="middle"
                  className={`font-stencil text-[11px] ${touched.get(col.stage)?.has(i) ? "fill-case-ink font-bold" : "fill-case-muted/60"}`}
                >
                  {letter}
                </text>
              ))}
            </g>
          );
        })}
        {segments.map((s, i) => (
          <motion.path
            key={`${press?.input}-${press?.positions.join()}-${i}`}
            d={s.d}
            fill="none"
            stroke={s.stroke}
            strokeWidth={focus === s.hop ? 5 : 3}
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: focus === undefined || focus === s.hop ? 1 : 0.15 }}
            transition={{ delay: i * step, duration: reduced ? 0 : step * 1.5, ease: "linear", opacity: { duration: 0.15, delay: 0 } }}
          />
        ))}
        {press && (
          <>
            <circle cx={left("keys") + COLUMN / 2} cy={y(press.path[0].from)} r={9} fill="none" stroke="var(--signal-in)" strokeWidth={2} />
            <circle cx={left("keys") + COLUMN / 2} cy={y(press.path.at(-1)!.to)} r={9} fill="none" stroke="var(--lamp-on)" strokeWidth={2.5} />
          </>
        )}
      </svg>
      </div>
      <figcaption className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-case-muted">
        <span><span className="mr-1 inline-block h-0.5 w-4 bg-signal-in align-middle" />In</span>
        <span><span className="mr-1 inline-block h-0.5 w-4 bg-signal-turn align-middle" />Reflected</span>
        <span><span className="mr-1 inline-block h-0.5 w-4 bg-signal-out align-middle" />Back out</span>
      </figcaption>
    </figure>
  );
}
