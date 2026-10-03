"use client";

import { useState } from "react";
import { Radio, Square } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useMorse } from "@/hooks/use-morse";
import { MORSE } from "@/lib/morse";
import { cn } from "@/lib/cn";

/** Sends the tape's ciphertext as a radio operator would: in Morse, in groups of five. */
export function Transmitter({ text, sound, onTransmit }: { text: string; sound: boolean; onTransmit: () => void }) {
  const [wpm, setWpm] = useState(15);
  const { playing, play, stop } = useMorse();
  const letters = text.replace(/[^A-Z]/g, "");
  const groups = letters.match(/.{1,5}/g) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Slider label="Speed" value={wpm} min={5} max={30} onChange={setWpm} format={(v) => `${v} words a minute`} />
      <div className="flex items-center gap-3">
        {playing ? (
          <button type="button" onClick={stop} className="inline-flex items-center gap-2 rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white">
            <Square className="size-4" /> Stop
          </button>
        ) : (
          <button
            type="button"
            disabled={letters.length === 0}
            onClick={() => {
              play(letters, wpm, sound);
              onTransmit();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-room-ink px-4 py-2 text-sm font-semibold text-room disabled:opacity-40"
          >
            <Radio className="size-4" /> Transmit
          </button>
        )}
        <span className="text-xs text-room-muted">{letters.length === 0 ? "Type a message on the machine first." : sound ? "Turn your sound up." : "Sound is off; watch the lamp."}</span>
      </div>
      {letters.length > 0 && (
        <div className="rounded-lg bg-case p-4 text-case-ink" data-testid="morse-ticker">
          <div className="flex items-center gap-3">
            {/* The key light: on whenever the tone is */}
            <span
              aria-hidden
              className={cn("size-3 shrink-0 rounded-full transition-colors duration-75 motion-reduce:transition-none", playing?.on ? "bg-lamp-on shadow-[0_0_12px_3px_var(--lamp-glow)]" : "bg-lamp-off")}
            />
            <span className="font-mono text-xl tracking-[0.25em]" aria-live="off">
              {playing
                ? [...MORSE[letters[playing.letter]]].map((s, i) => (
                    <span key={i} className={i === playing.symbol ? "text-lamp-on" : i < playing.symbol ? "text-case-ink" : "text-case-muted"}>
                      {s === "." ? "·" : "–"}
                    </span>
                  ))
                : " "}
            </span>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-type text-base">
            {groups.map((g, gi) => (
              <span key={gi}>
                {[...g].map((ch, ci) => {
                  const i = gi * 5 + ci;
                  return (
                    <span key={ci} className={cn(playing && i === playing.letter ? "text-lamp-on" : playing && i < playing.letter ? "text-case-ink" : "text-case-muted")}>
                      {ch}
                    </span>
                  );
                })}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
