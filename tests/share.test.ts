import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/enigma";
import { machineLink, readMachineLink } from "@/lib/share";

describe("machine links", () => {
  it("carry a key and a message there and back", () => {
    const settings = { ...DEFAULT_SETTINGS, rotors: ["V", "I", "III"] as const, plugboard: ["AB"] };
    const link = machineLink({ ...settings, rotors: [...settings.rotors] }, "QWERT");
    expect(readMachineLink(link.split("?")[1])).toEqual({ settings: { ...settings, rotors: ["V", "I", "III"] }, text: "QWERT" });
  });

  it("refuse a key the machine can't run", () => {
    expect(readMachineLink(`key=${encodeURIComponent(JSON.stringify({ ...DEFAULT_SETTINGS, rotors: ["I", "I", "I"] }))}`)).toBeNull();
    expect(readMachineLink("key=not-json")).toBeNull();
    expect(readMachineLink("key=null")).toBeNull();
    expect(readMachineLink("")).toBeNull();
  });
});

describe("key codes", async () => {
  const { keyCode, readKeyCode, readSecret, secretLink } = await import("@/lib/share");
  const { INTERCEPTS } = await import("@/lib/messages");

  it("read like a key sheet and come back as the same settings", () => {
    for (const intercept of INTERCEPTS) {
      const code = keyCode(intercept.settings);
      expect(readKeyCode(code)).toEqual({ ...intercept.settings });
    }
    expect(keyCode(INTERCEPTS[0].settings)).toBe("B · II IV V · BUL · BLA · AV BS CG DL FU HZ IN KM OW RX");
    expect(keyCode(INTERCEPTS[1].settings)).toBe("B Thin · Beta II IV I · AAAV · VJNA · AT BL DF GJ HM NW OP QY RZ VX");
  });

  it("forgive spacing and case, and say so when there are no cables", () => {
    expect(readKeyCode("b · ii iv v · bul · bla · av bs")).toEqual({ ...INTERCEPTS[0].settings, plugboard: ["AV", "BS"] });
    expect(readKeyCode("b thin · beta ii iv i · aaav · vjna · no cables")?.model).toBe("M4");
    expect(readKeyCode("B·I II III·AAA·AAA·no cables")).toEqual(DEFAULT_SETTINGS);
    expect(readKeyCode("B · I II III · aaa · aaa · ab cd")?.plugboard).toEqual(["AB", "CD"]);
  });

  it("refuse anything that isn't a working key", () => {
    for (const bad of ["", "nonsense", "B · I I III · AAA · AAA · no cables", "Q · I II III · AAA · AAA · no cables", "B · I II III · AA · AAA · no cables", "B · I II III · AAA · AAA · AB AC"]) {
      expect(readKeyCode(bad)).toBeNull();
    }
  });

  it("carry only the ciphertext in a secret link", () => {
    const link = secretLink("QWERT ZUIOP");
    expect(link).not.toContain("key=");
    expect(readSecret(link.split("?")[1])).toBe("QWERTZUIOP");
    expect(readSecret("")).toBeNull();
  });
});
