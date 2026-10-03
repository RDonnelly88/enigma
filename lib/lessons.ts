import { ALPHABET, DEFAULT_SETTINGS, lettersToPositions, type Keypress, type Settings } from "./enigma";
import { INTERCEPTS } from "./messages";

/** What a lesson can see of the machine. */
export type Snapshot = {
  settings: Settings;
  input: string;
  output: string;
  last: Keypress | null;
  previous: { input: string; output: string } | null;
  doubleSteps: number;
  transmitted: boolean;
  shared: boolean;
};

export type Lesson = {
  id: string;
  title: string;
  /** What to do, in a sentence or two. */
  task: string;
  /** What it shows, revealed once done. */
  lesson: (s: Snapshot) => string;
  done: (s: Snapshot) => boolean;
  /** Settings to put the machine in first, with an empty tape, for lessons that need a particular start. */
  setup?: Settings;
  learnMore: { href: string; label: string };
};

const barbarossa = INTERCEPTS.find((i) => i.id === "barbarossa")!;
const u534 = INTERCEPTS.find((i) => i.id === "u534")!;

/** The last few lit letters, for quoting the visitor's own tape back to them. */
const tail = (s: Snapshot, n: number) => s.output.slice(-n).split("").join(" ");

/**
 * Signals school: a run of short tasks on the real machine, each checked live
 * from its state, each showing one thing about how Enigma works.
 */
export const LESSONS: Lesson[] = [
  {
    id: "first-key",
    title: "Press a key",
    task: "Click a key on the machine, or type a letter on your own keyboard.",
    lesson: (s) =>
      `${s.input ? `${s.input[0]} lit ${s.output[0]}. ` : ""}That lamp is the ciphertext. An operator's partner wrote down each lamp as it lit, and that is what went out over the radio.`,
    done: (s) => s.input.length >= 1,
    learnMore: { href: "/#what", label: "What Enigma was" },
  },
  {
    id: "new-letter",
    title: "Same key, different lamp",
    task: "Press A five times in a row.",
    lesson: (s) =>
      `${/A{5}$/.test(s.input) ? `Five As lit ${tail(s, 5)}. ` : ""}Before each letter the right-hand rotor turns one place, so the same key goes through different wiring every time. Counting letters, the oldest way to break a cipher, gets you nowhere.`,
    done: (s) => /A{5}$/.test(s.input),
    learnMore: { href: "/#how", label: "How the rotors scramble" },
  },
  {
    id: "never-itself",
    title: "A letter is never itself",
    task: "Type the whole alphabet, A to Z.",
    lesson: () =>
      "Not one letter lit its own lamp, and it never will. The reflector sends the current back by a different wire every time. That single flaw is what the crib dragger and Turing's Bombe were built on.",
    done: (s) => s.input.includes(ALPHABET),
    learnMore: { href: "/crib#cribs", label: "How codebreakers used it" },
  },
  {
    id: "read-back",
    title: "Read it back",
    task: "Type a word, press Rewind on the tape, then type the letters that lit.",
    lesson: (s) =>
      `${s.previous && s.input ? `${s.input} turned back into ${s.output}. ` : ""}The same settings that encipher also decipher, so the receiving operator just typed the ciphertext into an identically set machine.`,
    done: (s) =>
      !!s.previous && s.input.length >= 4 && s.previous.output.startsWith(s.input) && s.previous.input.startsWith(s.output),
    learnMore: { href: "/#how", label: "Why the reflector makes it reversible" },
  },
  {
    id: "set-rotors",
    title: "Set the rotors",
    task: "Turn the rotor windows to B L A, using the thumbwheels or their arrows.",
    lesson: () =>
      "Where the rotors start is part of the key. Each message began at its own start position, so even with the same day's settings, no two messages were enciphered alike.",
    done: (s) => s.settings.positions.join() === lettersToPositions("BLA").join(),
    learnMore: { href: "/#used", label: "How operators set up" },
  },
  {
    id: "double-step",
    title: "Catch the double step",
    task: "With the rotors set to A D U, press three keys and watch the middle window.",
    setup: { ...DEFAULT_SETTINGS, positions: lettersToPositions("ADU") },
    lesson: () =>
      "The middle rotor moved on two key presses running, and took the left one with it. It's a quirk of the stepping mechanism, and it means the rotors come round again after 16,900 letters, not 17,576.",
    done: (s) => s.doubleSteps >= 1,
    learnMore: { href: "/#how", label: "Three rotors, stepping" },
  },
  {
    id: "plug",
    title: "Plug in a cable",
    task: "On the plugboard, tap two letters to join them, then press one of them on the keyboard.",
    lesson: (s) => {
      const swaps = s.last?.path.filter((h) => h.stage === "plugboard" && h.from !== h.to) ?? [];
      const said = swaps
        .map((h) => `${ALPHABET[h.from]} became ${ALPHABET[h.to]} ${h.direction === "in" ? "on the way into the rotors" : "on the way back out"}`)
        .join(", and ");
      return `${said ? `${said[0].toUpperCase()}${said.slice(1)}. ` : ""}Each cable swaps a pair of letters on the way in and again on the way out. Ten cables multiply the number of keys by 150 trillion.`;
    },
    done: (s) => !!s.last?.path.some((h) => h.stage === "plugboard" && h.from !== h.to),
    learnMore: { href: "/#how", label: "The plugboard" },
  },
  {
    id: "barbarossa",
    title: "Decrypt a real message",
    task: "Set the machine to the key from 7 July 1941, then type in the intercepted message, or paste it into the tape.",
    setup: barbarossa.settings,
    lesson: () =>
      "AUFKL ABTEILUNG VON KURTINOWA… A German reconnaissance unit reporting its advance into the Soviet Union, read on the same machine, with the same key, as its intended recipient.",
    done: (s) => s.output.includes("AUFKLXABTEILUNG"),
    learnMore: { href: "/#used", label: "How messages were sent" },
  },
  {
    id: "navy",
    title: "The navy's fourth rotor",
    task: "Switch to the four-rotor M4 with the key sent to U-534 in 1945, and type in its message.",
    setup: u534.settings,
    lesson: () =>
      "VON VON… The M4 squeezed a fourth wheel beside a thinner reflector. When the U-boats switched to it in 1942, Bletchley Park was locked out of their traffic for most of a year.",
    done: (s) => s.output.includes("VONVONJLOOKS"),
    learnMore: { href: "/crib#bletchley", label: "The naval war" },
  },
  {
    id: "transmit",
    title: "Send it in Morse",
    task: "Type a message, open Messages, and press Transmit.",
    lesson: () =>
      "Enigma only enciphered; a radio operator sent the result by hand in Morse, usually in groups of five letters. Every listening station in range heard it, friend and enemy alike.",
    done: (s) => s.transmitted,
    learnMore: { href: "/#used", label: "Two operators and a radio" },
  },
  {
    id: "share",
    title: "Send a secret",
    task: "Encipher a message and, in Messages, copy a link to the ciphertext and its key code to send to a friend.",
    lesson: () =>
      "Your friend needs both: the ciphertext, which anyone may see, and the key, which only they should have. That split, a public message and a private key sent another way, is what all of cryptography still rests on.",
    done: (s) => s.shared,
    learnMore: { href: "/#strong", label: "Why the key mattered" },
  },
];
