import { ALPHABET, press, step, type Settings } from "../enigma";
import type { Link } from "../crib";

/**
 * Turing's test, the heart of the Bombe. A crib pairs each plain letter with
 * the cipher letter it became at some step of the message. If plain letter p
 * is plugged to x, the scrambler (the rotors without the plugboard) at that
 * step turns x into y, and the cipher letter must be plugged to y.
 *
 * Follow that round a loop in the menu and you come back to the letter you
 * started from, with a prediction for its own plug. At the right rotor
 * setting, the true plug comes back unchanged. At a wrong one, almost every
 * guess contradicts itself, and the setting can be thrown away without ever
 * knowing the plugboard.
 */

/** The scrambler, plugboard removed, as it stands for the letter at `index` in the message. */
function scrambler(settings: Settings, index: number) {
  let at: Settings = { ...settings, plugboard: [] };
  for (let i = 0; i < index; i++) at = { ...at, positions: step(at) };
  return (letter: number) => press(at, ALPHABET[letter]).output.charCodeAt(0) - 65;
}

/** A closed loop through the menu, as links in walking order, or null if the menu has none. */
export function findLoop(links: Link[]): Link[] | null {
  const walk = (start: string, at: string, used: Set<number>, path: Link[]): Link[] | null => {
    for (let i = 0; i < links.length; i++) {
      if (used.has(i)) continue;
      const l = links[i];
      const next = l.a === at ? l.b : l.b === at ? l.a : null;
      if (!next) continue;
      const step = { a: at, b: next, step: l.step };
      if (next === start && path.length >= 1) return [...path, step];
      const found = walk(start, next, new Set([...used, i]), [...path, step]);
      if (found) return found;
    }
    return null;
  };
  // Shortest loops are easiest to follow, so try every start and keep the shortest
  let best: Link[] | null = null;
  for (const start of new Set(links.flatMap((l) => [l.a, l.b]))) {
    const loop = walk(start, start, new Set(), []);
    if (loop && (!best || loop.length < best.length)) best = loop;
  }
  return best;
}

export type Chain = { letter: string; plug: string }[];

/** Carries a guessed plug for the loop's first letter all the way round. */
export function followLoop(settings: Settings, loop: Link[], guess: number): { chain: Chain; consistent: boolean } {
  const chain: Chain = [{ letter: loop[0].a, plug: ALPHABET[guess] }];
  let plug = guess;
  for (const link of loop) {
    plug = scrambler(settings, link.step)(plug);
    chain.push({ letter: link.b, plug: ALPHABET[plug] });
  }
  return { chain, consistent: plug === guess };
}

/** How many of the 26 guesses survive the loop at this setting. */
export function survivors(settings: Settings, loop: Link[]) {
  return ALPHABET.split("").filter((_, g) => followLoop(settings, loop, g).consistent);
}
