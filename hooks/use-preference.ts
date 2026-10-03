import { useSyncExternalStore } from "react";
import { PREFERENCES, type Reading, type Theme } from "@/lib/preferences";

const DARK = "(prefers-color-scheme: dark)";

function watch(attribute: string, media?: string) {
  return (onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: [attribute] });
    const query = media ? window.matchMedia(media) : null;
    query?.addEventListener("change", onChange);
    return () => {
      observer.disconnect();
      query?.removeEventListener("change", onChange);
    };
  };
}

const watchTheme = watch(PREFERENCES.theme.attribute, DARK);
const watchReading = watch(PREFERENCES.read.attribute);

/** The theme in force: the reader's choice if they made one, else their system's. */
export function useTheme(): Theme {
  return useSyncExternalStore(
    watchTheme,
    () => {
      const chosen = document.documentElement.getAttribute(PREFERENCES.theme.attribute);
      if (chosen === "light" || chosen === "dark") return chosen;
      return window.matchMedia(DARK).matches ? "dark" : "light";
    },
    () => "light",
  );
}

export function useReading(): Reading {
  return useSyncExternalStore(
    watchReading,
    () => (document.documentElement.getAttribute(PREFERENCES.read.attribute) === "short" ? "short" : "detail"),
    () => "detail",
  );
}
