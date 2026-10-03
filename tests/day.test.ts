import { describe, expect, it } from "vitest";
import { plugboardMap } from "@/lib/enigma";
import { buildDay, DAY_KEY, ORDER, WEATHER } from "@/lib/story/day";

const day = buildDay();

describe("a day in 1941", () => {
  it("deciphers both messages from their indicators, as the receiving operator would", () => {
    expect(day.readWeather).toEqual({ messageKey: WEATHER.messageKey, text: WEATHER.plain });
    expect(day.readOrder).toEqual({ messageKey: ORDER.messageKey, text: ORDER.plain });
  });

  it("leaves the crib's true place standing", () => {
    expect(day.crib[0].clashes).toEqual([]);
    expect(day.cribSurvivors).toBeLessThan(day.crib.length);
  });

  it("has a loop in its menu, and the Bombe stops at the true setting on the true plug", () => {
    expect(day.loop).not.toBeNull();
    const truth = day.scan[day.truePosition];
    const start = day.loop![0].a.charCodeAt(0) - 65;
    expect(truth.stops).toContain(String.fromCharCode(65 + plugboardMap(DAY_KEY.plugboard)[start]));
  });

  it("stops far less often at wrong settings than there are guesses", () => {
    const wrong = day.scan.filter((s) => s.position !== day.truePosition);
    const average = wrong.reduce((n, s) => n + s.stops.length, 0) / wrong.length;
    expect(average).toBeLessThan(4);
  });
});
