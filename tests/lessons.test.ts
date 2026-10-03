import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, lettersToPositions, type Settings } from "@/lib/enigma";
import { LESSONS, type Snapshot } from "@/lib/lessons";
import { INTERCEPTS } from "@/lib/messages";
import { initialState, reducer, type Action, type State } from "@/lib/machine-state";

const lesson = (id: string) => LESSONS.find((l) => l.id === id)!;

/** Runs actions through the machine and returns what the lessons see. */
function play(actions: Action[], start: Settings = DEFAULT_SETTINGS, extra: Partial<Snapshot> = {}): Snapshot {
  const state = actions.reduce<State>((s, a) => reducer(s, a), initialState(start));
  return { ...state, ...extra };
}
const type = (text: string): Action[] => [...text].flatMap((letter) => [{ type: "down", letter }, { type: "up" }] as Action[]);

describe("signals school", () => {
  it("has unique lessons, each with somewhere to learn more", () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
    for (const l of LESSONS) expect(l.learnMore.href).toMatch(/^\//);
  });

  it("counts a first key press", () => {
    expect(lesson("first-key").done(play([]))).toBe(false);
    expect(lesson("first-key").done(play(type("Q")))).toBe(true);
  });

  it("wants five As in a row", () => {
    expect(lesson("new-letter").done(play(type("AAAAB")))).toBe(false);
    expect(lesson("new-letter").done(play(type("XAAAAA")))).toBe(true);
  });

  it("wants the whole alphabet, and no letter lights itself", () => {
    const s = play(type("ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
    expect(lesson("never-itself").done(s)).toBe(true);
    for (let i = 0; i < 26; i++) expect(s.output[i]).not.toBe(s.input[i]);
  });

  it("recognises reading a message back after a rewind", () => {
    const sent = play(type("HELLO"));
    const readBack = play([...type("HELLO"), { type: "rewind" }, ...type(sent.output)]);
    expect(lesson("read-back").done(readBack)).toBe(true);
    expect(readBack.output).toBe("HELLO");
    // Typing something else after the rewind doesn't count
    expect(lesson("read-back").done(play([...type("HELLO"), { type: "rewind" }, ...type("HELLO")]))).toBe(false);
  });

  it("checks the rotor windows", () => {
    const set = { ...DEFAULT_SETTINGS, positions: lettersToPositions("BLA") };
    expect(lesson("set-rotors").done(play([{ type: "configure", settings: set }]))).toBe(true);
    expect(lesson("set-rotors").done(play([]))).toBe(false);
  });

  it("catches a double step from its own setup", () => {
    const { setup } = lesson("double-step");
    expect(lesson("double-step").done(play(type("AA"), setup))).toBe(false);
    expect(lesson("double-step").done(play(type("AAA"), setup))).toBe(true);
  });

  it("needs a plugged letter pressed, not just a cable", () => {
    const plugged = { ...DEFAULT_SETTINGS, plugboard: ["AQ"] };
    expect(lesson("plug").done(play(type("Z"), plugged))).toBe(false);
    const s = play(type("A"), plugged);
    expect(lesson("plug").done(s)).toBe(true);
    expect(lesson("plug").lesson(s)).toContain("A became Q on the way into the rotors");
  });

  it("decrypts Barbarossa and U-534 from their setups", () => {
    for (const [id, intercept] of [["barbarossa", "barbarossa"], ["navy", "u534"]] as const) {
      const { setup } = lesson(id);
      const cipher = INTERCEPTS.find((i) => i.id === intercept)!.ciphertext;
      expect(lesson(id).done(play([{ type: "message", text: cipher.slice(0, 30) }], setup))).toBe(true);
      expect(lesson(id).done(play([{ type: "message", text: cipher.slice(0, 30) }]))).toBe(false);
    }
  });

  it("knows when a message has been transmitted or shared", () => {
    expect(lesson("transmit").done(play([], DEFAULT_SETTINGS, { transmitted: true }))).toBe(true);
    expect(lesson("share").done(play([], DEFAULT_SETTINGS, { shared: true }))).toBe(true);
    expect(lesson("share").done(play([]))).toBe(false);
  });
});

describe("lessons on the machine", () => {
  it("are marked complete as they happen, and stay complete", () => {
    let state = initialState(DEFAULT_SETTINGS);
    for (const action of type("AAAAA")) state = reducer(state, action);
    expect(state.completed).toEqual(["first-key", "new-letter"]);
    state = reducer(state, { type: "down", letter: "B" });
    expect(state.completed).toContain("new-letter");
  });

  it("are marked when a message is transmitted or shared", () => {
    let state = reducer(initialState(DEFAULT_SETTINGS), { type: "transmitted" });
    state = reducer(state, { type: "shared" });
    expect(state.completed).toEqual(["transmit", "share"]);
  });

  it("come back from an earlier visit, ignoring anything unknown", () => {
    const state = reducer(initialState(DEFAULT_SETTINGS), { type: "restore", completed: ["plug", "nonsense"] });
    expect(state.completed).toEqual(["plug"]);
  });
});

describe("what a finished lesson says", () => {
  it("still reads sensibly once the tape has been cleared", () => {
    const empty = play([]);
    for (const l of LESSONS) expect(l.lesson(empty)).not.toMatch(/undefined/);
  });
});

describe("the lesson just finished", () => {
  it("is remembered so its panel can stay open", () => {
    let state = initialState(DEFAULT_SETTINGS);
    expect(state.justCompleted).toBeNull();
    state = reducer(state, { type: "down", letter: "Q" });
    expect(state.justCompleted).toBe("first-key");
  });
});
