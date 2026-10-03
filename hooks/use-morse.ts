"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { timeline, type Tone } from "@/lib/morse";

type Playing = { letter: number; on: boolean; symbol: number };

/**
 * Plays a message in Morse: a steady tone keyed on and off on the audio
 * clock, so the timing holds even if the page is busy, and a light loop that
 * reports which letter and symbol are sounding for the display to follow.
 */
export function useMorse() {
  const [now, setNow] = useState<Playing | null>(null);
  const stopper = useRef<() => void>(() => {});

  const stop = useCallback(() => {
    stopper.current();
    stopper.current = () => {};
    setNow(null);
  }, []);

  const play = useCallback(
    (text: string, wpm: number, sound: boolean) => {
      stop();
      const { tones, duration } = timeline(text, wpm);
      if (tones.length === 0) return;

      let ctx: AudioContext | null = null;
      if (sound && typeof AudioContext !== "undefined") {
        ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 650;
        gain.gain.value = 0;
        osc.connect(gain).connect(ctx.destination);
        const t0 = ctx.currentTime + 0.05;
        // Short ramps at each edge, or every tone clicks
        for (const tone of tones) {
          const a = t0 + tone.start / 1000;
          const b = a + tone.duration / 1000;
          gain.gain.setValueAtTime(0, a);
          gain.gain.linearRampToValueAtTime(0.25, a + 0.005);
          gain.gain.setValueAtTime(0.25, b - 0.005);
          gain.gain.linearRampToValueAtTime(0, b);
        }
        osc.start(t0);
        osc.stop(t0 + duration / 1000 + 0.1);
      }

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
        void ctx?.close();
      };
    },
    [stop],
  );

  useEffect(() => () => stopper.current(), []);

  return { playing: now, play, stop };
}
