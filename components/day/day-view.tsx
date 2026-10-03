"use client";

import { Glossed } from "@/components/glossary/glossary";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { buildDay } from "@/lib/story/day";
import { DAY_EVENTS, type Lane } from "@/lib/story/day-events";
import { cn } from "@/lib/cn";
import { ArtefactView } from "./artefacts";

const END = 24 * 60 - 1;
const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const LANES: Record<Lane, { name: string; dot: string; text: string }> = {
  german: { name: "German signals", dot: "bg-signal-out", text: "text-signal-out" },
  allied: { name: "Bletchley Park", dot: "bg-signal-in", text: "text-signal-in" },
};

/**
 * The day on two sides of a spine: the German unit on the left, the British
 * codebreakers on the right. A clock runs through it; each event opens as the
 * clock reaches it, with the real ciphertexts, crib, menu, Bombe stops and
 * decrypts the engine produces for it.
 */
export function DayView() {
  const day = useMemo(() => buildDay(), []);
  const reduced = usePrefersReducedMotion();
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cards = useRef(new Map<string, HTMLElement>());
  const current = [...DAY_EVENTS].reverse().find((e) => e.time <= time);
  const next = DAY_EVENTS.find((e) => e.time > time);

  useEffect(() => {
    if (!playing) return;
    const tick = setInterval(() => setTime((t) => Math.min(END, t + 5)), 120);
    return () => clearInterval(tick);
  }, [playing]);

  // Bring the newest event into view as the clock reaches it while playing
  useEffect(() => {
    if (!playing || !current) return;
    cards.current.get(current.id)?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }, [playing, current, reduced]);

  const stopAtEnd = playing && time >= END;
  if (stopAtEnd) setPlaying(false);

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 border-b border-panel-edge bg-room/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <output className="font-stencil text-4xl font-bold tabular-nums" aria-label={`The time is ${clock(time)}`} data-testid="day-clock">
            {clock(time)}
          </output>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => (time >= END ? (setTime(0), setPlaying(true)) : setPlaying((p) => !p))}
              className="inline-flex items-center gap-1.5 rounded-full bg-room-ink px-4 py-1.5 text-sm font-semibold text-room"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? "Pause" : "Play the day"}
            </button>
            <button
              type="button"
              disabled={!next}
              onClick={() => {
                if (!next) return;
                setPlaying(false);
                setTime(next.time);
                cards.current.get(next.id)?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-panel-edge px-4 py-1.5 text-sm font-semibold disabled:opacity-40"
            >
              <SkipForward className="size-4" /> Next event
            </button>
          </div>
          <p className="min-w-0 flex-1 truncate text-sm text-room-muted">{current ? current.title : ""}</p>
        </div>
        <div className="mt-2">
          <Slider label="Time of day" value={time} min={0} max={END} step={5} onChange={(v) => (setPlaying(false), setTime(v))} format={clock} />
        </div>
        {/* The whole day at a glance: every event a dot on its side's row */}
        <div className="relative mt-1 h-10" aria-hidden>
          {(["german", "allied"] as const).map((lane, row) => (
            <div key={lane} className="absolute inset-x-0 h-px bg-panel-edge" style={{ top: row ? "70%" : "30%" }}>
              {DAY_EVENTS.filter((e) => e.lane === lane).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  tabIndex={-1}
                  onClick={() => (setPlaying(false), setTime(e.time))}
                  title={`${clock(e.time)} ${e.title}`}
                  aria-label={`${clock(e.time)} ${e.title}`}
                  className={cn("absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full", LANES[lane].dot, e.time > time && "opacity-30")}
                  style={{ left: `calc(12px + (100% - 24px) * ${e.time / END})` }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-[11px] text-room-muted">
          {(["german", "allied"] as const).map((lane) => (
            <span key={lane} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", LANES[lane].dot)} /> {LANES[lane].name}
            </span>
          ))}
        </div>
      </div>

      <ol className="relative mt-10 flex flex-col gap-6 md:before:absolute md:before:inset-y-0 md:before:left-1/2 md:before:w-px md:before:bg-panel-edge">
        {DAY_EVENTS.map((e) => {
          const reached = e.time <= time;
          const isCurrent = current?.id === e.id;
          return (
            <li
              key={e.id}
              ref={(el) => {
                if (el) cards.current.set(e.id, el);
              }}
              data-event={e.id}
              data-reached={reached || undefined}
              className={cn("relative md:w-1/2", e.lane === "german" ? "md:pr-10" : "md:ml-auto md:pl-10")}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-6 hidden size-3 rounded-full ring-4 ring-room md:block",
                  LANES[e.lane].dot,
                  e.lane === "german" ? "-right-1.5" : "-left-1.5",
                  !reached && "opacity-30",
                )}
              />
              <article
                className={cn(
                  "rounded-xl border bg-panel p-5 transition-opacity duration-300 motion-reduce:transition-none",
                  isCurrent ? "border-brass shadow-lg" : "border-panel-edge",
                  !reached && "opacity-45",
                )}
              >
                <p className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
                  <span className="font-stencil text-base text-room-ink tabular-nums">{clock(e.time)}</span>
                  <span className={LANES[e.lane].text}>{LANES[e.lane].name}</span>
                </p>
                <h3 className="mt-1 font-stencil text-2xl font-bold tracking-wide">{e.title}</h3>
                {reached ? (
                  <>
                    <p className="mt-2 font-serif text-[1.02rem] leading-relaxed text-room-ink/90"><Glossed text={e.text} />
                    </p>
                    {e.artefact && (
                      <div className="mt-4">
                        <ArtefactView id={e.artefact} day={day} time={time} />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-room-muted">Later today, at {clock(e.time)}.</p>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
