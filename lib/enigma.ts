export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const toIndex = (letter: string) => ALPHABET.indexOf(letter);
export const toLetter = (index: number) => ALPHABET[mod(index)];

function mod(n: number) {
  return ((n % 26) + 26) % 26;
}

export type RotorName = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII";
export type GreekName = "Beta" | "Gamma";
export type ReflectorName = "A" | "B" | "C" | "B Thin" | "C Thin";
type Model = "M3" | "M4";

type WheelSpec = { wiring: string; notches: string };

export const ROTORS: Record<RotorName, WheelSpec> = {
  I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notches: "Q" },
  II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notches: "E" },
  III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notches: "V" },
  IV: { wiring: "ESOVPZJAYQUIRHXLNFTGKDCMWB", notches: "J" },
  V: { wiring: "VZBRGITYUPSDNHLXAWMJQOFECK", notches: "Z" },
  // The naval rotors carry two notches, so they turn their neighbour twice as often
  VI: { wiring: "JPGVOUMFYQBENHZRDKASXLICTW", notches: "ZM" },
  VII: { wiring: "NZJHGRCXMYSWBOUFAIVLPEKQDT", notches: "ZM" },
  VIII: { wiring: "FKQHTLXOCBJSPDZRAMEWNIUYGV", notches: "ZM" },
};

// The M4's fourth wheel. It sits beside the thin reflector and never turns.
export const GREEK_ROTORS: Record<GreekName, WheelSpec> = {
  Beta: { wiring: "LEYJVCNIXWPBQMDRTAKZGFUHOS", notches: "" },
  Gamma: { wiring: "FSOKANUERHMBTIYCWLQPZXVGJD", notches: "" },
};

export const REFLECTORS: Record<ReflectorName, string> = {
  A: "EJMZALYXVBWFCRQUONTSPIKHGD",
  B: "YRUHQSLDPXNGOKMIEBFZCWVJAT",
  C: "FVPJIAOYEDRZXWGCTKUQSBNMHL",
  "B Thin": "ENKQAUYWJICOPBLMDXZVFTHRGS",
  "C Thin": "RDOBJNTKVEHMLFCWZAXGYIPSUQ",
};

export const M3_REFLECTORS: ReflectorName[] = ["A", "B", "C"];
export const M4_REFLECTORS: ReflectorName[] = ["B Thin", "C Thin"];

/**
 * Everything an operator sets before typing. Wheels are listed left to right,
 * as they sit in the machine; positions and rings are 0 (A) to 25 (Z).
 */
export type Settings = {
  model: Model;
  reflector: ReflectorName;
  greek: GreekName;
  rotors: [RotorName, RotorName, RotorName];
  rings: [number, number, number];
  positions: [number, number, number];
  /** The greek wheel's ring and position, used only on the M4. */
  greekRing: number;
  greekPosition: number;
  /** Pairs of letters, e.g. ["AV", "BS"]. */
  plugboard: string[];
};

export const DEFAULT_SETTINGS: Settings = {
  model: "M3",
  reflector: "B",
  greek: "Beta",
  rotors: ["I", "II", "III"],
  rings: [0, 0, 0],
  positions: [0, 0, 0],
  greekRing: 0,
  greekPosition: 0,
  plugboard: [],
};

/** Every reason the settings can't describe a working machine. */
export function validate(settings: Settings): string[] {
  const errors: string[] = [];
  if (new Set(settings.rotors).size !== 3) errors.push("Each rotor can only be fitted once.");
  const allowed = settings.model === "M4" ? M4_REFLECTORS : M3_REFLECTORS;
  if (!allowed.includes(settings.reflector)) {
    errors.push(`The ${settings.model} takes reflector ${allowed.join(" or ")}.`);
  }
  const numbers = [...settings.rings, ...settings.positions, settings.greekRing, settings.greekPosition];
  if (numbers.some((n) => !Number.isInteger(n) || n < 0 || n > 25)) {
    errors.push("Rings and positions run from A to Z.");
  }
  const plugged = settings.plugboard.join("");
  if (settings.plugboard.some((pair) => !/^[A-Z]{2}$/.test(pair) || pair[0] === pair[1])) {
    errors.push("Each plugboard cable joins two different letters.");
  } else if (new Set(plugged).size !== plugged.length) {
    errors.push("A letter can only take one plugboard cable.");
  }
  if (settings.plugboard.length > 13) errors.push("There are only 13 pairs of letters.");
  return errors;
}

/** The plugboard as a lookup: each letter's partner, or itself if unplugged. */
function plugboardMap(pairs: string[]): number[] {
  const map = Array.from({ length: 26 }, (_, i) => i);
  for (const [a, b] of pairs) {
    map[toIndex(a)] = toIndex(b);
    map[toIndex(b)] = toIndex(a);
  }
  return map;
}

function isAtNotch(rotor: RotorName, position: number) {
  return ROTORS[rotor].notches.includes(toLetter(position));
}

/**
 * Turns the rotors as a key press does, before the current flows. The right
 * rotor always turns. A rotor at its notch carries its left neighbour with it,
 * and the middle rotor, when it is the one at its notch, turns itself as well:
 * the double step, which makes the middle rotor move on two presses running.
 */
export function step(settings: Settings): [number, number, number] {
  const [left, middle, right] = settings.positions;
  const [, middleRotor, rightRotor] = settings.rotors;
  const middleAtNotch = isAtNotch(middleRotor, middle);
  const rightAtNotch = isAtNotch(rightRotor, right);
  return [
    middleAtNotch ? mod(left + 1) : left,
    middleAtNotch || rightAtNotch ? mod(middle + 1) : middle,
    mod(right + 1),
  ];
}

/**
 * Passes a contact through a wheel. Turning the wheel by its position and back
 * by its ring setting shifts which wire the current meets.
 */
function throughWheel(spec: WheelSpec, signal: number, position: number, ring: number, inverse: boolean) {
  const shift = position - ring;
  const contact = mod(signal + shift);
  const wired = inverse ? spec.wiring.indexOf(toLetter(contact)) : toIndex(spec.wiring[contact]);
  return mod(wired - shift);
}

export type Stage = "plugboard" | "right" | "middle" | "left" | "greek" | "reflector";

/** One hop of the current: the contact it entered a component on, and left by. */
export type Hop = { stage: Stage; direction: "in" | "out" | "turn"; from: number; to: number };

export type Keypress = {
  input: string;
  output: string;
  /** Rotor positions before the key went down. */
  before: [number, number, number];
  /** Rotor positions after the key went down, which is when the current flows. */
  positions: [number, number, number];
  path: Hop[];
};

/** Presses one key: steps the rotors, then follows the current to a lamp. */
export function press(settings: Settings, letter: string): Keypress {
  const input = letter.toUpperCase();
  if (input.length !== 1 || toIndex(input) < 0) throw new Error(`${JSON.stringify(letter)} is not a key`);

  const positions = step(settings);
  const plugs = plugboardMap(settings.plugboard);
  const wheels: { stage: Stage; spec: WheelSpec; position: number; ring: number }[] = [
    { stage: "right", spec: ROTORS[settings.rotors[2]], position: positions[2], ring: settings.rings[2] },
    { stage: "middle", spec: ROTORS[settings.rotors[1]], position: positions[1], ring: settings.rings[1] },
    { stage: "left", spec: ROTORS[settings.rotors[0]], position: positions[0], ring: settings.rings[0] },
  ];
  if (settings.model === "M4") {
    wheels.push({
      stage: "greek",
      spec: GREEK_ROTORS[settings.greek],
      position: settings.greekPosition,
      ring: settings.greekRing,
    });
  }

  const path: Hop[] = [];
  let signal = toIndex(input);
  const hop = (stage: Stage, direction: Hop["direction"], next: number) => {
    path.push({ stage, direction, from: signal, to: next });
    signal = next;
  };

  hop("plugboard", "in", plugs[signal]);
  for (const w of wheels) hop(w.stage, "in", throughWheel(w.spec, signal, w.position, w.ring, false));
  hop("reflector", "turn", toIndex(REFLECTORS[settings.reflector][signal]));
  for (const w of [...wheels].reverse()) hop(w.stage, "out", throughWheel(w.spec, signal, w.position, w.ring, true));
  hop("plugboard", "out", plugs[signal]);

  return { input, output: toLetter(signal), before: settings.positions, positions, path };
}

/**
 * Types a whole message, ignoring anything that isn't a letter, and returns
 * the text along with where the rotors finished.
 */
export function encipher(settings: Settings, text: string): { text: string; positions: [number, number, number] } {
  let current = settings;
  let out = "";
  for (const ch of text.toUpperCase()) {
    if (toIndex(ch) < 0) continue;
    const result = press(current, ch);
    out += result.output;
    current = { ...current, positions: result.positions };
  }
  return { text: out, positions: current.positions };
}

/** Reads "B U L" or "BUL" as positions. */
export function lettersToPositions(letters: string): [number, number, number] {
  const [a, b, c] = letters.replace(/\s/g, "").toUpperCase().split("").map(toIndex);
  return [a, b, c];
}
