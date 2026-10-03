"use client";

import { useEffect, useState } from "react";

/** Fast enough not to keep the reader waiting, slow enough to watch someone type. */
const PACE = 55;
const LONGEST = 5000;

/**
 * Text typed out a key at a time, as an operator or typist at the time would
 * have produced it. Silent: a key strike for every letter of a page is too much
 * to sit through, and the machine's own keys still sound. The rest of the text holds its
 * place unseen, so nothing on the page moves while it types. With reduced
 * motion, or once it has typed, it is simply there.
 */
export function TypeOut({ text, typing }: { text: string; typing: boolean }) {
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (!typing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pace = Math.min(PACE, LONGEST / text.length);
    let n = 0;
    // Blank from the next frame; the card is still coming out of its blur, so the one frame before doesn't show
    const blank = requestAnimationFrame(() => setShown(0));
    const tick = setInterval(() => {
      n++;
      setShown(n);
      if (n >= text.length) clearInterval(tick);
    }, pace);
    return () => {
      cancelAnimationFrame(blank);
      clearInterval(tick);
      setShown(null);
    };
  }, [typing, text]);

  if (shown === null || shown >= text.length) return <>{text}</>;
  return (
    <>
      {text.slice(0, shown)}
      <span aria-hidden className="inline-block w-0 animate-pulse border-r-2 border-current">
        &#8203;
      </span>
      <span className="invisible">{text.slice(shown)}</span>
    </>
  );
}
