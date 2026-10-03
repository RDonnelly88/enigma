import { menu, placements } from "../crib";
import { DEFAULT_SETTINGS, encipher, type Settings } from "../enigma";
import type { Order, Stop } from "./bombe-run";

/**
 * The intercept for "break one yourself": an order to a bomber wing, sent on
 * a key chosen so the method works the way it did at Hut 6. The guessed
 * address fits in three places but the Bombe stops only at the right one,
 * where it also works out seven of the ten cables; the last three are left
 * for the reader to find from the words they garble.
 */

export const CHALLENGE = {
  plain: "NRXSIEBENXANXKAMPFGESCHWADERXZWEIXANGRIFFXAUFXGELEITZUGXIMXQUADRATXACHTXDREIXUMXSIEBZEHNXUHRXJAGDSCHUTZXDURCHXJAGDGESCHWADERXDREI",
  english: "Number seven. To Bomber Wing 2: attack the convoy in square eight three at 17:00. Fighter escort from Fighter Wing 3.",
  crib: "ANXKAMPFGESCHWADERXZWEI",
  /** Where the crib really sits: after the serial number, NR SIEBEN. */
  cribAt: 10,
  /** How far along the message the address could start. */
  window: 16,
  /** How many crib letters the Bombe is wired for. */
  menuLength: 16,
  rotors: ["I", "II", "III"] as const,
  key: {
    ...DEFAULT_SETTINGS,
    rotors: ["II", "I", "III"],
    positions: [16, 13, 3],
    plugboard: ["VB", "RU", "IZ", "SD", "WL", "XG", "PC", "TY", "OJ", "AM"],
  } satisfies Settings,
};

export const CIPHERTEXT = encipher(CHALLENGE.key, CHALLENGE.plain).text;

export const cribPlacements = () => placements(CIPHERTEXT, CHALLENGE.crib).slice(0, CHALLENGE.window);

export const menuAt = (offset: number) => menu(CIPHERTEXT, CHALLENGE.crib.slice(0, CHALLENGE.menuLength), offset);

/** The message read on a checking machine set to a stop, with whatever cables are plugged. */
export function checkStop(order: Order, start: Stop["start"], plugboard: string[]) {
  return encipher({ ...DEFAULT_SETTINGS, rotors: order, positions: start, plugboard }, CIPHERTEXT).text;
}

const sameCable = (a: string, b: string) => a === b || a === b[1] + b[0];

/** True once the reader's cables are exactly the key's. */
export const solved = (plugboard: string[]) =>
  plugboard.length === CHALLENGE.key.plugboard.length && CHALLENGE.key.plugboard.every((p) => plugboard.some((q) => sameCable(p, q)));

/**
 * A nudge towards one cable still missing: a word it garbles, and the letter
 * that is wrong in it. On the way out of the machine a missing cable shows one
 * letter of its pair where the other should be, so the fix is that pair.
 */
export function hint(plugboard: string[]) {
  const text = checkStop(CHALLENGE.key.rotors, CHALLENGE.key.positions, plugboard);
  const missing = CHALLENGE.key.plugboard.find((p) => !plugboard.some((q) => sameCable(p, q)));
  if (!missing) return null;
  const words = CHALLENGE.plain.split("X");
  let at = 0;
  for (const word of words) {
    const got = text.slice(at, at + word.length);
    for (let i = 0; i < word.length; i++) {
      const pair = got[i] + word[i];
      if (got[i] !== word[i] && sameCable(missing, pair)) {
        return { got, want: word, wrong: got[i], right: word[i] };
      }
    }
    at += word.length + 1;
  }
  return { got: "", want: "", wrong: missing[0], right: missing[1] };
}

export const ANSWERS = [
  "The convoy in square 83, at 17:00",
  "The convoy in square 38, at 07:00",
  "The harbour at Dover, at 17:00",
  "The convoy in square 83, at 07:00",
];
export const RIGHT_ANSWER = 0;

/** What a hint and a mistake each add to the clock, in seconds. */
export const PENALTY = { hint: 60, mistake: 20 };

/** A rating for the run, from its time with penalties added. */
export function rating(seconds: number) {
  if (seconds <= 240) return "Hut 6 legend";
  if (seconds <= 480) return "Hut 6 cryptanalyst";
  return "Hut 6 recruit";
}
