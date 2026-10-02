import { describe, expect, it } from "vitest";
import { bigramScore, breakCipher, DEFAULT_OPTIONS, indexOfCoincidence, looksReadable, type Options } from "@/lib/codebreaker";
import { DEFAULT_SETTINGS, encipher, lettersToPositions, type RotorName, type Settings } from "@/lib/enigma";
import { CODEBREAKER_PRACTICE } from "@/lib/messages";

const GERMAN =
  "VONXFUEHRERXDERXUNTERSEEBOOTEXANXALLEXBOOTEXIMXNORDATLANTIKXDERXGELEITZUGXHATXKURSXGEAENDERTXNEUERXKURSXISTXNORDNORDOSTXGESCHWINDIGKEITXACHTXSEEMEILENXALLEXBOOTEXSOLLENXSICHXINXDERXNACHTXSAMMELNXUNDXBEIXTAGESANBRUCHXANGREIFEN";
const ENGLISH =
  "THEWEATHERWILLTURNCOLDERTOWARDSTHEENDOFTHEWEEKANDTHESHIPSINTHENORTHERNGROUPARETORETURNTOPORTBEFORETHESTORMARRIVESALLOTHERUNITSWILLHOLDTHEIRPRESENTPOSITIONSANDREPORTANYCHANGEINTHEENEMYSMOVEMENTSATONCETHEMEETINGISCANCELLEDUNTILFURTHERNOTICE";

// Three rotors keep each break to a second or so; the page searches all five
const QUICK: Options = { ...DEFAULT_OPTIONS, rotors: ["I", "III", "V"] };

const key = (overrides: Partial<Settings>): Settings => ({
  ...DEFAULT_SETTINGS,
  rotors: ["III", "I", "V"],
  rings: [4, 11, 17],
  positions: lettersToPositions("QWE"),
  ...overrides,
});

describe("breaking a message with no key", () => {
  it("recovers six cables and the rotors from German ciphertext alone", () => {
    const settings = key({ plugboard: ["AR", "GK", "OX", "BM", "TZ", "HL"] });
    const result = breakCipher(encipher(settings, GERMAN).text, QUICK);
    expect(result.stage).toBe("done");
    if (result.stage !== "done") return;
    expect(result.text).toBe(GERMAN);
    expect(result.settings.rotors).toEqual(["III", "I", "V"]);
    expect([...result.settings.plugboard].sort()).toEqual(["AR", "BM", "GK", "HL", "OX", "TZ"]);
    expect(looksReadable(result.score, "german")).toBe(true);
  });

  it("returns settings the machine itself can use to read the message", () => {
    const ciphertext = encipher(key({ plugboard: ["AR", "GK", "OX", "BM", "TZ"] }), GERMAN).text;
    const result = breakCipher(ciphertext, QUICK);
    if (result.stage !== "done") throw new Error("no result");
    expect(encipher(result.settings, ciphertext).text).toBe(GERMAN);
  });

  it("copes with a double step part-way through", () => {
    // The middle rotor sits one short of its notch, so it double-steps and carries the left rotor
    const settings = key({ positions: lettersToPositions("QPE"), rings: [4, 2, 9], plugboard: ["AR", "GK", "OX", "BM"] });
    const result = breakCipher(encipher(settings, GERMAN).text, QUICK);
    if (result.stage !== "done") throw new Error("no result");
    expect(result.text).toBe(GERMAN);
  });

  it("breaks English when told the language", () => {
    const settings = key({ rotors: ["V", "III", "I"], plugboard: ["QZ", "WE", "RT", "YU", "IO"] });
    const result = breakCipher(encipher(settings, ENGLISH).text, { ...QUICK, language: "english" });
    if (result.stage !== "done") throw new Error("no result");
    expect(result.text).toBe(ENGLISH);
  });

  it("admits defeat on a short message with ten cables", () => {
    const settings = key({ plugboard: ["AR", "GK", "OX", "BM", "TZ", "HL", "CW", "DY", "FN", "JQ"] });
    const result = breakCipher(encipher(settings, GERMAN.slice(0, 150)).text, QUICK);
    if (result.stage !== "done") throw new Error("no result");
    expect(looksReadable(result.score, "german")).toBe(false);
  });
});

describe("the statistics", () => {
  const numbers = (text: string) => Uint8Array.from(text, (c) => c.charCodeAt(0) - 65);

  it("tells language from ciphertext by index of coincidence", () => {
    expect(indexOfCoincidence(numbers(GERMAN))).toBeGreaterThan(0.06);
    expect(indexOfCoincidence(numbers(encipher(key({}), GERMAN).text))).toBeLessThan(0.045);
  });

  it("scores real text above scrambled text", () => {
    const scrambled = encipher(key({}), GERMAN).text;
    expect(bigramScore(numbers(GERMAN), "german")).toBeGreaterThan(bigramScore(numbers(scrambled), "german") + 1);
    expect(looksReadable(bigramScore(numbers(GERMAN), "german"), "german")).toBe(true);
    expect(looksReadable(bigramScore(numbers(ENGLISH), "english"), "english")).toBe(true);
  });
});

describe("the practice intercepts", () => {
  // Searching only the rotors each was made with keeps these quick; the page searches all five
  const attempt = (id: string, rotors: RotorName[]) => {
    const practice = CODEBREAKER_PRACTICE.find((p) => p.id === id)!;
    const result = breakCipher(practice.ciphertext, { ...DEFAULT_OPTIONS, rotors, language: practice.language });
    if (result.stage !== "done") throw new Error("no result");
    return looksReadable(result.score, practice.language);
  };

  it("breaks the six-cable message", () => expect(attempt("six-cables", ["II", "V", "III"])).toBe(true));
  it("breaks the English message", () => expect(attempt("english", ["I", "IV", "V"])).toBe(true));
  it("can't break the ten-cable message", () => expect(attempt("ten-cables", ["IV", "I", "II"])).toBe(false));
});
