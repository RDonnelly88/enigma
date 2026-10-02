import { ALPHABET, encipher, step, type Settings } from "../enigma";

/**
 * Marian Rejewski's way in, 1932. Each morning every operator enciphered a
 * message key twice from the same basic setting. Letter 1 and letter 4 of each
 * indicator are the same unknown letter enciphered three presses apart, so
 * across a day's traffic they define a fixed permutation, AD, from one to the
 * other; likewise BE and CF.
 *
 * The lengths of those permutations' cycles depend only on the rotors, not on
 * the plugboard: plugging cables just relabels the letters. Rejewski
 * catalogued the cycle lengths for every rotor setting, so a morning's
 * indicators were enough to look up the day's rotors.
 */

/** The permutation from letter i to letter i + 3 of a doubled indicator, at the given basic setting. */
export function pairing(settings: Settings, first: 0 | 1 | 2) {
  // Step to just before the first press, then compose the two enciphering steps
  let at = settings;
  for (let i = 0; i < first; i++) at = { ...at, positions: step(at) };
  const map: number[] = [];
  for (let c = 0; c < 26; c++) {
    const key = encipher(at, ALPHABET[c]).text; // the plain letter this cipher letter came from
    let later = at;
    for (let i = 0; i < 3; i++) later = { ...later, positions: step(later) };
    map.push(encipher(later, key).text.charCodeAt(0) - 65);
  }
  return map;
}

/** A permutation's cycles, longest first, each starting from its earliest letter. */
export function cycles(map: number[]) {
  const seen = new Set<number>();
  const out: number[][] = [];
  for (let start = 0; start < map.length; start++) {
    if (seen.has(start) || map[start] === undefined || map[start] < 0) continue;
    const cycle: number[] = [];
    let x = start;
    while (!seen.has(x) && x >= 0) {
      seen.add(x);
      cycle.push(x);
      x = map[x];
    }
    if (x === start) out.push(cycle);
  }
  return out.sort((a, b) => b.length - a.length || a[0] - b[0]);
}

/** The cycle lengths, longest first: Rejewski's fingerprint for a rotor setting. */
export const characteristic = (map: number[]) => cycles(map).map((c) => c.length);

/** A day's intercepted indicators, from message keys chosen at random by the operators. */
export function indicators(settings: Settings, count: number, seed = 7) {
  let a = seed;
  const next = () => {
    a = (a * 1103515245 + 12345) % 2147483648;
    return a / 2147483648;
  };
  return Array.from({ length: count }, () => {
    const key = Array.from({ length: 3 }, () => ALPHABET[Math.floor(next() * 26)]).join("");
    return encipher(settings, key + key).text;
  });
}

/** What the codebreaker can piece together of AD, BE or CF from the indicators seen so far; -1 where unknown. */
export function partialPairing(seen: string[], first: 0 | 1 | 2) {
  const map = Array.from({ length: 26 }, () => -1);
  for (const ind of seen) map[ind.charCodeAt(first) - 65] = ind.charCodeAt(first + 3) - 65;
  return map;
}
