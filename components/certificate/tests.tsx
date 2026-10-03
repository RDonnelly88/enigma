"use client";

import { useState } from "react";
import { BrainCircuit, KeyRound } from "lucide-react";
import { useStored } from "@/hooks/use-stored";
import { cn } from "@/lib/cn";
import { BREAK_STORE, BreakIntercept, clock, parseBreak } from "./break-intercept";
import { AWARD_STORE, parse, Quiz } from "./quiz";

type Test = "quiz" | "break";

/** The two tests side by side: what you know, and whether you can do it. */
export function Tests() {
  const [test, setTest] = useState<Test>("quiz");
  const award = parse(useStored(AWARD_STORE));
  const broke = parseBreak(useStored(BREAK_STORE));
  const tabs = [
    { id: "quiz" as const, icon: BrainCircuit, title: "The quiz", status: award ? `Passed, ${award.score} right` : "Not taken yet" },
    { id: "break" as const, icon: KeyRound, title: "Break an intercept", status: broke ? `Broken in ${clock(broke.seconds)}` : "Not broken yet" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Tests" className="no-print grid gap-3 sm:grid-cols-2">
        {tabs.map(({ id, icon: Icon, title, status }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={test === id}
            onClick={() => setTest(id)}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-4 text-left transition-colors",
              test === id ? "border-brass bg-panel" : "border-panel-edge hover:border-brass",
            )}
          >
            <Icon className={cn("size-8 shrink-0", test === id ? "text-brass" : "text-room-muted")} aria-hidden />
            <span>
              <span className="block font-stencil text-xl font-bold tracking-wide">{title}</span>
              <span className="block text-sm text-room-muted">{status}</span>
            </span>
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={tabs.find((t) => t.id === test)!.title}>
        {test === "quiz" ? <Quiz /> : <BreakIntercept onCertificate={() => setTest("quiz")} />}
      </div>
    </div>
  );
}
