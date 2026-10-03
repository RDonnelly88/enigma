"use client";

import Link from "next/link";
import { ArrowRight, Check, Wand2 } from "lucide-react";
import { LESSONS, type Snapshot } from "@/lib/lessons";
import { cn } from "@/lib/cn";

type Props = {
  snapshot: Snapshot;
  completed: string[];
  active: string;
  onActive: (id: string) => void;
  onSetup: (id: string) => void;
};

/** Signals school: the lessons in order, the open one checked live against the machine. */
export function LessonsPanel({ snapshot, completed, active, onActive, onSetup }: Props) {
  const done = new Set(completed);
  const next = LESSONS.find((l) => !done.has(l.id));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-stencil text-xl font-bold tracking-wide">Signals school</h2>
        <span className="text-xs text-room-muted tabular-nums" data-testid="lesson-progress">
          {done.size} of {LESSONS.length} done
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-panel-edge" aria-hidden>
        <div className="h-full bg-brass transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(done.size / LESSONS.length) * 100}%` }} />
      </div>
      <ol className="mt-4 flex flex-col gap-1.5">
        {LESSONS.map((l, i) => {
          const open = l.id === active;
          const finished = done.has(l.id);
          return (
            <li key={l.id} data-lesson={l.id}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => onActive(l.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                  open ? "bg-room" : "hover:bg-room/60",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full font-stencil text-xs font-bold",
                    finished ? "bg-signal-in text-white" : open ? "border border-brass text-brass" : "border border-panel-edge text-room-muted",
                  )}
                >
                  {finished ? <Check className="size-3.5" aria-label="done" /> : i + 1}
                </span>
                <span className={cn("text-sm font-semibold", !open && !finished && "text-room-muted")}>{l.title}</span>
              </button>
              {open && (
                <div className="mt-1 mb-3 ml-12 flex flex-col gap-3 pr-2 text-sm leading-relaxed">
                  <p>{l.task}</p>
                  {l.setup && !finished && (
                    <button
                      type="button"
                      onClick={() => onSetup(l.id)}
                      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brass px-3 py-1 text-xs font-semibold text-brass hover:bg-brass hover:text-brass-ink"
                    >
                      <Wand2 className="size-3.5" /> Set it up for me
                    </button>
                  )}
                  {finished ? (
                    <div className="rounded-lg border border-signal-in/40 bg-signal-in/10 p-3" data-testid="lesson-learnt">
                      <p className="font-serif text-[0.95rem]">{l.lesson(snapshot)}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <Link href={l.learnMore.href} className="text-xs font-semibold text-brass underline underline-offset-2">
                          {l.learnMore.label}
                        </Link>
                        {next && next.id !== l.id && (
                          <button type="button" onClick={() => onActive(next.id)} className="inline-flex items-center gap-1 text-xs font-semibold">
                            Next: {next.title} <ArrowRight className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-room-muted" aria-live="polite">Waiting for you on the machine…</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
