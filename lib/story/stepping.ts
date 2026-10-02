import { ALPHABET, step, type Settings } from "../enigma";

export type Movement = {
  /** The key press, counting from 1. */
  press: number;
  windows: string;
  middle: boolean;
  /**
   * The left rotor only moves when the middle one stands at its notch, and
   * then the middle steps as well: so a moving left rotor is a double step.
   */
  left: boolean;
};

/** The rotor windows after each of the first `presses` key presses, and which rotors moved on each. */
export function history(settings: Settings, presses: number): Movement[] {
  const out: Movement[] = [];
  let current = settings;
  for (let press = 1; press <= presses; press++) {
    const before = current.positions;
    const after = step(current);
    out.push({
      press,
      windows: after.map((p) => ALPHABET[p]).join(""),
      middle: after[1] !== before[1],
      left: after[0] !== before[0],
    });
    current = { ...current, positions: after };
  }
  return out;
}
