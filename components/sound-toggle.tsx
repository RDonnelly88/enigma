"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/hooks/use-preference";
import { choose } from "@/lib/preferences";

/** Sound on or off for the whole site, remembered. */
export function SoundToggle() {
  const sound = useSound();
  return (
    <button
      type="button"
      onClick={() => choose("sound", sound ? "off" : "on")}
      aria-label={sound ? "Turn sound off" : "Turn sound on"}
      title={sound ? "Sound on" : "Sound off"}
      className="grid size-8 shrink-0 place-items-center rounded-full text-room-muted transition-colors hover:bg-panel hover:text-room-ink"
    >
      {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
    </button>
  );
}
