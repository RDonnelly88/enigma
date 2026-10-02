import { describe, expect, it } from "vitest";
import {
  ALPHABET,
  DEFAULT_SETTINGS,
  REFLECTORS,
  encipher,
  lettersToPositions,
  press,
  step,
  validate,
  type Settings,
} from "@/lib/enigma";

const m3 = (overrides: Partial<Settings>): Settings => ({ ...DEFAULT_SETTINGS, ...overrides });

function windowsAfter(settings: Settings, presses: number) {
  const seen: string[] = [];
  let current = settings;
  for (let i = 0; i < presses; i++) {
    current = { ...current, positions: step(current) };
    seen.push(current.positions.map((p) => ALPHABET[p]).join(""));
  }
  return seen;
}

describe("enciphering", () => {
  it("gives the standard check value", () => {
    expect(encipher(DEFAULT_SETTINGS, "AAAAA").text).toBe("BDZGO");
  });

  it("applies ring settings", () => {
    expect(encipher(m3({ rings: [1, 1, 1] }), "AAAAA").text).toBe("EWTYX");
  });

  it("decrypts the opening of a message sent during Operation Barbarossa", () => {
    const settings = m3({
      rotors: ["II", "IV", "V"],
      rings: [1, 20, 11],
      positions: lettersToPositions("BLA"),
      plugboard: ["AV", "BS", "CG", "DL", "FU", "HZ", "IN", "KM", "OW", "RX"],
    });
    const ciphertext =
      "EDPUD NRGYS ZRCXN UYTPO MRMBO FKTBZ REZKM LXLVE FGUEY SIOZV EQMIK UBPMM YLKLT TDEIS MDICA GYKUA CTCDO MOHWX MUUIA UBSTS LRNBZ SZWNR FXWFY SSXJZ VIJHI DISHP RKLKA YUPAD TXQSP INQMA TLPIF SVKDA SCTAC DPBOP VHJK";
    expect(encipher(settings, ciphertext).text).toBe(
      "AUFKLXABTEILUNGXVONXKURTINOWAXKURTINOWAXNORDWESTLXSEBEZXSEBEZXUAFFLIEGERSTRASZERIQTUNGXDUBROWKIXDUBROWKIXOPOTSCHKAXOPOTSCHKAXUMXEINSAQTDREINULLXUHRANGETRETENXANGRIFFXINFXRGTX",
    );
  });

  it("decrypts a four-rotor naval message", () => {
    // Sent to U-534 in May 1945
    const settings: Settings = {
      model: "M4",
      reflector: "B Thin",
      greek: "Beta",
      greekRing: 0,
      greekPosition: 21,
      rotors: ["II", "IV", "I"],
      rings: [0, 0, 21],
      positions: lettersToPositions("JNA"),
      plugboard: ["AT", "BL", "DF", "GJ", "HM", "NW", "OP", "QY", "RZ", "VX"],
    };
    const ciphertext =
      "NCZW VUSX PNYM INHZ XMQX SFWX WLKJ AHSH NMCO CCAK UQPM KCSM HKSE INJU SBLK IOSX CKUB HMLL XCSJ USRR DVKO HULX WCCB GVLI YXEO AHXR HKKF VDRE WEZL XOBA FGYU JQUK GRTV UKAM EURB VEKS UHHV OYHA BCJW MAKL FKLM YFVN RIZR VVRT KOFD ANJM OLBG FFLE OPRG TFLV RHOW OPBE KVWM UQFM PWPA RMFH AGKX IIBG";
    expect(encipher(settings, ciphertext).text).toBe(
      "VONVONJLOOKSJHFFTTTEINSEINSDREIZWOYYQNNSNEUNINHALTXXBEIANGRIFFUNTERWASSERGEDRUECKTYWABOSXLETZTERGEGNERSTANDNULACHTDREINULUHRMARQUANTONJOTANEUNACHTSEYHSDREIYZWOZWONULGRADYACHTSMYSTOSSENACHXEKNSVIERMBFAELLTYNNNNNNOOOVIERYSICHTEINSNULL",
    );
  });

  it("matches the three-rotor machine when the greek wheel sits at A", () => {
    // Designed so: the M4 could talk to shore stations still using the M3
    const text = "COMPATIBILITYWITHTHESHORESTATIONS";
    const base = m3({ rotors: ["III", "VI", "VIII"], rings: [3, 7, 11], positions: [1, 2, 3], plugboard: ["QZ"] });
    for (const [thin, wide] of [["B Thin", "B"], ["C Thin", "C"]] as const) {
      const greek = thin === "B Thin" ? "Beta" : "Gamma";
      const m4: Settings = { ...base, model: "M4", reflector: thin, greek };
      expect(encipher(m4, text).text).toBe(encipher({ ...base, reflector: wide }, text).text);
    }
  });

  it("is its own inverse", () => {
    const settings = m3({ rotors: ["IV", "I", "VII"], rings: [3, 14, 22], positions: [16, 25, 12], plugboard: ["AB", "CD", "EF"] });
    const ciphertext = encipher(settings, "WETTERVORHERSAGEBISKAYA").text;
    expect(encipher(settings, ciphertext).text).toBe("WETTERVORHERSAGEBISKAYA");
  });

  it("never lights the key that was pressed", () => {
    let settings = m3({ rotors: ["III", "II", "I"], positions: [23, 24, 25], plugboard: ["AZ", "QW"] });
    for (const letter of ALPHABET.repeat(30)) {
      const result = press(settings, letter);
      expect(result.output).not.toBe(letter);
      settings = { ...settings, positions: result.positions };
    }
  });

  it("ignores spaces and punctuation", () => {
    expect(encipher(DEFAULT_SETTINGS, "a a,a.a!a").text).toBe("BDZGO");
  });

  it("refuses a key that isn't a letter", () => {
    expect(() => press(DEFAULT_SETTINGS, "")).toThrow();
    expect(() => press(DEFAULT_SETTINGS, "1")).toThrow();
  });
});

describe("stepping", () => {
  it("double steps the middle rotor", () => {
    expect(windowsAfter(m3({ positions: lettersToPositions("ADU") }), 4)).toEqual(["ADV", "AEW", "BFX", "BFY"]);
  });

  it("follows the window letter, not the ring setting", () => {
    const settings = m3({ positions: lettersToPositions("ADU"), rings: [5, 9, 17] });
    expect(windowsAfter(settings, 4)).toEqual(["ADV", "AEW", "BFX", "BFY"]);
  });

  it("turns at both notches of a naval rotor", () => {
    const settings = m3({ rotors: ["I", "II", "VI"], positions: lettersToPositions("AAL") });
    expect(windowsAfter(settings, 2)).toEqual(["AAM", "ABN"]);
    const atZ = m3({ rotors: ["I", "II", "VI"], positions: lettersToPositions("AAZ") });
    expect(windowsAfter(atZ, 1)).toEqual(["ABA"]);
  });
});

describe("the signal path", () => {
  it("passes through each component on the way in and back out", () => {
    const { path } = press(DEFAULT_SETTINGS, "A");
    expect(path.map((h) => `${h.stage}:${h.direction}`)).toEqual([
      "plugboard:in",
      "right:in",
      "middle:in",
      "left:in",
      "reflector:turn",
      "left:out",
      "middle:out",
      "right:out",
      "plugboard:out",
    ]);
    for (let i = 1; i < path.length; i++) expect(path[i].from).toBe(path[i - 1].to);
    expect(ALPHABET[path.at(-1)!.to]).toBe("B");
  });
});

describe("validation", () => {
  it("accepts the default machine", () => {
    expect(validate(DEFAULT_SETTINGS)).toEqual([]);
  });

  it("refuses the same rotor twice", () => {
    expect(validate(m3({ rotors: ["I", "I", "II"] }))).not.toEqual([]);
  });

  it("refuses a letter on two plugboard cables", () => {
    expect(validate(m3({ plugboard: ["AB", "AC"] }))).not.toEqual([]);
    expect(validate(m3({ plugboard: ["AA"] }))).not.toEqual([]);
  });

  it("refuses a wide reflector on the M4", () => {
    expect(validate({ ...DEFAULT_SETTINGS, model: "M4" })).not.toEqual([]);
  });

  it("refuses a ring outside A to Z", () => {
    expect(validate(m3({ rings: [26, 0, 0] }))).not.toEqual([]);
    expect(validate(m3({ rings: [-1, 0, 0] }))).not.toEqual([]);
  });

  it("has reflectors that wire every letter in a pair", () => {
    for (const wiring of Object.values(REFLECTORS)) {
      for (let i = 0; i < 26; i++) {
        const partner = ALPHABET.indexOf(wiring[i]);
        expect(partner).not.toBe(i);
        expect(ALPHABET.indexOf(wiring[partner])).toBe(i);
      }
    }
  });
});
