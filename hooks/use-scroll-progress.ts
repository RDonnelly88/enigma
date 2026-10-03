"use client";

import { useEffect, useRef, useState } from "react";

/**
 * How far an element has travelled through the screen, from 0 as its top
 * comes up from below to 1 as it passes the upper part of the screen, for
 * pictures that move as the reader scrolls past them.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const start = window.innerHeight * 0.9;
      const span = height + window.innerHeight * 0.55;
      setP(Math.min(1, Math.max(0, (start - top) / span)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return [ref, p] as const;
}
