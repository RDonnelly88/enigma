"use client";

import { useEffect } from "react";

/**
 * Lets the computer's own keyboard drive the machine. Anything typed into a
 * form field, held with a modifier, or auto-repeating is left alone.
 */
export function useHardwareKeys(onDown: (letter: string) => void, onUp: () => void) {
  useEffect(() => {
    const isField = (target: EventTarget | null) =>
      target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));
    const letter = (e: KeyboardEvent) => (/^[a-z]$/i.test(e.key) ? e.key.toUpperCase() : null);

    const down = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isField(e.target)) return;
      const l = letter(e);
      if (!l) return;
      e.preventDefault();
      onDown(l);
    };
    const up = (e: KeyboardEvent) => {
      if (letter(e)) onUp();
    };
    // A key released while the window is in the background never sends keyup
    const blur = () => onUp();

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [onDown, onUp]);
}
