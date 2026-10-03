import { useEffect } from "react";
import { startBombe } from "@/lib/sound";

/** The drums' whirr for as long as a Bombe is running, stopped when it stops or leaves the page. */
export function useBombeSound(running: boolean) {
  useEffect(() => (running ? startBombe() : undefined), [running]);
}
