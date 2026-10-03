import { ALPHABET } from "../enigma";

/**
 * A Bombe small enough to run by hand. A crib gives a loop of three letters,
 * E to Q at letter 5, Q to T at letter 9, T back to E at letter 12, and at
 * each of those letters the rotors (plugboard aside) swap the alphabet in
 * pairs. Those swaps are printed as cards, one per letter of the crib, for a
 * few drum positions.
 *
 * Each card works like a real Enigma scrambler: every letter is paired with
 * another and none with itself. The cards are made up rather than worked out
 * from real rotors, and chosen so the positions behave as the Bombe found
 * them: at a wrong position every guess round the loop contradicts itself,
 * and at the right one exactly one guess survives.
 */

export const LOOP = [
  { from: "E", to: "Q", at: 5 },
  { from: "Q", to: "T", at: 9 },
  { from: "T", to: "E", at: 12 },
];

/** E's true partner on the plugboard, the guess that survives at the right position. */
export const ANSWER = 0;

// A small seeded generator, so the cards are the same on every visit and on the server
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Thirteen pairs covering the alphabet: a scrambler's swap, with no letter left as itself. */
function pairing(random: () => number) {
  const letters = Array.from({ length: 26 }, (_, i) => i);
  for (let i = 25; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const card = Array<number>(26);
  for (let i = 0; i < 26; i += 2) {
    card[letters[i]] = letters[i + 1];
    card[letters[i + 1]] = letters[i];
  }
  return card;
}

/** Where a guess for E's plug ends up after going once round the loop. */
const round = (cards: number[][], guess: number) => cards.reduce((plug, card) => card[plug], guess);

/** The lengths of the cycles going round the loop again and again makes of E's 26 possible plugs. */
function cycles(cards: number[][]) {
  const seen = new Set<number>();
  const lengths: number[] = [];
  for (let start = 0; start < 26; start++) {
    if (seen.has(start)) continue;
    let n = 0;
    for (let x = start; !seen.has(x); x = round(cards, x)) {
      seen.add(x);
      n++;
    }
    lengths.push(n);
  }
  return lengths.sort((a, b) => a - b);
}

function cardsFor(seed: number, right: boolean) {
  const random = seeded(seed);
  for (;;) {
    const cards = LOOP.map(() => pairing(random));
    const c = cycles(cards);
    // Wrong: one cycle through all 26, so every guess leads to every other. Right: the answer alone, and the
    // rest split in two, because three swaps of 13 pairs can't leave one letter alone and 25 in a single cycle
    const fits = right ? c.length === 3 && c[0] === 1 && c[1] > 1 && round(cards, ANSWER) === ANSWER : c.length === 1;
    if (fits) return cards;
  }
}

export const POSITIONS = [
  { drums: "A A A", cards: cardsFor(1941, false), right: false },
  { drums: "A A B", cards: cardsFor(1942, false), right: false },
  { drums: "A A C", cards: cardsFor(1943, true), right: true },
];

type Hop = { letter: string; plug: number; card?: number };

/** A guess for E's plug carried round the loop: each letter and the plug it must then have. */
export function follow(cards: number[][], guess: number) {
  const hops: Hop[] = [{ letter: LOOP[0].from, plug: guess }];
  let plug = guess;
  LOOP.forEach((link, i) => {
    plug = cards[i][plug];
    hops.push({ letter: link.to, plug, card: i });
  });
  return { hops, consistent: plug === guess };
}

/**
 * The machine's way: current fed into one of E's 26 wires runs round the loop
 * and back into another of E's wires, and on again, lighting every plug the
 * first guess implies. Returned a round at a time, for drawing.
 */
export function spread(cards: number[][], start: number) {
  const rounds: Set<number>[] = [new Set([start])];
  let lit = new Set([start]);
  for (;;) {
    const next = new Set(lit);
    for (const x of lit) next.add(round(cards, x));
    if (next.size === lit.size) return rounds;
    rounds.push(next);
    lit = next;
  }
}

export const letter = (n: number) => ALPHABET[n];
