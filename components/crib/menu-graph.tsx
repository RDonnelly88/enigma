"use client";

import { loops, type Link } from "@/lib/crib";

const SIZE = 320;
const RADIUS = 120;

/** Whether the link lies on a loop: true if its letters stay joined without it. */
function onLoop(links: Link[], index: number) {
  const { a, b } = links[index];
  const rest = links.filter((_, i) => i !== index);
  const seen = new Set([a]);
  const queue = [a];
  while (queue.length) {
    const at = queue.pop()!;
    for (const l of rest) {
      const next = l.a === at ? l.b : l.b === at ? l.a : null;
      if (next && !seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen.has(b);
}

/**
 * The menu Turing's Bombe was wired from. Each line joins a crib letter to
 * the ciphertext letter it became, labelled with where in the message that
 * happened. Lines that close a loop are what let the Bombe reject a wrong
 * rotor setting on its own.
 */
export function MenuGraph({
  links,
  onPick,
  picked,
}: {
  links: Link[];
  /** Makes the letters buttons, for picking one out of the menu. */
  onPick?: (letter: string) => void;
  picked?: string;
}) {
  const letters = [...new Set(links.flatMap((l) => [l.a, l.b]))].sort();
  const at = Object.fromEntries(
    letters.map((letter, i) => {
      const angle = (i / letters.length) * Math.PI * 2 - Math.PI / 2;
      // Rounded so the server's markup matches the browser's to the last digit
      return [letter, { x: Math.round((SIZE / 2 + RADIUS * Math.cos(angle)) * 100) / 100, y: Math.round((SIZE / 2 + RADIUS * Math.sin(angle)) * 100) / 100 }];
    }),
  );
  const count = loops(links);

  // Pairs joined more than once get their step labels together on one line
  const pairs = new Map<string, Link[]>();
  links.forEach((l) => {
    const key = [l.a, l.b].sort().join("");
    pairs.set(key, [...(pairs.get(key) ?? []), l]);
  });

  return (
    <figure>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto block w-full max-w-sm"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role={onPick ? "group" : "img"}
        aria-label={`Menu of ${letters.length} letters and ${links.length} links with ${count} ${count === 1 ? "loop" : "loops"}`}
      >
        {[...pairs.values()].map((group) => {
          const { a, b } = group[0];
          const looped = group.length > 1 || onLoop(links, links.indexOf(group[0]));
          const mid = { x: (at[a].x + at[b].x) / 2, y: (at[a].y + at[b].y) / 2 };
          return (
            <g key={a + b}>
              <line
                x1={at[a].x}
                y1={at[a].y}
                x2={at[b].x}
                y2={at[b].y}
                stroke={looped ? "var(--signal-turn)" : "var(--paper-muted)"}
                strokeWidth={looped ? 2.5 : 1.5}
              />
              <text x={mid.x} y={mid.y} dy={-3} textAnchor="middle" className="fill-paper-ink text-[10px] tabular-nums" paintOrder="stroke" stroke="var(--paper)" strokeWidth={3}>
                {group.map((l) => l.step + 1).join(",")}
              </text>
            </g>
          );
        })}
        {letters.map((letter) => (
          <g
            key={letter}
            {...(onPick && {
              role: "button",
              tabIndex: 0,
              "aria-label": `Letter ${letter}`,
              "aria-pressed": picked === letter,
              className: "cursor-pointer outline-none [&:focus-visible>circle]:stroke-brass [&:focus-visible>circle]:stroke-[3]",
              onClick: () => onPick(letter),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(letter);
                }
              },
            })}
          >
            <circle cx={at[letter].x} cy={at[letter].y} r={13} fill={picked === letter ? "var(--brass)" : "var(--case)"} />
            <text x={at[letter].x} y={at[letter].y + 5} textAnchor="middle" className="fill-case-ink font-stencil text-[14px] font-bold">
              {letter}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-center text-sm text-paper-muted">
        <span className="font-semibold text-paper-ink">
          {count} {count === 1 ? "loop" : "loops"}
        </span>
        {" · "}
        {count >= 3
          ? "a strong menu: the Bombe would stop rarely, and mostly on the truth."
          : count > 0
            ? "workable, but the Bombe would stop on plenty of wrong settings too."
            : "no loops, so the Bombe would stop almost everywhere."}
      </figcaption>
    </figure>
  );
}
