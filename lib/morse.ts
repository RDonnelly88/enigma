/**
 * International Morse, timed the standard way: a dash is three dots long, with
 * one dot of silence inside a letter, three between letters and seven between
 * words. Enigma traffic went in groups of five letters, so each group is a word.
 */
export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--",
  N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
};

export type Tone = {
  /** Which letter of the message this tone belongs to. */
  letter: number;
  /** Milliseconds from the start. */
  start: number;
  duration: number;
};

/** A dot's length in milliseconds at a speed in words a minute, by the PARIS standard. */
export const unit = (wpm: number) => 1200 / wpm;

/** Every tone of the message in order, and how long the whole transmission lasts. */
export function timeline(text: string, wpm: number, group = 5) {
  const u = unit(wpm);
  const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
  const tones: Tone[] = [];
  let t = 0;
  [...letters].forEach((ch, i) => {
    if (i > 0) t += (i % group === 0 ? 7 : 3) * u;
    [...MORSE[ch]].forEach((symbol, j) => {
      if (j > 0) t += u;
      const duration = (symbol === "." ? 1 : 3) * u;
      tones.push({ letter: i, start: t, duration });
      t += duration;
    });
  });
  return { tones, duration: t, letters };
}
