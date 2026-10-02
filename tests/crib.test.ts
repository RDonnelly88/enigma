import { describe, expect, it } from "vitest";
import { encipher, DEFAULT_SETTINGS } from "@/lib/enigma";
import { loops, menu, onlyLetters, placements } from "@/lib/crib";

describe("placements", () => {
  it("rules out an offset where a letter meets itself", () => {
    const result = placements("QWERTY", "XE");
    expect(result.map((p) => p.clashes.length > 0)).toEqual([false, true, false, false, false]);
    expect(result[1].clashes).toEqual([1]);
  });

  it("never rules out the true position of the crib", () => {
    const plaintext = "KEINEBESONDERENEREIGNISSEXWETTERVORHERSAGEXREGEN";
    const ciphertext = encipher({ ...DEFAULT_SETTINGS, plugboard: ["AQ", "EZ"] }, plaintext).text;
    const truth = plaintext.indexOf("WETTERVORHERSAGE");
    const result = placements(ciphertext, "WETTERVORHERSAGE");
    expect(result[truth].clashes).toEqual([]);
  });

  it("ignores spacing and case", () => {
    expect(placements("ab cd", "x y")).toHaveLength(3);
    expect(onlyLetters("ab cd!")).toBe("ABCD");
  });

  it("has nothing to place when the crib is empty or too long", () => {
    expect(placements("ABC", "")).toEqual([]);
    expect(placements("ABC", "ABCD")).toEqual([]);
  });
});

describe("the menu", () => {
  it("links each crib letter to the ciphertext beneath it", () => {
    expect(menu("XXQRS", "ABC", 2)).toEqual([
      { a: "A", b: "Q", step: 2 },
      { a: "B", b: "R", step: 3 },
      { a: "C", b: "S", step: 4 },
    ]);
  });

  it("counts loops", () => {
    // A-B, B-C, C-A is one loop; a chain has none
    expect(loops([{ a: "A", b: "B", step: 0 }, { a: "B", b: "C", step: 1 }, { a: "C", b: "A", step: 2 }])).toBe(1);
    expect(loops([{ a: "A", b: "B", step: 0 }, { a: "C", b: "D", step: 1 }])).toBe(0);
    // The same pair at two steps is itself a loop: two routes between the same letters
    expect(loops([{ a: "A", b: "B", step: 0 }, { a: "B", b: "A", step: 5 }])).toBe(1);
  });
});
