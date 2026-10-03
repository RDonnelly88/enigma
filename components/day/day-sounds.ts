"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSound } from "@/hooks/use-preference";
import { playAircraft, playMorse, playStamp, playStrikes, playTeleprinter, startBombe } from "@/lib/sound";
import { ORDER, WEATHER, type DayData } from "@/lib/story/day";
import { DAY_EVENTS } from "@/lib/story/day-events";

/** What each moment of the day sounds like as the clock reaches it, using the day's real traffic. Each returns how to cut it short. */
const soundsFor = (day: DayData): Record<string, () => () => void> => ({
  // The opening midnight is where the day starts, so it is never reached; the closing one strikes
  transmit: () => playMorse(WEATHER.start + day.weather.enciphered + day.weather.body.slice(0, 15), 18).stop,
  intercept: () => playMorse(day.weather.body.slice(0, 15), 18).stop,
  registry: () => playTeleprinter(45),
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
  broken: () => {
    playStamp();
    return () => {};
  },
  order: () => playMorse(ORDER.start + day.order.enciphered + day.order.body.slice(0, 15), 18).stop,
  ultra: () => {
    playStamp();
    return () => {};
  },
  attack: () => playAircraft(),
  night: () => playStrikes(12),
});

/**
 * Plays the sound of the event the clock has just reached, moving forward
 * through the day. Only the latest one sounds, so a jump across the morning
 * doesn't play all of it at once, and each cuts off the one before. Returns
 * the event just reached, for its paperwork to be typed out.
 */
export function useDaySounds(time: number, day: DayData) {
  const sound = useSound();
  const last = useRef(time);
  const playing = useRef<() => void>(() => {});
  const [fresh, setFresh] = useState<string | null>(null);
  const sounds = useMemo(() => soundsFor(day), [day]);

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
    playing.current = sounds[reached.id]?.() ?? (() => {});
  }, [time, sounds]);

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
