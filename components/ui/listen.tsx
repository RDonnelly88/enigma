"use client";

import { Radio, Square } from "lucide-react";
import { useMorse } from "@/hooks/use-morse";
import { useSound } from "@/hooks/use-preference";
import { MORSE } from "@/lib/morse";
import { cn } from "@/lib/cn";

/** Fast enough to sound like traffic, slow enough to follow the lamp. */
const WPM = 18;

/**
 * Plays a message the way it went out: in Morse, letter by letter, with a key
 * lamp flashing in time, so it can be followed with the sound off too.
 */
export function Listen({ text, className, tone = "room" }: { text: string; className?: string; tone?: "room" | "paper" }) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
  const { playing, play, stop } = useMorse();
  const sound = useSound();
  if (!letters) return null;
  return (
    <span className={cn("inline-flex items-center gap-2 align-middle", className)}>
      <button
        type="button"
        onClick={() => (playing ? stop() : play(letters, WPM))}
        aria-label={playing ? "Stop the Morse" : "Listen to it in Morse"}
        title={sound ? undefined : "Sound is off: watch the lamp"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-xs font-semibold tracking-normal normal-case transition-colors",
          tone === "paper" ? "border-paper-ink/30 text-paper-ink hover:border-paper-ink" : "border-panel-edge text-room-ink hover:border-brass",
        )}
      >
        {playing ? <Square className="size-3" /> : <Radio className="size-3.5" />}
        {playing ? "Stop" : "Listen"}
      </button>
      {playing && (
        <span className="inline-flex items-center gap-1.5 font-mono text-sm" aria-hidden data-testid="listen-now">
          <span
            className={cn("size-2.5 rounded-full transition-colors duration-75 motion-reduce:transition-none", playing.on ? "bg-lamp-on shadow-[0_0_8px_2px_var(--lamp-glow)]" : "bg-lamp-off")}
          />
          <span className="font-type">{letters[playing.letter]}</span>
          <span className="tracking-[0.2em]">
            {[...MORSE[letters[playing.letter]]].map((s, i) => (
              <span key={i} className={i === playing.symbol ? "text-brass" : "opacity-50"}>
                {s === "." ? "·" : "–"}
              </span>
            ))}
          </span>
        </span>
      )}
    </span>
  );
}
