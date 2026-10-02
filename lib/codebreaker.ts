/**
 * Breaking Enigma with nothing but the ciphertext, the way it was first done
 * on a home computer (Gillogly, 1995; refined by Weierud and Sullivan).
 *
 * 1. With the plugboard left empty, try every rotor order and start position.
 *    Most of the message still goes through unplugged letters, so the right
 *    rotors leave the output a little less random than the wrong ones. The
 *    index of coincidence measures exactly that.
 * 2. For the best candidates, find the right rotor's ring setting, which
 *    decides when the middle rotor steps.
 * 3. Hill-climb the plugboard: keep adding or changing whichever cable makes
 *    the output look most like the language, until no cable helps.
 *
 * Statistics alone have limits. With six cables a couple of hundred letters
 * is enough; with the ten the army used from 1939, so few letters pass the
 * plugboard untouched that the right rotors no longer stand out in stage 1.
 * Bletchley Park broke those with cribs and the Bombe instead.
 */

import { ALPHABET, DEFAULT_SETTINGS, REFLECTORS, ROTORS, type ReflectorName, type RotorName, type Settings } from "./enigma";
import { ENGLISH, GERMAN } from "./corpus";

export type Language = "german" | "english";

function toNumbers(text: string) {
  return Uint8Array.from(text.toUpperCase().replace(/[^A-Z]/g, ""), (ch) => ch.charCodeAt(0) - 65);
}

const toText = (numbers: ArrayLike<number>) => Array.from(numbers, (n) => ALPHABET[n]).join("");

// ---- Scoring ---------------------------------------------------------------

/** Chance that two letters picked from the text match: about 0.038 for random letters, 0.076 for German. */
export function indexOfCoincidence(text: Uint8Array) {
  const counts = new Uint32Array(26);
  for (let i = 0; i < text.length; i++) counts[text[i]]++;
  let sum = 0;
  for (let i = 0; i < 26; i++) sum += counts[i] * (counts[i] - 1);
  return sum / (text.length * (text.length - 1));
}

/** Log probability of each letter pair, learnt from the sample text. */
function bigramModel(language: Language) {
  // Signals traffic wrote X between words, so German keeps it; English drops spaces
  const letters =
    language === "german"
      ? GERMAN.toUpperCase().trim().replace(/[^A-Z]+/g, "X")
      : ENGLISH.toUpperCase().replace(/[^A-Z]/g, "");
  const counts = new Float64Array(676).fill(0.5);
  for (let i = 1; i < letters.length; i++) counts[(letters.charCodeAt(i - 1) - 65) * 26 + letters.charCodeAt(i) - 65]++;
  const total = counts.reduce((a, b) => a + b, 0);
  return Float64Array.from(counts, (c) => Math.log(c / total));
}

const MODELS: Partial<Record<Language, Float64Array>> = {};
function model(language: Language) {
  return (MODELS[language] ??= bigramModel(language));
}

/** Average log probability per letter pair: higher means more like the language. */
export function bigramScore(text: Uint8Array, language: Language) {
  const logp = model(language);
  let sum = 0;
  for (let i = 1; i < text.length; i++) sum += logp[text[i - 1] * 26 + text[i]];
  return sum / (text.length - 1);
}

// ---- A fast machine ----------------------------------------------------------

const ROTOR_NAMES = Object.keys(ROTORS) as RotorName[];
const WIRING = Object.fromEntries(
  ROTOR_NAMES.map((name) => {
    const forward = Uint8Array.from(ROTORS[name].wiring, (ch) => ch.charCodeAt(0) - 65);
    const inverse = new Uint8Array(26);
    forward.forEach((to, from) => (inverse[to] = from));
    const notch = new Uint8Array(26);
    for (const ch of ROTORS[name].notches) notch[ch.charCodeAt(0) - 65] = 1;
    return [name, { forward, inverse, notch }];
  }),
) as Record<RotorName, { forward: Uint8Array; inverse: Uint8Array; notch: Uint8Array }>;

// Indexes run from -52 to 77 in the inner loop; a lookup beats % on every letter
const MOD = Uint8Array.from({ length: 130 }, (_, i) => (((i - 52) % 26) + 26) % 26);

type Key = {
  rotors: [RotorName, RotorName, RotorName];
  rings: [number, number, number];
  positions: [number, number, number];
  reflector: ReflectorName;
};

/**
 * The scrambler at every letter of the message, without the plugboard: row i
 * says where each contact goes at the i-th key press. With this computed once,
 * trying a plugboard is two lookups a letter instead of a whole machine.
 */
function scramblers(key: Key, length: number) {
  const [L, M, R] = key.rotors.map((r) => WIRING[r]);
  const reflector = Uint8Array.from(REFLECTORS[key.reflector], (ch) => ch.charCodeAt(0) - 65);
  let [pl, pm, pr] = key.positions;
  const [rl, rm, rr] = key.rings;
  const table = new Uint8Array(length * 26);
  for (let i = 0; i < length; i++) {
    const middleAtNotch = M.notch[pm];
    if (middleAtNotch) pl = (pl + 1) % 26;
    if (middleAtNotch || R.notch[pr]) pm = (pm + 1) % 26;
    pr = (pr + 1) % 26;
    const sl = pl - rl, sm = pm - rm, sr = pr - rr;
    for (let c = 0; c < 26; c++) {
      let x = MOD[R.forward[MOD[c + sr + 52]] - sr + 52];
      x = MOD[M.forward[MOD[x + sm + 52]] - sm + 52];
      x = MOD[L.forward[MOD[x + sl + 52]] - sl + 52];
      x = reflector[x];
      x = MOD[L.inverse[MOD[x + sl + 52]] - sl + 52];
      x = MOD[M.inverse[MOD[x + sm + 52]] - sm + 52];
      table[i * 26 + c] = MOD[R.inverse[MOD[x + sr + 52]] - sr + 52];
    }
  }
  return table;
}

/** Deciphers through precomputed scramblers and a plugboard. */
function decipher(ciphertext: Uint8Array, table: Uint8Array, plugs: Uint8Array, out: Uint8Array) {
  for (let i = 0; i < ciphertext.length; i++) out[i] = plugs[table[i * 26 + plugs[ciphertext[i]]]];
  return out;
}

const NO_PLUGS = Uint8Array.from({ length: 26 }, (_, i) => i);

// ---- The attack --------------------------------------------------------------

export type Candidate = { rotors: Key["rotors"]; positions: Key["positions"]; rings: Key["rings"]; ioc: number };

export type Progress =
  | { stage: "rotors"; done: number; total: number; best: Candidate[] }
  | { stage: "rings" }
  | { stage: "plugs"; candidate: number; of: number; plugboard: string[]; score: number; text: string }
  | { stage: "done"; settings: Settings; text: string; score: number; ioc: number };

export type Options = {
  language: Language;
  reflector: ReflectorName;
  rotors: RotorName[];
  /** How many of the best rotor settings to carry into the ring and plugboard searches. */
  keep: number;
};

export const DEFAULT_OPTIONS: Options = {
  language: "german",
  reflector: "B",
  rotors: ["I", "II", "III", "IV", "V"],
  keep: 200,
};

function orders(rotors: RotorName[]) {
  const out: Key["rotors"][] = [];
  for (const a of rotors) for (const b of rotors) for (const c of rotors) {
    if (a !== b && b !== c && a !== c) out.push([a, b, c]);
  }
  return out;
}

/**
 * Stage 1: every rotor order, every start position and every point at which
 * the middle rotor first steps, scored by index of coincidence.
 *
 * The step point is the right rotor's ring setting in disguise, and it can't
 * be left for later: guess it wrong and the middle rotor sits one place out
 * for most of the message, which hides the signal entirely. Searching it
 * outright would cost 26 times as much, but it needn't. The middle rotor can
 * only ever be in one of two places for a given letter, so each letter is
 * deciphered both ways once, and sliding the step point along then moves one
 * letter in every 26 from one count to the other.
 *
 * The left rotor is assumed not to move. It turns at most once in 676 letters,
 * and the final stage puts that right.
 */
function searchRotors(ciphertext: Uint8Array, options: Options, report: (p: Progress) => void) {
  const all = orders(options.rotors);
  const reflector = Uint8Array.from(REFLECTORS[options.reflector], (ch) => ch.charCodeAt(0) - 65);
  const best: Candidate[] = [];
  const n = ciphertext.length;
  const denominator = n * (n - 1);
  const counts = new Int32Array(26);
  const early = new Uint8Array(n);
  const late = new Uint8Array(n);
  const inner = new Uint8Array(676 * 26);

  all.forEach((rotors, done) => {
    const [L, M, R] = rotors.map((r) => WIRING[r]);
    // Everything past the right rotor, for each left and middle offset
    for (let l = 0; l < 26; l++) for (let m = 0; m < 26; m++) for (let c = 0; c < 26; c++) {
      let x = MOD[M.forward[MOD[c + m + 52]] - m + 52];
      x = MOD[L.forward[MOD[x + l + 52]] - l + 52];
      x = reflector[x];
      x = MOD[L.inverse[MOD[x + l + 52]] - l + 52];
      inner[(l * 26 + m) * 26 + c] = MOD[M.inverse[MOD[x + m + 52]] - m + 52];
    }

    for (let l = 0; l < 26; l++) for (let m = 0; m < 26; m++) for (let r = 0; r < 26; r++) {
      // Letter i sees the middle rotor moved on q or q + 1 times, q = floor(i / 26)
      for (let i = 0; i < n; i++) {
        const s = (r + i + 1) % 26;
        const into = MOD[R.forward[MOD[ciphertext[i] + s + 52]] - s + 52];
        const q = (i / 26) | 0;
        const m0 = (m + q) % 26;
        const m1 = (m0 + 1) % 26;
        early[i] = MOD[R.inverse[MOD[inner[(l * 26 + m0) * 26 + into] + s + 52]] - s + 52];
        late[i] = MOD[R.inverse[MOD[inner[(l * 26 + m1) * 26 + into] + s + 52]] - s + 52];
      }
      counts.fill(0);
      for (let i = 0; i < n; i++) counts[early[i]]++;
      // First step at press t: letters at or past t within their block of 26 have moved on once more
      for (let t = 25; t >= 0; t--) {
        for (let i = t; i < n; i += 26) {
          counts[early[i]]--;
          counts[late[i]]++;
        }
        let sum = 0;
        for (let k = 0; k < 26; k++) sum += counts[k] * (counts[k] - 1);
        const ioc = sum / denominator;
        if (best.length < options.keep || ioc > best[best.length - 1].ioc) {
          const key = keyFor(rotors, l, m, r, t, options.reflector);
          const at = best.findIndex((x) => ioc > x.ioc);
          best.splice(at < 0 ? best.length : at, 0, { rotors, positions: key.positions, rings: key.rings, ioc });
          if (best.length > options.keep) best.pop();
        }
      }
    }
    report({ stage: "rotors", done: done + 1, total: all.length, best: best.slice(0, 5) });
  });
  return best;
}

/**
 * Turns the search's terms back into machine settings. The right rotor's
 * wiring sits at r before the first press and the middle rotor first steps on
 * press t; the window letter and ring that give both are found from the notch.
 * The middle ring is set so its notch has only just gone by, which keeps the
 * double step out of the message for as long as possible, as the search assumed.
 */
function keyFor(rotors: Key["rotors"], l: number, m: number, r: number, t: number, reflector: ReflectorName): Key {
  const mod = (n: number) => ((n % 26) + 26) % 26;
  const rightNotch = ROTORS[rotors[2]].notches.charCodeAt(0) - 65;
  const middleNotch = ROTORS[rotors[1]].notches.charCodeAt(0) - 65;
  const rightWindow = mod(rightNotch - t);
  const middleWindow = mod(middleNotch + 1);
  return {
    rotors,
    positions: [l, middleWindow, rightWindow],
    rings: [0, mod(middleWindow - m), mod(rightWindow - r)],
    reflector,
  };
}

/**
 * Stage 2: steepest-ascent hill climbing on the plugboard. Each round tries
 * every pair of letters, plugging them together (and freeing their old
 * partners), and keeps the single change that scores best.
 */
function climbPlugs(ciphertext: Uint8Array, table: Uint8Array, start: Uint8Array, score: (t: Uint8Array) => number) {
  const out = new Uint8Array(ciphertext.length);
  let plugs: Uint8Array = start.slice();
  let current = score(decipher(ciphertext, table, plugs, out));
  for (;;) {
    let bestPlugs: Uint8Array | null = null;
    let bestScore = current;
    for (let i = 0; i < 26; i++) for (let j = i + 1; j < 26; j++) {
      const trial = plugs.slice();
      if (trial[i] === j) {
        trial[i] = i;
        trial[j] = j;
      } else {
        trial[trial[i]] = trial[i];
        trial[trial[j]] = trial[j];
        trial[i] = j;
        trial[j] = i;
      }
      const s = score(decipher(ciphertext, table, trial, out));
      if (s > bestScore) {
        bestScore = s;
        bestPlugs = trial;
      }
    }
    if (!bestPlugs) return { plugs, score: current };
    plugs = bestPlugs;
    current = bestScore;
  }
}

/**
 * Stage 3: settle the rings. Stage 1 can be a few letters out on the right
 * ring, and never looked at the middle ring, which decides when the middle
 * rotor double-steps and carries the left one. If that happened early in the
 * message, stage 1 will have found the left rotor where it ended up. With the plugboard in place the
 * letter-pair score is sharp enough to choose both, turning each ring and its
 * rotor together so the wiring stays where the search found it.
 */
function polish(ciphertext: Uint8Array, key: Key, plugs: Uint8Array, language: Language) {
  const out = new Uint8Array(ciphertext.length);
  const score = (t: Uint8Array) => bigramScore(t, language);
  const offsets = key.positions.map((p, i) => p - key.rings[i]);
  let best = { key, plugs, score: score(decipher(ciphertext, scramblers(key, ciphertext.length), plugs, out)) };
  for (let pass = 0; pass < 2; pass++) {
    const start = best;
    // The search may have found the left and middle rotors after a double step
    // moved them on, so try each one place back as well
    for (const back of [0, 1]) for (let middle = 0; middle < 26; middle++) for (let right = 0; right < 26; right++) {
      const trial: Key = {
        ...key,
        rings: [0, middle, right],
        positions: [
          (key.positions[0] - back + 26) % 26,
          (offsets[1] - back + middle + 52) % 26,
          (offsets[2] + right + 26) % 26,
        ],
      };
      const s = score(decipher(ciphertext, scramblers(trial, ciphertext.length), start.plugs, out));
      if (s > best.score) best = { key: trial, plugs: start.plugs, score: s };
    }
    const climbed = climbPlugs(ciphertext, scramblers(best.key, ciphertext.length), best.plugs, score);
    best = { ...best, plugs: climbed.plugs, score: climbed.score };
    if (best.score === start.score) break;
  }
  return best;
}

function pairs(plugs: Uint8Array) {
  const out: string[] = [];
  plugs.forEach((to, from) => to > from && out.push(ALPHABET[from] + ALPHABET[to]));
  return out;
}

export function breakCipher(text: string, options: Options = DEFAULT_OPTIONS, report: (p: Progress) => void = () => {}) {
  const ciphertext = toNumbers(text);
  const keys: Key[] = searchRotors(ciphertext, options, report).map((c) => ({ ...c, reflector: options.reflector }));

  const out = new Uint8Array(ciphertext.length);
  let best: { key: Key; plugs: Uint8Array; score: number } = { key: keys[0], plugs: NO_PLUGS, score: -Infinity };
  keys.forEach((key, i) => {
    const table = scramblers(key, ciphertext.length);
    // Index of coincidence finds the first few cables, the letter pairs finish the job
    const rough = climbPlugs(ciphertext, table, NO_PLUGS, indexOfCoincidence);
    const fine = climbPlugs(ciphertext, table, rough.plugs, (t) => bigramScore(t, options.language));
    if (fine.score > best.score) best = { key, plugs: fine.plugs, score: fine.score };
    report({
      stage: "plugs",
      candidate: i + 1,
      of: keys.length,
      plugboard: pairs(best.plugs),
      score: best.score,
      text: toText(decipher(ciphertext, scramblers(best.key, ciphertext.length), best.plugs, out)),
    });
  });

  report({ stage: "rings" });
  best = polish(ciphertext, best.key, best.plugs, options.language);
  const plaintext = decipher(ciphertext, scramblers(best.key, ciphertext.length), best.plugs, out);
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    reflector: options.reflector,
    rotors: best.key.rotors,
    rings: best.key.rings,
    positions: best.key.positions,
    plugboard: pairs(best.plugs),
  };
  const result: Progress = {
    stage: "done",
    settings,
    text: toText(plaintext),
    score: best.score,
    ioc: indexOfCoincidence(plaintext),
  };
  report(result);
  return result;
}

/**
 * Whether a result reads as the language. Real text scores close to the
 * sample it was learnt from; a failed break, however hard the plugboard was
 * climbed, stays well below, and the gap between the two is wide.
 */
export function looksReadable(score: number, language: Language) {
  const sample = language === "german" ? GERMAN.toUpperCase().trim().replace(/[^A-Z]+/g, "X") : ENGLISH.replace(/[^a-z]/gi, "");
  return score > bigramScore(toNumbers(sample), language) - 0.6;
}
