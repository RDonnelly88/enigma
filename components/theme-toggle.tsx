"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-preference";
import { choose } from "@/lib/preferences";

/** Lamp on or lamp off: flips the room between daylight and blackout, and remembers. */
export function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => choose("theme", next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="grid size-8 shrink-0 place-items-center rounded-full text-room-muted transition-colors hover:bg-panel hover:text-room-ink"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
