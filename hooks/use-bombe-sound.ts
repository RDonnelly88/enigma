import { useEffect } from "react";
import { useSound } from "@/hooks/use-preference";
import { startBombe } from "@/lib/sound";

/** The drums' whirr for as long as a Bombe is running and sound is on, stopped when either changes or it leaves the page. */
export function useBombeSound(running: boolean) {
  const sound = useSound();
  useEffect(() => (running && sound ? startBombe() : undefined), [running, sound]);
}
