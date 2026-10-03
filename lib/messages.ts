import { DEFAULT_SETTINGS, encipher, lettersToPositions, type Settings } from "./enigma";

export type Intercept = {
  id: string;
  title: string;
  story: string;
  settings: Settings;
  ciphertext: string;
};

/** Real messages whose keys are known, to decrypt on the machine. */
export const INTERCEPTS: Intercept[] = [
  {
    id: "barbarossa",
    title: "Operation Barbarossa, 1941",
    story:
      "Sent on 7 July 1941 as the German army pushed into the Soviet Union. Rotors II, IV, V, rings B U L, starting at B L A, with ten cables.",
    settings: {
      ...DEFAULT_SETTINGS,
      rotors: ["II", "IV", "V"],
      rings: [1, 20, 11],
      positions: lettersToPositions("BLA"),
      plugboard: ["AV", "BS", "CG", "DL", "FU", "HZ", "IN", "KM", "OW", "RX"],
    },
    ciphertext:
      "EDPUD NRGYS ZRCXN UYTPO MRMBO FKTBZ REZKM LXLVE FGUEY SIOZV EQMIK UBPMM YLKLT TDEIS MDICA GYKUA CTCDO MOHWX MUUIA UBSTS LRNBZ SZWNR FXWFY SSXJZ VIJHI DISHP RKLKA YUPAD TXQSP INQMA TLPIF SVKDA SCTAC DPBOP VHJK",
  },
  {
    id: "u534",
    title: "U-534, 1945",
    story:
      "A four-rotor naval message to the U-boat U-534 in the last days of the war. Thin reflector B, Beta, II, IV, I, with the right ring at V.",
    settings: {
      model: "M4",
      reflector: "B Thin",
      greek: "Beta",
      greekRing: 0,
      greekPosition: 21,
      rotors: ["II", "IV", "I"],
      rings: [0, 0, 21],
      positions: lettersToPositions("JNA"),
      plugboard: ["AT", "BL", "DF", "GJ", "HM", "NW", "OP", "QY", "RZ", "VX"],
    },
    ciphertext:
      "NCZW VUSX PNYM INHZ XMQX SFWX WLKJ AHSH NMCO CCAK UQPM KCSM HKSE INJU SBLK IOSX CKUB HMLL XCSJ USRR DVKO HULX WCCB GVLI YXEO AHXR HKKF VDRE WEZL XOBA FGYU JQUK GRTV UKAM EURB VEKS UHHV OYHA BCJW MAKL FKLM YFVN RIZR VVRT KOFD ANJM OLBG FFLE OPRG TFLV RHOW OPBE KVWM UQFM PWPA RMFH AGKX IIBG",
  },
];

/**
 * A practice intercept for crib dragging. Weather ships sent the same kind of
 * report every day, so "WETTERVORHERSAGE" (weather forecast) was a reliable
 * guess for words somewhere in the message. The key here is the exercise's
 * secret; the page only ever shows the ciphertext.
 */
export const PRACTICE_PLAINTEXT =
  "ANXBEFEHLSHABERXUBOOTEXWETTERVORHERSAGEXBISKAYAXREGENXWINDAUSSUEDWESTXSTAERKEFUENFXSICHTMITTEL";

export const PRACTICE_CRIB = "WETTERVORHERSAGE";

/** What the practice intercept says, in English. */
export const PRACTICE_ENGLISH =
  "To the Commander of U-boats: weather forecast, Bay of Biscay. Rain. Wind from the south-west, force five. Visibility moderate.";

/** The practice intercept's secret key, used only to demonstrate how the Bombe tests a setting. */
export const PRACTICE_KEY: Settings = {
  ...DEFAULT_SETTINGS,
  rotors: ["IV", "II", "V"],
  rings: [6, 21, 15],
  positions: lettersToPositions("RTZ"),
  plugboard: ["AE", "BF", "CM", "DQ", "HU", "JN", "LX", "PR", "SZ", "VW"],
};

/** Where the crib really sits in the practice intercept. */
export const PRACTICE_CRIB_AT = PRACTICE_PLAINTEXT.indexOf("WETTERVORHERSAGE");

export const PRACTICE_CIPHERTEXT = encipher(PRACTICE_KEY, PRACTICE_PLAINTEXT).text;

export type Practice = {
  id: string;
  title: string;
  story: string;
  language: "german" | "english";
  ciphertext: string;
};

/**
 * Intercepts for the codebreaker, each enciphered here from a plaintext and
 * key the page never shows. Six cables is what the Polish codebreakers faced
 * in the early 1930s; ten is what the army used from 1939.
 */
/** The six-cable practice message's key, used to show the plugboard climb on its own. */
export const SIX_CABLE_KEY: Settings = {
  ...DEFAULT_SETTINGS,
  rotors: ["II", "V", "III"],
  rings: [9, 17, 22],
  positions: lettersToPositions("KQM"),
  plugboard: ["AJ", "CP", "GL", "KW", "MY", "RZ"],
};

export const CODEBREAKER_PRACTICE: Practice[] = [
  {
    id: "six-cables",
    title: "Six cables, 1930s",
    story: "An army report from the years when the plugboard carried six cables. Long enough, and plugged lightly enough, for statistics alone.",
    language: "german",
    ciphertext: encipher(
      SIX_CABLE_KEY,
      "ANXDASXOBERKOMMANDOXDERXWEHRMACHTXDIEXUEBUNGXDERXDRITTENXDIVISIONXBEGINNTXAMXMONTAGXUMXSECHSXUHRXDIEXTRUPPENXSAMMELNXSICHXIMXRAUMXNOERDLICHXDERXSTADTXDIEXVERSORGUNGXERFOLGTXUEBERXDENXBAHNHOFXFUNKVERKEHRXNURXNACHXBEFEHLXDERXKOMMANDEURXMELDETXDIEXBEREITSCHAFTXBISXSONNTAGXABENDXENDE",
    ).text,
  },
  {
    id: "ten-cables",
    title: "Ten cables, 1940",
    story: "The same kind of message after the army went to ten cables. Only six letters now pass the plugboard untouched. Try it, and see why Bletchley needed cribs.",
    language: "german",
    ciphertext: encipher(
      {
        ...DEFAULT_SETTINGS,
        rotors: ["IV", "I", "II"],
        rings: [3, 14, 7],
        positions: lettersToPositions("XVB"),
        plugboard: ["AJ", "BW", "CK", "DN", "EV", "FR", "GO", "HP", "LT", "MS"],
      },
      "ANXDIEXHEERESGRUPPEXNORDXDERXANGRIFFXAUFXDIEXSTADTXWIRDXUMXZWEIXTAGEXVERSCHOBENXDIEXPANZERDIVISIONXBLEIBTXINXIHRENXSTELLUNGENXUNDXSICHERTXDIEXBRUECKENXAMXFLUSSXNACHSCHUBXANXMUNITIONXUNDXTREIBSTOFFXISTXDRINGENDXERFORDERLICHXMELDUNGXUEBERXDIEXLAGEXBISXMORGENXFRUEHXERBETENXENDE",
    ).text,
  },
  {
    id: "english",
    title: "Your own message, in English",
    story: "Five cables and plain English. The codebreaker scores English letter pairs instead of German ones.",
    language: "english",
    ciphertext: encipher(
      {
        ...DEFAULT_SETTINGS,
        rotors: ["I", "IV", "V"],
        rings: [12, 5, 19],
        positions: lettersToPositions("HUT"),
        plugboard: ["CE", "GJ", "KP", "MX", "QV"],
      },
      "MEETMEATTHEOLDBRIDGEATMIDNIGHTANDBRINGTHEMAPSWITHYOUTHEGUARDSCHANGEATELEVENSOWEWILLHAVEALMOSTANHOURBEFOREANYONENOTICESTHATWEAREGONEIFYOUARELATEIWILLWAITBYTHECHURCHUNTILONEANDTHENGOONALONETOTHECOASTWHERETHEBOATISWAITING",
    ).text,
  },
];
