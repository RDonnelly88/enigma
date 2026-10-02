import { ALPHABET, DEFAULT_SETTINGS, type RotorName, type Settings } from "../enigma";

/**
 * A month of daily keys, of the kind printed on an army key sheet: which
 * rotors in which order, their ring settings, the plugboard cables, and the
 * basic setting the 1930s procedure started each message key from. Made from
 * a fixed seed, so every visitor sees the same sheet.
 */
export type DailyKey = {
  day: number;
  rotors: [RotorName, RotorName, RotorName];
  rings: [number, number, number];
  plugboard: string[];
  /** Grundstellung: where the rotors were set to encipher the message key. */
  basic: [number, number, number];
};

// mulberry32: small, fast, and the same everywhere
function random(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function keySheet(days = 31, seed = 1938): DailyKey[] {
  const next = random(seed);
  const pick = (n: number) => Math.floor(next() * n);
  return Array.from({ length: days }, (_, i) => {
    const box: RotorName[] = ["I", "II", "III", "IV", "V"];
    const rotors = [0, 1, 2].map(() => box.splice(pick(box.length), 1)[0]) as DailyKey["rotors"];
    const letters = ALPHABET.split("");
    const plugboard = Array.from({ length: 10 }, () => {
      const a = letters.splice(pick(letters.length), 1)[0];
      const b = letters.splice(pick(letters.length), 1)[0];
      return [a, b].sort().join("");
    }).sort();
    return {
      day: i + 1,
      rotors,
      rings: [pick(26), pick(26), pick(26)],
      plugboard,
      basic: [pick(26), pick(26), pick(26)],
    };
  });
}

/** The day's key as machine settings, with the rotors at the given start. */
export function settingsFor(key: DailyKey, positions: [number, number, number]): Settings {
  return { ...DEFAULT_SETTINGS, rotors: key.rotors, rings: key.rings, plugboard: key.plugboard, positions };
}
