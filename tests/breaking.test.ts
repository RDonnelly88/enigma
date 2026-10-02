import { describe, expect, it } from "vitest";
import { menu } from "@/lib/crib";
import { ALPHABET, DEFAULT_SETTINGS, lettersToPositions, plugboardMap, type Settings } from "@/lib/enigma";
import { PRACTICE_CIPHERTEXT, PRACTICE_CRIB, PRACTICE_CRIB_AT, PRACTICE_KEY } from "@/lib/messages";
import { findLoop, followLoop, survivors } from "@/lib/story/bombe";
import { characteristic, cycles, indicators, pairing, partialPairing } from "@/lib/story/rejewski";

const day: Settings = { ...DEFAULT_SETTINGS, rotors: ["II", "I", "III"], positions: lettersToPositions("KFQ"), rings: [3, 9, 20] };

describe("Rejewski's characteristic", () => {
  it("is the same whatever the plugboard", () => {
    const plugged = { ...day, plugboard: ["AB", "CD", "EF", "GH", "IJ", "KL"] };
    for (const first of [0, 1, 2] as const) {
      expect(pairing(plugged, first)).not.toEqual(pairing(day, first));
      expect(characteristic(pairing(plugged, first))).toEqual(characteristic(pairing(day, first)));
    }
  });

  it("changes with the rotors", () => {
    const other = { ...day, positions: lettersToPositions("KFR") };
    const all = (s: Settings) => [0, 1, 2].map((f) => characteristic(pairing(s, f as 0 | 1 | 2)).join());
    expect(all(other)).not.toEqual(all(day));
  });

  it("has its cycles in pairs of equal length", () => {
    for (const first of [0, 1, 2] as const) {
      const lengths = characteristic(pairing(day, first));
      expect(lengths.reduce((a, b) => a + b, 0)).toBe(26);
      const tally = new Map<number, number>();
      lengths.forEach((l) => tally.set(l, (tally.get(l) ?? 0) + 1));
      for (const count of tally.values()) expect(count % 2).toBe(0);
    }
  });

  it("can be pieced together from a day's indicators", () => {
    const seen = indicators(day, 200);
    expect(seen.every((i) => i.length === 6)).toBe(true);
    expect(partialPairing(seen, 0)).toEqual(pairing(day, 0));
    // With few messages, only part is known, and incomplete cycles aren't reported
    const few = partialPairing(seen.slice(0, 5), 0);
    expect(few.filter((x) => x >= 0).length).toBeLessThan(26);
    expect(cycles(few).flat().length).toBeLessThan(26);
  });
});

describe("Turing's loop test", () => {
  const links = menu(PRACTICE_CIPHERTEXT, PRACTICE_CRIB, PRACTICE_CRIB_AT);
  const loop = findLoop(links)!;
  const plugs = plugboardMap(PRACTICE_KEY.plugboard);

  it("finds a closed loop in the practice menu", () => {
    expect(loop).not.toBeNull();
    expect(loop.at(-1)!.b).toBe(loop[0].a);
  });

  it("brings the true plug back unchanged at the right setting", () => {
    const start = ALPHABET.indexOf(loop[0].a);
    expect(followLoop(PRACTICE_KEY, loop, plugs[start]).consistent).toBe(true);
    expect(survivors(PRACTICE_KEY, loop)).toContain(ALPHABET[plugs[start]]);
  });

  it("throws out most guesses at wrong settings", () => {
    let total = 0;
    for (let r = 1; r < 26; r++) {
      const wrong = { ...PRACTICE_KEY, positions: [PRACTICE_KEY.positions[0], PRACTICE_KEY.positions[1], (PRACTICE_KEY.positions[2] + r) % 26] as Settings["positions"] };
      total += survivors(wrong, loop).length;
    }
    // On average a wrong setting lets through about one guess in 26
    expect(total / 25).toBeLessThan(3);
  });
});

describe("the statistics, step by step", async () => {
  const { climbHistory, indexOfCoincidence } = await import("@/lib/codebreaker");
  const { CODEBREAKER_PRACTICE, SIX_CABLE_KEY } = await import("@/lib/messages");
  const { partlyRight } = await import("@/lib/story/ioc");
  const numbers = (t: string) => Uint8Array.from(t, (c) => c.charCodeAt(0) - 65);

  it("climbs from no cables to all six, the score rising every step", () => {
    const steps = climbHistory(CODEBREAKER_PRACTICE[0].ciphertext, { ...SIX_CABLE_KEY, plugboard: [] }, "german");
    expect(steps[0].plugboard).toEqual([]);
    expect([...steps.at(-1)!.plugboard].sort()).toEqual([...SIX_CABLE_KEY.plugboard].sort());
    for (let i = 1; i < steps.length; i++) expect(steps[i].score).toBeGreaterThan(steps[i - 1].score);
    expect(steps.at(-1)!.text.startsWith("ANXDASXOBERKOMMANDO")).toBe(true);
  });

  it("rises with how much of the text is right", () => {
    const text = "ANXDASXOBERKOMMANDOXDERXWEHRMACHTXDIEXUEBUNGXDERXDRITTENXDIVISIONXBEGINNTXAMXMONTAGXUMXSECHSXUHRXDIEXTRUPPENXSAMMELNXSICH";
    const iocs = [0, 0.5, 1].map((share) => indexOfCoincidence(numbers(partlyRight(text, share))));
    expect(iocs[0]).toBeLessThan(iocs[1]);
    expect(iocs[1]).toBeLessThan(iocs[2]);
  });
});
