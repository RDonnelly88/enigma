import { describe, expect, it } from "vitest";
import { ANSWER, POSITIONS, follow, spread } from "@/lib/story/be-the-bombe";

const guesses = Array.from({ length: 26 }, (_, g) => g);

describe("the hand-run Bombe", () => {
  it("prints cards that swap letters in pairs and never leave one as itself, like a scrambler", () => {
    for (const { cards } of POSITIONS)
      for (const card of cards)
        card.forEach((partner, x) => {
          expect(partner).not.toBe(x);
          expect(card[partner]).toBe(x);
        });
  });

  it("contradicts every guess at a wrong position, and keeps only the answer at the right one", () => {
    for (const { cards, right } of POSITIONS) {
      const survivors = guesses.filter((g) => follow(cards, g).consistent);
      expect(survivors).toEqual(right ? [ANSWER] : []);
    }
  });

  it("lights every wire at a wrong position, and leaves some dark at the right one", () => {
    for (const { cards, right } of POSITIONS) {
      const lit = spread(cards, 1).at(-1)!;
      if (right) expect(lit.size).toBeLessThan(26);
      else expect(lit.size).toBe(26);
      if (right) expect(lit.has(ANSWER)).toBe(false);
    }
    const right = POSITIONS.find((p) => p.right)!;
    expect(spread(right.cards, ANSWER).at(-1)!.size).toBe(1);
  });
});
