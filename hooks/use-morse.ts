"use client";

import { useSound } from "@/hooks/use-preference";
import { useCallback, useEffect, useRef, useState } from "react";
import { timeline, type Tone } from "@/lib/morse";
import { playMorse } from "@/lib/sound";

type Playing = { letter: number; on: boolean; symbol: number };

/**
 * Plays a message in Morse: a steady tone keyed on and off on the audio
 * clock, so the timing holds even if the page is busy, and a light loop that
 * reports which letter and symbol are sounding for the display to follow.
 */
export function useMorse() {
  const [now, setNow] = useState<Playing | null>(null);
  const stopper = useRef<() => void>(() => {});
  const cut = useRef<() => void>(() => {});
  const sound = useSound();

  // Turning sound off silences a message already playing; the lamp carries on
  useEffect(() => {
    if (sound) return;
    cut.current();
    cut.current = () => {};
  }, [sound]);

  const stop = useCallback(() => {
    stopper.current();
    stopper.current = () => {};
    setNow(null);
  }, []);

  const play = useCallback(
    (text: string, wpm: number) => {
      stop();
      const { tones, duration } = timeline(text, wpm);
      if (tones.length === 0) return;

      // With sound off the lamp still flashes, so the message can be read by eye
      const sounding = playMorse(text, wpm);
      cut.current = sounding.stop;

      const began = performance.now() + 50;
      let frame = 0;
      let index = 0;
      // Which symbol within its letter each tone is, for lighting dots and dashes in turn
      const symbolOf = tones.map((t, i) => {
        let n = 0;
        for (let j = i - 1; j >= 0 && tones[j].letter === t.letter; j--) n++;
        return n;
      });
      const tick = () => {
        const elapsed = performance.now() - began;
        if (elapsed >= duration) {
          stop();
          return;
        }
        while (index < tones.length - 1 && elapsed >= tones[index + 1].start) index++;
        const tone: Tone = tones[index];
        const on = elapsed >= tone.start && elapsed < tone.start + tone.duration;
        setNow((prev) =>
          prev && prev.letter === tone.letter && prev.on === on && prev.symbol === symbolOf[index]
            ? prev
            : { letter: tone.letter, on, symbol: symbolOf[index] },
        );
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      stopper.current = () => {
        cancelAnimationFrame(frame);
        sounding.stop();
        cut.current = () => {};
      };
    },
    [stop],
  );

  useEffect(() => () => stopper.current(), []);

  return { playing: now, play, stop };
}
