import { describe, expect, it } from "vitest";
import { MORSE, timeline, unit } from "@/lib/morse";

describe("Morse", () => {
  it("has a code for every letter, all different", () => {
    expect(Object.keys(MORSE)).toHaveLength(26);
    expect(new Set(Object.values(MORSE)).size).toBe(26);
  });

  it("runs at the standard speed: PARIS takes 50 dots at any speed", () => {
    // PARIS plus its seven-dot word gap is the definition of one word
    const { duration } = timeline("PARIS", 20);
    expect(duration + 7 * unit(20)).toBeCloseTo(50 * unit(20));
    expect(unit(20)).toBe(60);
  });

  it("times dots, dashes and gaps", () => {
    const { tones } = timeline("ET", 20);
    expect(tones).toEqual([
      { letter: 0, start: 0, duration: 60 },
      { letter: 1, start: 60 + 180, duration: 180 },
    ]);
  });

  it("leaves a word's gap between groups of five", () => {
    const { tones } = timeline("EEEEEE", 20);
    expect(tones[5].start - (tones[4].start + tones[4].duration)).toBe(7 * 60);
    expect(tones[1].start - (tones[0].start + tones[0].duration)).toBe(3 * 60);
  });
});
