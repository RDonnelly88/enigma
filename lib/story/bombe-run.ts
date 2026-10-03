import { ALPHABET, REFLECTORS, ROTORS, type RotorName } from "../enigma";
import type { Link } from "../crib";

/**
 * A full Bombe run, fast enough to sweep every start position of every wheel
 * order in a browser: the scrambler is rebuilt from lookup tables rather than
 * pressed key by key, and each position is tested as the Bombe with
 * Welchman's diagonal board tested it.
 *
 * Guess the plug partner of one menu letter. Every link in the menu then says
 * what the letter at its other end must be plugged to, and a plug works both
 * ways, so A to Q also means Q to A. Follow those consequences through the
 * whole menu. At a wrong setting some letter soon needs two different
 * partners and the guess dies; where a guess survives, the Bombe stops, and
 * the surviving guess has already worked out a good part of the plugboard.
 *
 * Rings are taken as all at A, which is what the Bombe assumed too: it found
 * where the rotors stood, and the rings were worked out afterwards by hand.
 */

export type Order = [RotorName, RotorName, RotorName];

const index = (wiring: string) => [...wiring].map((c) => c.charCodeAt(0) - 65);
const FORWARD = Object.fromEntries(Object.entries(ROTORS).map(([name, r]) => [name, index(r.wiring)])) as Record<RotorName, number[]>;
const BACKWARD = Object.fromEntries(
  Object.entries(FORWARD).map(([name, f]) => {
    const b = Array<number>(26);
    f.forEach((to, from) => (b[to] = from));
    return [name, b];
  }),
) as Record<RotorName, number[]>;
const REFLECT = index(REFLECTORS.B);

const wrap = (n: number) => (n + 26) % 26;

const NOTCH = Object.fromEntries(Object.entries(ROTORS).map(([name, r]) => [name, index(r.notches)])) as Record<RotorName, number[]>;

/** Where the rotors stand for each letter of the message, from the start the key gives, double step and all. */
function positionsFor(order: Order, start: [number, number, number], letters: number) {
  let [l, m, r] = start;
  const out: [number, number, number][] = [];
  for (let i = 0; i < letters; i++) {
    const middleAtNotch = NOTCH[order[1]].includes(m);
    const rightAtNotch = NOTCH[order[2]].includes(r);
    if (middleAtNotch) l = (l + 1) % 26;
    if (middleAtNotch || rightAtNotch) m = (m + 1) % 26;
    r = (r + 1) % 26;
    out.push([l, m, r]);
  }
  return out;
}

/**
 * The scrambler, plugboard removed, at one set of rotor positions: which letter
 * each letter becomes. Worked out a letter at a time, only when asked, because
 * a wrong guess usually dies within a link or two.
 */
function scrambler(order: Order, [l, m, r]: [number, number, number]) {
  const wheels = [
    [FORWARD[order[2]], BACKWARD[order[2]], r],
    [FORWARD[order[1]], BACKWARD[order[1]], m],
    [FORWARD[order[0]], BACKWARD[order[0]], l],
  ] as const;
  const table = new Int8Array(26).fill(-1);
  return (x: number) => {
    if (table[x] >= 0) return table[x];
    let s = x;
    for (const [f, , p] of wheels) s = wrap(f[(s + p) % 26] - p);
    s = REFLECT[s];
    for (let w = 2; w >= 0; w--) {
      const [, b, p] = wheels[w];
      s = wrap(b[(s + p) % 26] - p);
    }
    // The scrambler is its own inverse, so one route answers two questions
    table[x] = s;
    table[s] = x;
    return s;
  };
}

export type Stop = {
  order: Order;
  start: [number, number, number];
  /** The plug pairs the surviving guess implies, unplugged letters left out. */
  pairs: string[];
};

/** The letter of the menu with the most links: the best place to start a guess, since it reaches furthest. */
export function testLetter(links: Link[]) {
  const degree = new Map<string, number>();
  for (const { a, b } of links) {
    degree.set(a, (degree.get(a) ?? 0) + 1);
    degree.set(b, (degree.get(b) ?? 0) + 1);
  }
  return [...degree.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0][0];
}

/** Every guess for the test letter that survives the whole menu at this start, with what each implies. */
export function testStart(order: Order, start: [number, number, number], links: Link[], test: string) {
  const longest = Math.max(...links.map((l) => l.step)) + 1;
  const positions = positionsFor(order, start, longest);
  const tables = new Map<number, (x: number) => number>();
  for (const l of links) if (!tables.has(l.step)) tables.set(l.step, scrambler(order, positions[l.step]));

  const neighbours: { other: number; table: (x: number) => number }[][] = Array.from({ length: 26 }, () => []);
  for (const l of links) {
    const a = l.a.charCodeAt(0) - 65;
    const b = l.b.charCodeAt(0) - 65;
    const table = tables.get(l.step)!;
    neighbours[a].push({ other: b, table });
    neighbours[b].push({ other: a, table });
  }

  const survivors: string[][] = [];
  const t = test.charCodeAt(0) - 65;
  const partner = new Int8Array(26);
  for (let guess = 0; guess < 26; guess++) {
    partner.fill(-1);
    const queue: number[] = [];
    // A plug works both ways: the diagonal board
    const plug = (x: number, y: number) => {
      if (partner[x] === -1 && partner[y] === -1) {
        partner[x] = y;
        partner[y] = x;
        queue.push(x, y);
        return true;
      }
      return partner[x] === y;
    };
    let alive = plug(t, guess);
    while (alive && queue.length) {
      const letter = queue.pop()!;
      for (const { other, table } of neighbours[letter]) {
        if (!plug(other, table(partner[letter]))) {
          alive = false;
          break;
        }
      }
    }
    if (alive) {
      const pairs: string[] = [];
      partner.forEach((p, x) => {
        if (p > x) pairs.push(ALPHABET[x] + ALPHABET[p]);
      });
      survivors.push(pairs);
    }
  }
  return survivors;
}

/** Runs one rotor order over a slice of its start positions, numbered 0 (AAA) to 17,575 (ZZZ). */
export function runBombe(order: Order, links: Link[], test: string, from = 0, to = 26 ** 3): Stop[] {
  const stops: Stop[] = [];
  for (let n = from; n < to; n++) {
    const start: [number, number, number] = [Math.floor(n / 676), Math.floor(n / 26) % 26, n % 26];
    for (const pairs of testStart(order, start, links, test)) stops.push({ order, start, pairs });
  }
  return stops;
}

/** The six ways three rotors can be fitted. */
export function ordersOf(rotors: RotorName[]): Order[] {
  return rotors.flatMap((a) => rotors.flatMap((b) => rotors.flatMap((c) => (new Set([a, b, c]).size === 3 ? [[a, b, c] as Order] : []))));
}
