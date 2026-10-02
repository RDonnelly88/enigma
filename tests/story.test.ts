import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, ROTORS, lettersToPositions, validate } from "@/lib/enigma";
import { letterCounts, profile, substitute } from "@/lib/story/frequency";
import { keySheet, settingsFor } from "@/lib/story/keysheet";
import { receiveMessage, sendMessage } from "@/lib/story/procedure";
import { history } from "@/lib/story/stepping";

describe("letter frequencies", () => {
  it("counts letters and ignores everything else", () => {
    expect(letterCounts("Aa b!")[0]).toBe(2);
    expect(letterCounts("Aa b!")[1]).toBe(1);
  });

  it("keeps the same shape through a simple swap", () => {
    const text = "WETTERVORHERSAGEFUERDIEBISKAYA";
    const swapped = substitute(text, ROTORS.I.wiring);
    expect(profile(swapped).map((p) => p.count)).toEqual(profile(text).map((p) => p.count));
  });
});

describe("rotor stepping history", () => {
  it("records the middle rotor's turnover and the double step", () => {
    const moves = history({ ...DEFAULT_SETTINGS, positions: lettersToPositions("ADU") }, 3);
    expect(moves.map((m) => m.windows)).toEqual(["ADV", "AEW", "BFX"]);
    expect(moves.map((m) => m.middle)).toEqual([false, true, true]);
    expect(moves.map((m) => m.left)).toEqual([false, false, true]);
  });

  it("goes round in 16,900 presses, not 17,576, because of the double step", () => {
    const moves = history(DEFAULT_SETTINGS, 17_000);
    const first = moves[0].windows;
    expect(moves.findIndex((m, i) => i > 0 && m.windows === first)).toBe(16_900);
  });
});

describe("the key sheet", () => {
  const sheet = keySheet();

  it("is the same every time", () => {
    expect(keySheet()).toEqual(sheet);
  });

  it("gives a valid machine for every day", () => {
    expect(sheet).toHaveLength(31);
    for (const day of sheet) expect(validate(settingsFor(day, day.basic))).toEqual([]);
    expect(sheet.every((d) => d.plugboard.length === 10)).toBe(true);
  });
});

describe("the 1930s message procedure", () => {
  const day = keySheet()[0];

  it("sends a doubled message key that the receiver can recover", () => {
    const sent = sendMessage(day, "QRS", "ANGRIFFXIMXMORGENGRAUEN");
    expect(sent.indicator).toHaveLength(6);
    const received = receiveMessage(day, sent.indicator, sent.body);
    expect(received.doubled).toBe("QRSQRS");
    expect(received.text).toBe("ANGRIFFXIMXMORGENGRAUEN");
  });

  it("enciphers the repeated key differently each time", () => {
    const { indicator } = sendMessage(day, "AAA", "X");
    expect(indicator.slice(0, 3)).not.toBe(indicator.slice(3));
  });
});
