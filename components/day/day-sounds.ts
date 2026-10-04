"use client";

import { useEffect, useRef, useState } from "react";
import { useSound } from "@/hooks/use-preference";
import { playAircraft, playBirdsong, playMotorcycle, playStamp, playStatic, playStrikes, playTeleprinter, startBombe } from "@/lib/sound";
import { DAY_EVENTS } from "@/lib/story/day-events";

/** What each moment of the day sounds like as the clock reaches it. Each returns how to cut it short. */
const SOUNDS: Record<string, () => () => void> = {
  // The opening midnight is where the day starts, so it is never reached; the closing one strikes. Morse plays
  // only when asked for, from the Listen and Transmit buttons on each message
  weather: () => {
    playBirdsong();
    return () => {};
  },
  intercept: () => playStatic(),
  // The forms go to Bletchley by motorcycle and by teleprinter, so both are heard
  registry: () => {
    const stopRider = playMotorcycle();
    let stopPrinter = () => {};
    const printer = setTimeout(() => (stopPrinter = playTeleprinter(45)), 3600);
    return () => {
      clearTimeout(printer);
      stopRider();
      stopPrinter();
    };
  },
  bombe: () => {
    const stop = startBombe();
    const halt = setTimeout(() => {
      stop();
      playStamp();
    }, 3500);
    return () => {
      clearTimeout(halt);
      stop();
    };
  },
  decrypt: () => playStrikes(1),
  broken: () => {
    playStamp();
    return () => {};
  },
  ultra: () => {
    playStamp();
    return () => {};
  },
  attack: () => playAircraft(),
  night: () => playStrikes(12),
};

/**
 * Plays the sound of the event the clock has just reached, moving forward
 * through the day. Only the latest one sounds, so a jump across the morning
 * doesn't play all of it at once, and each cuts off the one before. Returns
 * the event just reached, for its paperwork to be typed out.
 */
export function useDaySounds(time: number) {
  const sound = useSound();
  const last = useRef(time);
  const playing = useRef<() => void>(() => {});
  const [fresh, setFresh] = useState<string | null>(null);

  useEffect(() => {
    const before = last.current;
    last.current = time;
    if (time <= before) {
      if (time < before) setFresh(null);
      return;
    }
    const reached = DAY_EVENTS.filter((e) => e.time > before && e.time <= time).at(-1);
    if (!reached) return;
    setFresh(reached.id);
    playing.current();
    playing.current = SOUNDS[reached.id]?.() ?? (() => {});
  }, [time]);

  // Turning sound off cuts whatever is playing; leaving the page does too
  useEffect(() => {
    if (!sound) {
      playing.current();
      playing.current = () => {};
    }
  }, [sound]);
  useEffect(() => () => playing.current(), []);

  return fresh;
}
