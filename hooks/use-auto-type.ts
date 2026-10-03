"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playKey } from "@/lib/sound";

/** However long the message, it's typed within about this long, so a full intercept doesn't take a minute. */
const MOST = 9000;
/** Never quicker than a fast operator, never slower than a careful one. */
const FASTEST = 70;
const SLOWEST = 160;

/**
 * Types a whole message into the machine a key at a time, so each key goes
 * down, its lamp lights and the rotors turn, as an operator would have seen
 * it. With reduced motion it all goes in at once.
 */
export function useAutoType({
  keyDown,
  keyUp,
  typeMessage,
}: {
  keyDown: (letter: string) => void;
  keyUp: () => void;
  typeMessage: (text: string) => void;
}) {
  const queue = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [left, setLeft] = useState(0);

  const halt = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    keyUp();
  }, [keyUp]);

  /** Stops typing and drops what was left. */
  const cancel = useCallback(() => {
    halt();
    queue.current = "";
    setLeft(0);
  }, [halt]);

  /** Types the rest straight away. */
  const finish = useCallback(() => {
    halt();
    const rest = queue.current;
    queue.current = "";
    setLeft(0);
    if (rest) typeMessage(rest);
  }, [halt, typeMessage]);

  const start = useCallback(
    (text: string) => {
      cancel();
      const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
      // Read at the moment of typing: the setting can be needed before the first render has settled
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || letters.length < 2) {
        typeMessage(letters);
        return;
      }
      const pace = Math.min(SLOWEST, Math.max(FASTEST, MOST / letters.length));
      queue.current = letters;
      setLeft(letters.length);
      const next = () => {
        const letter = queue.current[0];
        if (!letter) {
          timer.current = null;
          return;
        }
        queue.current = queue.current.slice(1);
        setLeft(queue.current.length);
        playKey();
        keyDown(letter);
        // Held for a moment so the lamp is seen, then let go before the next key
        timer.current = setTimeout(() => {
          keyUp();
          timer.current = setTimeout(next, pace * 0.4);
        }, pace * 0.6);
      };
      next();
    },
    [cancel, keyDown, keyUp, typeMessage],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { typing: left, start, finish, cancel };
}
