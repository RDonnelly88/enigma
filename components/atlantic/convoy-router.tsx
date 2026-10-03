"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, RotateCcw } from "lucide-react";
import { Demo } from "@/components/ui/demo";
import { Segmented } from "@/components/ui/segmented";
import { ROUTES, YEARS, packsFor, sail, type Outcome, type Route, type Year } from "@/lib/story/atlantic";
import { UBoat, Merchant, Destroyer } from "@/components/art/silhouettes";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

/** Each route as a path across the map from Halifax to Liverpool, and where a pack would lie in wait on it. */
const PATHS: Record<Route, { d: string; pack: [number, number]; name: string }> = {
  north: { d: "M60 150 C 160 40, 400 30, 540 120", pack: [300, 58], name: "Northern route" },
  centre: { d: "M60 150 C 200 130, 380 130, 540 120", pack: [300, 134], name: "Central route" },
  south: { d: "M60 150 C 180 250, 420 250, 540 120", pack: [300, 222], name: "Southern route" },
};

const LIVERPOOL: [number, number] = [540, 120];

const SAYS: Record<Outcome, string> = {
  clear: "Through unseen. The convoy reaches Liverpool, and the U-boats wait on an empty sea.",
  lost: "The pack finds you. It shadows the convoy and attacks night after night, and ships are lost.",
  "fought-off": "The pack finds you, but the escorts are ready, with radar and aircraft overhead. U-boats are sunk, and the rest draw off.",
};

/** A convoy in miniature: three merchant ships and an escort ahead, drawn about its own centre. */
function ConvoyShips({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      <Merchant transform="translate(-30 -3) scale(0.15)" />
      <Merchant transform="translate(-34 9) scale(0.15)" />
      <Merchant transform="translate(-10 3) scale(0.15)" />
      <Destroyer transform="translate(12 0) scale(0.12)" />
    </g>
  );
}

/**
 * The convoy sailing the chosen route: all the way to Liverpool, or, where an
 * unescorted pack waits, only as far as the pack.
 */
function Convoy({ route, stop, still }: { route: Route; stop: boolean; still: boolean }) {
  const motion = useRef<SVGAnimateMotionElement>(null);
  // An animation added after the page has loaded counts from the page's first moment, so it is started by hand
  useEffect(() => motion.current?.beginElement(), []);
  const end = stop ? 0.5 : 1;
  if (still) {
    const [x, y] = stop ? PATHS[route].pack : LIVERPOOL;
    return <ConvoyShips transform={`translate(${x} ${y})`} />;
  }
  return (
    <g>
      <ConvoyShips />
      <animateMotion
        ref={motion}
        begin="indefinite"
        dur={stop ? "2.4s" : "4s"}
        fill="freeze"
        path={PATHS[route].d}
        keyPoints={`0;${end}`}
        keyTimes="0;1"
        calcMode="linear"
      />
    </g>
  );
}

type Tally = { sent: number; through: number; hit: number };
const EMPTY: Tally = { sent: 0, through: 0, hit: 0 };

/**
 * Route a convoy across the Atlantic with what the tracking room knew in a
 * given year: in 1941 and 1943 Ultra shows where the packs wait, in 1942 it
 * shows nothing. The packs and outcomes are illustrative, the difference is not.
 */
export function ConvoyRouter() {
  const reduced = usePrefersReducedMotion();
  const [year, setYear] = useState<Year>(1941);
  const [convoy, setConvoy] = useState(0);
  const [chosen, setChosen] = useState<Route | null>(null);
  const [tallies, setTallies] = useState<Record<Year, Tally>>({ 1941: EMPTY, 1942: EMPTY, 1943: EMPTY });
  const packs = packsFor(year, convoy);
  const { ultra } = YEARS[year];
  const outcome = chosen ? sail(year, convoy, chosen) : null;
  const tally = tallies[year];

  const send = (route: Route) => {
    if (chosen) return;
    setChosen(route);
    const result = sail(year, convoy, route);
    setTallies((t) => ({ ...t, [year]: { sent: t[year].sent + 1, through: t[year].through + (result === "clear" ? 1 : 0), hit: t[year].hit + (result === "clear" ? 0 : 1) } }));
  };
  const next = () => {
    setConvoy((c) => c + 1);
    setChosen(null);
  };

  return (
    <Demo title="Route the convoy" prompt="Pick a route">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label="Year"
            options={[
              { value: "1941", label: "1941" },
              { value: "1942", label: "1942" },
              { value: "1943", label: "1943" },
            ]}
            value={String(year)}
            onChange={(v) => {
              setYear(Number(v) as Year);
              setChosen(null);
            }}
          />
          <p className={cn("flex items-center gap-1.5 text-sm font-semibold", ultra ? "text-signal-in" : "text-danger")} data-testid="ultra-state">
            {ultra ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            <span>{ultra ? "Ultra: the packs can be seen" : "No Ultra: the packs are hidden"}</span>
          </p>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed">{YEARS[year].says}</p>

        <svg
          viewBox="0 0 600 280"
          className="w-full rounded-lg bg-room"
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG is the image
          role="img"
          aria-label={`The North Atlantic, Halifax to Liverpool, with three routes. ${
            ultra || chosen ? `Packs on the ${packs.join(" and ")} route${packs.length > 1 ? "s" : ""}.` : "Where the packs are is unknown."
          }`}
        >
          {/* A faint graticule, so the sea reads as a chart */}
          {[70, 140, 210].map((y) => (
            <line key={y} x1={0} x2={600} y1={y} y2={y} className="stroke-panel-edge" strokeDasharray="2 6" />
          ))}
          {[150, 300, 450].map((x) => (
            <line key={x} x1={x} x2={x} y1={0} y2={280} className="stroke-panel-edge" strokeDasharray="2 6" />
          ))}
          <text x={300} y={270} textAnchor="middle" className="fill-room-muted font-sans text-[11px] tracking-[0.3em] uppercase">
            North Atlantic
          </text>
          {ROUTES.map((r) => {
            const picked = chosen === r;
            const pack = packs.includes(r);
            return (
              <g key={r}>
                <path
                  d={PATHS[r].d}
                  fill="none"
                  strokeWidth={picked ? 4 : 2.5}
                  strokeDasharray={picked ? undefined : "6 6"}
                  className={cn(
                    picked ? (outcome === "clear" ? "stroke-signal-in" : outcome === "lost" ? "stroke-danger" : "stroke-brass") : "stroke-room-muted/60",
                  )}
                />
                {(ultra || chosen) && pack && (
                  <g transform={`translate(${PATHS[r].pack[0]} ${PATHS[r].pack[1]})`} data-testid={`pack-${r}`}>
                    <circle r={22} className="fill-danger/15 stroke-danger" strokeWidth={2} strokeDasharray="4 3" />
                    <UBoat className="text-danger" transform="translate(-25 4) scale(0.25)" periscope={false} />
                    {picked && outcome !== "clear" && (
                      <g className={outcome === "lost" ? "fill-cable" : "fill-brass"}>
                        {[0, 0.6, 1.2].map((delay, i) => (
                          <circle key={i} cx={(i - 1) * 9} cy={-6 + (i % 2) * 8} r={9} className="art-pulse" style={{ animationDelay: `${delay}s` }} />
                        ))}
                      </g>
                    )}
                  </g>
                )}
                {!ultra && !chosen && (
                  <text x={PATHS[r].pack[0]} y={PATHS[r].pack[1] + 8} textAnchor="middle" className="fill-room-muted font-stencil text-[22px] font-bold">
                    ?
                  </text>
                )}
              </g>
            );
          })}
          {chosen ? (
            <Convoy key={`${year}-${convoy}`} route={chosen} stop={outcome === "lost"} still={reduced} />
          ) : (
            <ConvoyShips transform="translate(66 132)" />
          )}
          <circle cx={60} cy={150} r={6} className="fill-room-ink" />
          <text x={60} y={180} textAnchor="middle" className="fill-room-ink font-sans text-[17px] font-semibold">
            Halifax
          </text>
          <circle cx={540} cy={120} r={6} className="fill-room-ink" />
          <text x={540} y={150} textAnchor="middle" className="fill-room-ink font-sans text-[17px] font-semibold">
            Liverpool
          </text>
        </svg>

        {!chosen ? (
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Send the convoy by</legend>
            {ROUTES.map((r) => (
              <button key={r} type="button" onClick={() => send(r)} className="rounded-full border border-panel-edge px-4 py-2 text-sm font-semibold hover:border-brass">
                {PATHS[r].name}
              </button>
            ))}
          </fieldset>
        ) : (
          <div
            data-testid="convoy-outcome"
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm",
              outcome === "clear" ? "border-signal-in bg-signal-in/10" : outcome === "lost" ? "border-danger bg-danger/10" : "border-brass bg-brass-soft",
            )}
          >
            <p className="max-w-xl font-semibold">{SAYS[outcome!]}</p>
            <button type="button" onClick={next} className="inline-flex items-center gap-1.5 rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room">
              Next convoy <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-room-muted">
          <p data-testid="convoy-tally">
            {tally.sent === 0
              ? `No convoys sent in ${year} yet.`
              : `${year}: ${tally.through} of ${tally.sent} ${tally.sent === 1 ? "convoy" : "convoys"} through unseen${
                  tally.hit ? `, ${tally.hit} found by a pack` : ""
                }.`}
          </p>
          {tally.sent > 0 && (
            <button
              type="button"
              onClick={() => {
                setTallies((t) => ({ ...t, [year]: EMPTY }));
                setChosen(null);
              }}
              className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-room-ink"
            >
              <RotateCcw className="size-3.5" /> Start {year} again
            </button>
          )}
        </div>
        <p className="text-xs text-room-muted">
          Illustrative: the real routing was done in the Admiralty&rsquo;s Submarine Tracking Room from Ultra, radio bearings and
          sightings, and a pack spread across hundreds of miles of ocean. Try a few convoys in each year.
        </p>
      </div>
    </Demo>
  );
}
