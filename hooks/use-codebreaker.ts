"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Candidate, Options, Progress } from "@/lib/codebreaker";

type Run = {
  status: "idle" | "running" | "done" | "stopped";
  rotors: { done: number; total: number; best: Candidate[] } | null;
  plugs: { candidate: number; of: number; plugboard: string[]; score: number; text: string } | null;
  polishing: boolean;
  result: Extract<Progress, { stage: "done" }> | null;
  startedAt: number;
  finishedAt: number;
};

const IDLE: Run = { status: "idle", rotors: null, plugs: null, polishing: false, result: null, startedAt: 0, finishedAt: 0 };

export function useCodebreaker() {
  const worker = useRef<Worker | null>(null);
  const [run, setRun] = useState<Run>(IDLE);

  const stop = useCallback(() => {
    worker.current?.terminate();
    worker.current = null;
    setRun((r) => (r.status === "running" ? { ...r, status: "stopped", finishedAt: performance.now() } : r));
  }, []);

  const start = useCallback(
    (ciphertext: string, options: Options) => {
      worker.current?.terminate();
      const w = new Worker(new URL("../lib/codebreaker.worker.ts", import.meta.url), { type: "module" });
      worker.current = w;
      setRun({ ...IDLE, status: "running", startedAt: performance.now() });
      w.onmessage = (event: MessageEvent<Progress>) => {
        const p = event.data;
        setRun((r) => {
          switch (p.stage) {
            case "rotors":
              return { ...r, rotors: { done: p.done, total: p.total, best: p.best } };
            case "plugs":
              return { ...r, plugs: { candidate: p.candidate, of: p.of, plugboard: p.plugboard, score: p.score, text: p.text } };
            case "rings":
              return { ...r, polishing: true };
            case "done":
              w.terminate();
              worker.current = null;
              return { ...r, status: "done", polishing: false, result: p, finishedAt: performance.now() };
          }
        });
      };
      w.postMessage({ ciphertext, options });
    },
    [],
  );

  const reset = useCallback(() => {
    stop();
    setRun(IDLE);
  }, [stop]);

  useEffect(() => () => worker.current?.terminate(), []);

  return { run, start, stop, reset };
}
