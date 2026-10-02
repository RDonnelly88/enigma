import { DEFAULT_SETTINGS, lettersToPositions, type Settings } from "./enigma";

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
