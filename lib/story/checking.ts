import { encipher, plugboardMap, type Settings } from "../enigma";
import { menu } from "../crib";
import { PRACTICE_CIPHERTEXT, PRACTICE_CRIB, PRACTICE_CRIB_AT, PRACTICE_KEY, PRACTICE_PLAINTEXT } from "../messages";
import { checkStop, findLoop, survivors, type Check } from "./bombe";

/**
 * The practice intercept worked through as Bletchley would: the crib's loop,
 * the Bombe's run over the right rotor, each stop tested against the whole
 * menu, and the checking machine finishing the plugboard from the pairs the
 * true stop gives away.
 */
export const LINKS = menu(PRACTICE_CIPHERTEXT, PRACTICE_CRIB, PRACTICE_CRIB_AT);
export const LOOP = findLoop(LINKS)!;

/** The rotors with the right one started at `right`, the rest as they really were. */
export const candidate = (right: number): Settings => ({
  ...PRACTICE_KEY,
  plugboard: [],
  positions: [PRACTICE_KEY.positions[0], PRACTICE_KEY.positions[1], right],
});

export const TRUE_RIGHT = PRACTICE_KEY.positions[2];

/** Where the Bombe stops as the right drum runs through all 26 places, and which guesses survive each. */
export const SCAN = Array.from({ length: 26 }, (_, right) => ({ right, stops: survivors(candidate(right), LOOP) }));

/** The pair a true stop hands over: the loop's first letter and its real partner. */
export const FIRST_PAIR = (() => {
  const a = LOOP[0].a;
  const b = String.fromCharCode(65 + plugboardMap(PRACTICE_KEY.plugboard)[a.charCodeAt(0) - 65]);
  return [a, b].sort().join("");
})();

/**
 * Testing a stop: each guess that survived the loop is followed along every
 * link of the menu. A stop is false when every guess runs into a letter that
 * would need two plugs; a guess that never does gives the plugs it found.
 */
export function testStop(right: number): { holds: boolean; tried: { guess: string; check: Check }[] } {
  const tried = SCAN[right].stops.map((guess) => ({ guess, check: checkStop(candidate(right), LINKS, LOOP[0].a, guess) }));
  return { holds: tried.some((t) => !t.check.clash), tried };
}

/** The plugs the true stop's test gives away. */
export const FROM_STOP = testStop(TRUE_RIGHT).tried.find((t) => !t.check.clash)!.check.pairs;

/** The order the plugboard comes out on the checking machine: the stop's pairs first, then the rest from reading. */
export const DISCOVERY = [...FROM_STOP, ...PRACTICE_KEY.plugboard.filter((p) => !FROM_STOP.includes(p))];

/** The message read with only some of the plugboard known, and how much of it is right. */
export function partialRead(known: string[], right = TRUE_RIGHT) {
  const text = encipher({ ...candidate(right), plugboard: known }, PRACTICE_CIPHERTEXT).text;
  const correct = [...text].filter((c, i) => c === PRACTICE_PLAINTEXT[i]).length;
  return { text, correct, total: text.length };
}
