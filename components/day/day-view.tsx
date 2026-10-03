"use client";

import { useDaySounds } from "./day-sounds";
import { Glossed } from "@/components/glossary/glossary";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { buildDay } from "@/lib/story/day";
import { DAY_EVENTS, type Lane } from "@/lib/story/day-events";
import { cn } from "@/lib/cn";
import { ArtefactView } from "./artefacts";

const END = 24 * 60 - 1;
/** How far down the window the day is read: an event's card reaching this line is the clock reaching its time. */
const readingLine = () => window.innerHeight * 0.55;
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
  const end = useRef<HTMLDivElement>(null);
  // After the slider moves the page, its own value stands until the reader scrolls
  const hold = useRef(0);
  const current = [...DAY_EVENTS].reverse().find((e) => e.time <= time);
  const next = DAY_EVENTS.find((e) => e.time > time);
  const fresh = useDaySounds(time, day);

  // Where each event sits on the page, as the clock time it stands for, and the end of the day after the last
  const marks = useCallback(() => {
    const top = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
    const list = DAY_EVENTS.flatMap((e) => {
      const el = cards.current.get(e.id);
      return el ? [{ t: e.time, y: top(el) }] : [];
    });
    if (end.current) list.push({ t: END, y: top(end.current) });
    return list;
  }, []);

  /** The time the page stands at: wherever the reading line falls between one event and the next. */
  const timeOnPage = useCallback(() => {
    const line = window.scrollY + readingLine();
    const m = marks();
    if (!m.length || line <= m[0].y) return 0;
    const i = m.findLastIndex((k) => k.y <= line);
    if (i === m.length - 1) return END;
    const f = (line - m[i].y) / Math.max(1, m[i + 1].y - m[i].y);
    return Math.min(END, Math.round(m[i].t + f * (m[i + 1].t - m[i].t)));
  }, [marks]);
  // Where Next event last sent the page, so quick presses each go one further even mid-scroll
  const heading = useRef({ time: -1, until: 0 });

  // Scrolling is the clock: the time is wherever the reading line falls between one event and the next
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (performance.now() < hold.current) return;
      setTime(timeOnPage());
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    frame = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [marks, timeOnPage]);

  // Playing scrolls the page gently; any scroll of the reader's own stops it
  useEffect(() => {
    if (!playing) return;
    let frame = requestAnimationFrame(function glide() {
      const bottom = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= bottom - 1) return setPlaying(false);
      window.scrollBy(0, 2);
      frame = requestAnimationFrame(glide);
    });
    const stop = () => setPlaying(false);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [playing]);

  /** Scrolls so the reading line sits at a time of day. */
  const scrollToTime = (t: number, smooth: boolean) => {
    const m = marks();
    if (!m.length) return;
    const i = Math.max(0, m.findLastIndex((k) => k.t <= t));
    const j = Math.min(m.length - 1, i + 1);
    const span = m[j].t - m[i].t;
    const y = span > 0 ? m[i].y + ((t - m[i].t) / span) * (m[j].y - m[i].y) : m[i].y;
    window.scrollTo({ top: y - readingLine(), behavior: smooth && !reduced ? "smooth" : "auto" });
  };

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 border-b border-panel-edge bg-room/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-3">
            <StationClock minutes={time} />
            <div>
              <output className="block font-type text-3xl leading-none tabular-nums" aria-label={`The time is ${clock(time)}`} data-testid="day-clock">
                {clock(time)}
              </output>
              <span className="mt-1 block font-type text-xs text-room-muted" aria-hidden>
                {clock(time).replace(":", "")} hrs
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (playing) return setPlaying(false);
                // From the top of the page, or the end of the day, start the glide at midnight
                if (time >= END || window.scrollY + readingLine() < (marks()[0]?.y ?? 0)) scrollToTime(0, false);
                setPlaying(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-room-ink px-4 py-1.5 text-sm font-semibold text-room"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? "Pause" : "Play the day"}
            </button>
            <button
              type="button"
              disabled={!next}
              onClick={() => {
                const from = performance.now() < heading.current.until ? Math.max(heading.current.time, timeOnPage()) : timeOnPage();
                const target = DAY_EVENTS.find((e) => e.time > from);
                if (!target) return;
                setPlaying(false);
                heading.current = { time: target.time, until: performance.now() + 1000 };
                scrollToTime(target.time, true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-panel-edge px-4 py-1.5 text-sm font-semibold disabled:opacity-40"
            >
              <SkipForward className="size-4" /> Next event
            </button>
          </div>
          <p className="min-w-0 flex-1 truncate text-sm text-room-muted">{current ? current.title : ""}</p>
        </div>
        <div className="mt-2">
          <Slider
            label="Time of day"
            value={time}
            min={0}
            max={END}
            step={5}
            onChange={(v) => {
              setPlaying(false);
              setTime(v);
              hold.current = performance.now() + 400;
              scrollToTime(v, false);
            }}
            format={clock}
          />
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
                  onClick={() => {
                    setPlaying(false);
                    scrollToTime(e.time, true);
                  }}
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
                {!reached && <p className="mt-2 text-sm font-semibold text-room-muted">Later today, at {clock(e.time)}.</p>}
                {/* Every event takes its full space from the start, so the page doesn't shift under the reader as the
                    clock runs; one not yet reached is blurred and can't be used */}
                <div
                  inert={!reached}
                  aria-hidden={!reached || undefined}
                  className={cn(
                    "transition-[opacity,filter] duration-500 motion-reduce:transition-none",
                    !reached && "pointer-events-none opacity-25 blur-[3px] select-none",
                  )}
                >
                  <p className="mt-2 font-serif text-[1.02rem] leading-relaxed text-room-ink/90">
                    <Glossed text={e.text} />
                  </p>
                  {e.artefact && (
                    <div className="mt-4">
                      <ArtefactView id={e.artefact} day={day} time={time} typing={fresh === e.id} />
                    </div>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
      {/* Room to scroll the last event up to the reading line, and on to midnight */}
      <div ref={end} className="h-[60vh]" aria-hidden />
    </div>
  );
}

/** A wall clock of the period: cream dial, brass rim, black hands, the kind on a signals office wall. */
function StationClock({ minutes }: { minutes: number }) {
  const hour = ((minutes / 60) % 12) * 30;
  const minute = (minutes % 60) * 6;
  const hand = (angle: number, length: number, width: number) => {
    // Rounded so the server's markup matches the browser's to the last digit
    const r = (n: number) => Math.round(n * 100) / 100;
    const rad = ((angle - 90) * Math.PI) / 180;
    return <line x1={32} y1={32} x2={r(32 + length * Math.cos(rad))} y2={r(32 + length * Math.sin(rad))} stroke="var(--paper-ink)" strokeWidth={width} strokeLinecap="round" />;
  };
  return (
    <svg viewBox="0 0 64 64" className="size-14 shrink-0 drop-shadow" aria-hidden>
      <circle cx={32} cy={32} r={30} fill="var(--paper)" stroke="var(--brass)" strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => {
        const rad = (i * 30 * Math.PI) / 180;
        const long = i % 3 === 0;
        const r = (n: number) => Math.round(n * 100) / 100;
        return (
          <line
            key={i}
            x1={r(32 + (long ? 21 : 24) * Math.sin(rad))}
            y1={r(32 - (long ? 21 : 24) * Math.cos(rad))}
            x2={r(32 + 27 * Math.sin(rad))}
            y2={r(32 - 27 * Math.cos(rad))}
            stroke="var(--paper-ink)"
            strokeWidth={long ? 2.5 : 1.2}
          />
        );
      })}
      {hand(hour, 14, 3.5)}
      {hand(minute, 21, 2)}
      <circle cx={32} cy={32} r={2.5} fill="var(--signal-turn)" />
    </svg>
  );
}
