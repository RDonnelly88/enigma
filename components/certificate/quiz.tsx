"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Printer, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { PASS_MARK, QUESTIONS, rank, score } from "@/lib/quiz";
import { Certificate, type Award } from "./certificate";
import { store, useStored } from "@/hooks/use-stored";
import { BREAK_STORE, parseBreak } from "./break-intercept";

export const AWARD_STORE = "enigma.certificate";

export function parse(raw: string | null): Award | null {
  if (!raw) return null;
  try {
    const a = JSON.parse(raw) as Award;
    return typeof a.name === "string" && typeof a.score === "number" && rank(a.score) ? a : null;
  } catch {
    return null;
  }
}

const blank = () => QUESTIONS.map(() => null as number | null);

/** Ten questions, one at a time, each explained once answered; pass and you get a certificate with your name on. */
export function Quiz() {
  const saved = parse(useStored(AWARD_STORE));
  const broken = useStored(BREAK_STORE);
  const [answers, setAnswers] = useState(blank);
  const [at, setAt] = useState(0);
  const [name, setName] = useState("");

  const restart = () => {
    setAnswers(blank());
    setAt(0);
  };

  if (saved) {
    return (
      <div className="flex flex-col gap-6">
        <Certificate award={saved} broke={parseBreak(broken)} />
        <div className="no-print flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-room-ink px-5 py-2.5 text-sm font-semibold text-room">
            <Printer className="size-4" /> Print or save as PDF
          </button>
          <button
            type="button"
            onClick={() => {
              store(AWARD_STORE, null);
              restart();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-panel-edge px-5 py-2.5 text-sm font-semibold hover:border-brass"
          >
            <RotateCcw className="size-4" /> Take the test again
          </button>
        </div>
      </div>
    );
  }

  const finished = at >= QUESTIONS.length;
  if (finished) {
    const total = score(answers);
    const passed = total >= PASS_MARK;
    const missed = QUESTIONS.filter((q, i) => answers[i] !== q.answer);
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-xl border border-panel-edge bg-panel p-6 sm:p-8" data-testid="quiz-result">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-brass uppercase">Your score</p>
          <p className="mt-2 font-stencil text-7xl font-bold">
            {total}
            <span className="text-3xl text-room-muted">/{QUESTIONS.length}</span>
          </p>
          <p className="mt-2 font-serif text-lg">
            {passed
              ? `Well done, ${rank(total)}. Put your name on your certificate.`
              : `You need ${PASS_MARK} to pass. Read up on the ones you missed and try again.`}
          </p>
        </div>
        {passed ? (
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) store(AWARD_STORE, { name: name.trim(), score: total, date: new Date().toISOString() });
            }}
          >
            <label className="sr-only" htmlFor="certificate-name">
              Your name
            </label>
            <input
              id="certificate-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Your name"
              autoComplete="name"
              className="min-w-0 flex-1 rounded-lg border border-panel-edge bg-room px-4 py-3 font-type text-lg focus:border-brass focus:outline-none"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-brass px-5 py-3 font-semibold text-brass-ink disabled:opacity-50"
            >
              Make my certificate
            </button>
          </form>
        ) : (
          <button type="button" onClick={restart} className="mx-auto inline-flex items-center gap-2 rounded-full bg-room-ink px-5 py-2.5 text-sm font-semibold text-room">
            <RotateCcw className="size-4" /> Try again
          </button>
        )}
        {missed.length > 0 && (
          <div>
            <p className="text-sm font-semibold">Worth another look</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {missed.map((q) => (
                <li key={q.question}>
                  <Link href={q.learnMore.href} className="text-brass underline underline-offset-2">
                    {q.learnMore.label}
                  </Link>
                  <span className="text-room-muted">: {q.question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const q = QUESTIONS[at];
  const chosen = answers[at];
  const answered = chosen !== null;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-xl border border-panel-edge bg-panel p-6 sm:p-8" data-testid="quiz">
      <div className="flex items-center gap-1.5" aria-hidden>
        {QUESTIONS.map((question, i) => (
          <span
            key={question.question}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < at ? (answers[i] === question.answer ? "bg-signal-in" : "bg-signal-turn") : i === at ? "bg-brass" : "bg-panel-edge",
            )}
          />
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-[0.25em] text-brass uppercase">
            Question {at + 1} of {QUESTIONS.length}
          </p>
          {(at > 0 || answered) && (
            <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 text-xs font-semibold text-room-muted hover:text-room-ink">
              <RotateCcw className="size-3.5" /> Start again
            </button>
          )}
        </div>
        <h2 className="mt-2 font-stencil text-3xl leading-tight font-bold tracking-wide">{q.question}</h2>
      </div>
      <div role="radiogroup" aria-label={q.question} className="flex flex-col gap-2">
        {q.options.map((option, i) => {
          const right = i === q.answer;
          const picked = i === chosen;
          return (
            <button
              key={option}
              type="button"
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- answer cards that lock once chosen; native radios can't look like this
              role="radio"
              aria-checked={picked}
              disabled={answered}
              onClick={() => setAnswers((a) => a.map((v, j) => (j === at ? i : v)))}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left font-semibold transition-colors",
                !answered && "border-panel-edge bg-room hover:border-brass",
                answered && right && "border-signal-in bg-signal-in/15",
                answered && picked && !right && "border-signal-turn bg-signal-turn/15",
                answered && !right && !picked && "border-panel-edge opacity-60",
              )}
            >
              {option}
              {answered && right && <Check className="size-5 shrink-0 text-signal-in" aria-label="right answer" />}
              {answered && picked && !right && <X className="size-5 shrink-0 text-signal-turn" aria-label="your answer, wrong" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="flex flex-col gap-4" aria-live="polite">
          <p className="font-serif text-lg leading-relaxed">
            <strong className="font-sans">{chosen === q.answer ? "Right. " : "Not quite. "}</strong>
            {q.why}
          </p>
          <button
            type="button"
            onClick={() => setAt((n) => n + 1)}
            className="inline-flex w-fit items-center gap-2 self-end rounded-full bg-room-ink px-5 py-2.5 text-sm font-semibold text-room"
          >
            {at + 1 < QUESTIONS.length ? "Next question" : "See my score"} <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
