import { describe, expect, it } from "vitest";
import { encipher, press, DEFAULT_SETTINGS, type Settings } from "@/lib/enigma";
import { menu } from "@/lib/crib";
import { ordersOf, runBombe, testLetter, testStart } from "@/lib/story/bombe-run";
import { CHALLENGE, CIPHERTEXT, checkStop, cribPlacements, hint, menuAt, solved } from "@/lib/story/challenge";

describe("the Bombe run", () => {
  it("stops at the true key, with the plugboard the menu implies", () => {
    const key: Settings = { ...DEFAULT_SETTINGS, rotors: ["III", "I", "II"], positions: [3, 24, 7], plugboard: ["AB", "CD", "EF"] };
    const plain = "WETTERVORHERSAGEXBISKAYAXREGEN";
    const links = menu(encipher(key, plain).text, plain.slice(0, 16), 0);
    const found = testStart(key.rotors, key.positions, links, testLetter(links));
    const letters = new Set(links.flatMap((l) => [l.a, l.b]));
    const expected = key.plugboard.filter((p) => letters.has(p[0]) || letters.has(p[1]));
    expect(found.some((pairs) => expected.every((p) => pairs.includes(p)))).toBe(true);
  });

  it("steps the rotors exactly as the machine does, double step included", () => {
    // Middle rotor II one short of its notch: the run must cross a double step to stay right
    const key: Settings = { ...DEFAULT_SETTINGS, rotors: ["I", "II", "III"], positions: [0, 3, 20], plugboard: [] };
    const plain = "ANXKAMPFGESCHWADERXZWEIXANGRIFF";
    const links = menu(encipher(key, plain).text, plain, 0);
    expect(press(key, "A").positions).toEqual([0, 3, 21]);
    expect(testStart(key.rotors, key.positions, links, testLetter(links)).length).toBeGreaterThan(0);
  });

  it("lists every way to fit three rotors", () => {
    expect(ordersOf(["I", "II", "III"])).toHaveLength(6);
  });
});

describe("the challenge intercept", () => {
  it("lets the crib fit in more than one place, the true one among them", () => {
    const free = cribPlacements().filter((p) => p.clashes.length === 0).map((p) => p.offset);
    expect(free).toContain(CHALLENGE.cribAt);
    expect(free.length).toBeGreaterThan(1);
  });

  it("gives one stop at the true place, and none where the crib only seems to fit", { timeout: 60_000 }, () => {
    const free = cribPlacements().filter((p) => p.clashes.length === 0).map((p) => p.offset);
    for (const offset of free) {
      const links = menuAt(offset);
      const stops = ordersOf([...CHALLENGE.rotors]).flatMap((o) => runBombe(o, links, testLetter(links)));
      if (offset === CHALLENGE.cribAt) {
        expect(stops).toHaveLength(1);
        expect(stops[0].order).toEqual(CHALLENGE.key.rotors);
        expect(stops[0].start).toEqual(CHALLENGE.key.positions);
        expect(stops[0].pairs.every((p) => CHALLENGE.key.plugboard.some((q) => q === p || q === p[1] + p[0]))).toBe(true);
        expect(solved(stops[0].pairs)).toBe(false);
      } else {
        expect(stops).toHaveLength(0);
      }
    }
  });

  it("reads perfectly with every cable, and hints lead to each missing one", () => {
    expect(checkStop(CHALLENGE.key.rotors, CHALLENGE.key.positions, CHALLENGE.key.plugboard)).toBe(CHALLENGE.plain);
    let cables = CHALLENGE.key.plugboard.filter((p) => !["VB", "RU", "TY"].includes(p));
    for (let i = 0; i < 3; i++) {
      const h = hint(cables)!;
      expect(h.got).not.toBe(h.want);
      cables = [...cables, h.wrong + h.right];
    }
    expect(solved(cables)).toBe(true);
    expect(hint(cables)).toBeNull();
    expect(CIPHERTEXT).toHaveLength(CHALLENGE.plain.length);
  });
});
