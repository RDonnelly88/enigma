import { ALPHABET } from "../enigma";

/** How often each letter appears, A to Z. */
export function letterCounts(text: string) {
  const counts = Array.from({ length: 26 }, () => 0);
  for (const ch of text.toUpperCase()) {
    const i = ALPHABET.indexOf(ch);
    if (i >= 0) counts[i]++;
  }
  return counts;
}

/** Letters with their counts, commonest first: the fingerprint a simple swap can't hide. */
export function profile(text: string) {
  return letterCounts(text)
    .map((count, i) => ({ letter: ALPHABET[i], count }))
    .sort((a, b) => b.count - a.count || a.letter.localeCompare(b.letter));
}

/** A fixed one-for-one swap of the alphabet, the kind of cipher Enigma replaced. */
export function substitute(text: string, key: string) {
  return text
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/[A-Z]/g, (ch) => key[ALPHABET.indexOf(ch)]);
}
