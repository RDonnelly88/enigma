import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/enigma";
import { initialState, reducer } from "@/lib/machine-state";

describe("resetting the machine", () => {
  const used = () => {
    let s = initialState({ ...DEFAULT_SETTINGS, positions: [3, 4, 5], plugboard: ["AB"] });
    s = reducer(s, { type: "message", text: "AAAAA" });
    return s;
  };

  it("goes back to the default settings and an empty tape, keeping lessons done", () => {
    const before = used();
    expect(before.completed.length).toBeGreaterThan(0);
    const after = reducer(before, { type: "reset", lessons: false });
    expect(after.settings).toEqual(DEFAULT_SETTINGS);
    expect(after.input).toBe("");
    expect(after.completed).toEqual(before.completed);
  });

  it("forgets the lessons too when asked", () => {
    const after = reducer(used(), { type: "reset", lessons: true });
    expect(after.completed).toEqual([]);
    expect(after.settings).toEqual(DEFAULT_SETTINGS);
  });
});
