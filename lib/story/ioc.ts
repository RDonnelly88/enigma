import { ALPHABET } from "../enigma";

/**
 * Text that is only partly right: each letter kept with the given chance and
 * otherwise replaced at random. That is roughly what a nearly right rotor
 * setting produces, and the index of coincidence rises with the share kept.
 */
export function partlyRight(text: string, share: number, seed = 11) {
  let a = seed;
  const next = () => {
    a = (a * 1103515245 + 12345) % 2147483648;
    return a / 2147483648;
  };
  return text
    .split("")
    .map((ch) => (next() < share ? ch : ALPHABET[Math.floor(next() * 26)]))
    .join("");
}
