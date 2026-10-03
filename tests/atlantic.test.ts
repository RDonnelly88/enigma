import { describe, expect, it } from "vitest";
import { encipher } from "@/lib/enigma";
import { ROUTES, WEATHER_REPORT, YEARS, fourRotor, packsFor, sail, twin, type Year } from "@/lib/story/atlantic";

describe("the four-rotor machine", () => {
  it("enciphers exactly like the three-rotor one with its fourth wheel at A", () => {
    expect(twin(WEATHER_REPORT, 0).identical).toBe(true);
  });

  it("differs everywhere else, though each place of the fourth wheel is still a working machine", () => {
    for (let fourth = 1; fourth < 26; fourth++) {
      const { identical, four } = twin(WEATHER_REPORT, fourth);
      expect(identical).toBe(false);
      // The fourth wheel never moves in a message, so with the thin reflector it acts as one fixed reflector
      expect(encipher(fourRotor(fourth), four).text).toBe(WEATHER_REPORT);
    }
  });
});

describe("routing a convoy", () => {
  const years = Object.keys(YEARS).map(Number) as Year[];

  it("meets the same packs for the same convoy, on different routes, as many as the year had", () => {
    for (const year of years)
      for (let convoy = 0; convoy < 20; convoy++) {
        const packs = packsFor(year, convoy);
        expect(packs).toEqual(packsFor(year, convoy));
        expect(new Set(packs).size).toBe(YEARS[year].packs);
        for (const p of packs) expect(ROUTES).toContain(p);
      }
  });

  it("always leaves a clear route, and loses ships only where a pack waits without the escorts of 1943", () => {
    for (const year of years)
      for (let convoy = 0; convoy < 20; convoy++) {
        const outcomes = ROUTES.map((r) => sail(year, convoy, r));
        expect(outcomes).toContain("clear");
        expect(outcomes).toContain(year === 1943 ? "fought-off" : "lost");
      }
  });

  it("moves the packs about from one convoy to the next", () => {
    const seen = new Set(Array.from({ length: 12 }, (_, c) => packsFor(1941, c)[0]));
    expect(seen.size).toBe(ROUTES.length);
  });
});
