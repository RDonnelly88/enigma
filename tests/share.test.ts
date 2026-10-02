import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/enigma";
import { machineLink, readMachineLink } from "@/lib/share";

describe("machine links", () => {
  it("carry a key and a message there and back", () => {
    const settings = { ...DEFAULT_SETTINGS, rotors: ["V", "I", "III"] as const, plugboard: ["AB"] };
    const link = machineLink({ ...settings, rotors: [...settings.rotors] }, "QWERT");
    expect(readMachineLink(link.slice(1))).toEqual({ settings: { ...settings, rotors: ["V", "I", "III"] }, text: "QWERT" });
  });

  it("refuse a key the machine can't run", () => {
    expect(readMachineLink(`key=${encodeURIComponent(JSON.stringify({ ...DEFAULT_SETTINGS, rotors: ["I", "I", "I"] }))}`)).toBeNull();
    expect(readMachineLink("key=not-json")).toBeNull();
    expect(readMachineLink("key=null")).toBeNull();
    expect(readMachineLink("")).toBeNull();
  });
});
