import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, lettersToPositions, press, type Settings } from "@/lib/enigma";
import { explain } from "@/lib/explain";

const text = (settings: Settings, letter: string) => explain(settings, press(settings, letter));

describe("explaining a key press", () => {
  it("works through the first rotor by hand", () => {
    // III steps from A to B; with ring A it is turned 1, so contact A meets wire B, which III wires to D, back 1 = C
    const steps = text(DEFAULT_SETTINGS, "A");
    const right = steps.find((s) => s.title === "Rotor III, on the way in")!;
    expect(right.body).toContain("shows B with its ring at A");
    expect(right.body).toContain("wires B to D");
    expect(right.body).toContain("comes out on contact C");
  });

  it("ends on the lamp the machine actually lit", () => {
    const steps = text(DEFAULT_SETTINGS, "A");
    expect(steps.at(-1)!.title).toBe("Lamp B lights");
  });

  it("has a step for every hop of the current", () => {
    const settings = { ...DEFAULT_SETTINGS, plugboard: ["AQ"] };
    const keypress = press(settings, "A");
    const hops = explain(settings, keypress).flatMap((s) => (s.hop === undefined ? [] : [s.hop]));
    expect(hops).toEqual(keypress.path.map((_, i) => i));
  });

  it("explains a cable and the lack of one", () => {
    const steps = text({ ...DEFAULT_SETTINGS, plugboard: ["AQ"] }, "A");
    expect(steps.find((s) => s.title === "The plugboard, going in")!.body).toContain("A has a cable to Q");
    expect(text(DEFAULT_SETTINGS, "A").find((s) => s.title === "The plugboard, going in")!.body).toContain("A has no cable");
  });

  it("says why the middle rotor moved", () => {
    // III's notch is V: showing V, the next press carries the middle rotor
    const steps = text({ ...DEFAULT_SETTINGS, positions: lettersToPositions("AAV") }, "A");
    expect(steps[1].body).toContain("its notch letter, so it carried the middle rotor (II) with it: A to B");
  });

  it("names the double step", () => {
    // II's notch is E: with the middle rotor showing E, it steps again and takes the left rotor
    const steps = text({ ...DEFAULT_SETTINGS, positions: lettersToPositions("AEW") }, "A");
    expect(steps[1].body).toContain("double step");
    expect(steps[1].body).toContain("A to B");
  });

  it("explains the M4's greek wheel", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, model: "M4", reflector: "B Thin", greekPosition: 3 };
    expect(text(settings, "A").some((s) => s.title === "Greek wheel Beta, on the way in")).toBe(true);
  });
});
