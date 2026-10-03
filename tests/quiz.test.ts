import { describe, expect, it } from "vitest";
import { encipher } from "@/lib/enigma";
import { CERTIFICATE_KEY, enciphered, PASS_MARK, QUESTIONS, rank, score } from "@/lib/quiz";

describe("the codebreaker's test", () => {
  it("has an answer among each question's options", () => {
    for (const q of QUESTIONS) expect(q.options[q.answer]).toBeDefined();
  });

  it("doesn't always hide the answer in the same place", () => {
    expect(new Set(QUESTIONS.map((q) => q.answer)).size).toBeGreaterThan(2);
  });

  it("scores right answers only", () => {
    const perfect = QUESTIONS.map((q) => q.answer);
    expect(score(perfect)).toBe(QUESTIONS.length);
    expect(score(perfect.map(() => null))).toBe(0);
  });

  it("gives a certificate from the pass mark up, and a better title for more", () => {
    expect(rank(PASS_MARK - 1)).toBeNull();
    expect(rank(PASS_MARK)).toBe("Codebreaker");
    expect(rank(QUESTIONS.length)).toBe("Head of Hut");
  });

  it("enciphers the name so the machine reads it back", () => {
    const { text } = enciphered("Ada Lovelace");
    expect(text).toHaveLength("ADAXLOVELACE".length);
    expect(encipher(CERTIFICATE_KEY, text).text).toBe("ADAXLOVELACE");
  });
});
