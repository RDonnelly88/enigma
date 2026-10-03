import { DEFAULT_SETTINGS, encipher, lettersToPositions, type Settings } from "./enigma";
import { keyCode, machineLink } from "./share";

export type Question = {
  question: string;
  options: string[];
  /** Which option is right. */
  answer: number;
  /** Shown once answered, right or wrong. */
  why: string;
  learnMore: { href: string; label: string };
};

/**
 * The codebreaker's test: one question for each idea the site teaches, every
 * one answerable from the "in short" summaries alone.
 */
export const QUESTIONS: Question[] = [
  {
    question: "An operator presses a key on Enigma. What happens?",
    options: ["The letter is printed on paper", "A different letter lights up on a lamp", "The letter is sent straight out by radio", "The machine beeps it in Morse"],
    answer: 1,
    why: "Enigma had no printer. A lamp lit the enciphered letter and a second operator wrote it down.",
    learnMore: { href: "/#what", label: "What Enigma was" },
  },
  {
    question: "Why did the rotors turn with every key press?",
    options: ["To keep the wiring cool", "To count how many letters were typed", "So the same letter came out differently each time", "To wind the machine's clock"],
    answer: 2,
    why: "With the rotors turning, pressing E twice gives two different letters, so counting letters gets a codebreaker nowhere.",
    learnMore: { href: "/#how", label: "How the rotors scramble" },
  },
  {
    question: "Which letter could an E never be enciphered as?",
    options: ["Q", "X", "Any letter at all", "E"],
    answer: 3,
    why: "The reflector meant no letter could ever turn into itself, a small flaw the codebreakers used again and again.",
    learnMore: { href: "/#how", label: "The reflector" },
  },
  {
    question: "What did the plugboard on the front of the machine do?",
    options: ["Swapped pairs of letters with cables", "Powered the lamps", "Connected the machine to the radio", "Stored the day's settings"],
    answer: 0,
    why: "Each cable swapped two letters, on the way in and on the way out, multiplying the number of possible settings enormously.",
    learnMore: { href: "/#how", label: "The plugboard" },
  },
  {
    question: "Until May 1940, what mistake did army operators make at the start of every message?",
    options: ["They sent the message without enciphering it", "They typed the message key twice", "They signed it with their own name", "They used the same settings all month"],
    answer: 1,
    why: "Typing the key twice meant the first and fourth letters of every indicator hid the same letter, which is how the Poles got in.",
    learnMore: { href: "/#used", label: "Sending a message" },
  },
  {
    question: "Who first broke Enigma, and when?",
    options: ["Bletchley Park, in 1940", "American engineers, in 1943", "Polish mathematicians, in 1932", "A German spy, in 1938"],
    answer: 2,
    why: "Marian Rejewski worked out the army's rotor wiring in 1932, seven years before the war began.",
    learnMore: { href: "/crib#poland", label: "Poland, 1932" },
  },
  {
    question: "What is a crib?",
    options: ["A word you guess is in the message", "The stand a Bombe sat on", "A captured list of settings", "A message sent twice"],
    answer: 0,
    why: "Weather reports began with the same words every day. A guess like that is a crib, and every attack at Bletchley started with one.",
    learnMore: { href: "/crib#cribs", label: "Cribs" },
  },
  {
    question: "What did the Bombe actually do?",
    options: ["Read messages out in German", "Guessed cribs by itself", "Ruled out wrong settings until only a few were left", "Jammed German radios"],
    answer: 2,
    why: "The Bombe never read a message. It threw out impossible settings so fast that the few left could be tried by hand.",
    learnMore: { href: "/crib#bombe", label: "The Bombe" },
  },
  {
    question: "Warned by Ultra of an attack, why might the British first send a spotter plane over the convoy?",
    options: ["To take photographs for the newspapers", "So the Germans would think they had been spotted, not read", "To drop supplies to the ships", "To test the radio"],
    answer: 1,
    why: "If the Germans had suspected Enigma was broken, they would have changed it. A plane that was seen gave them another explanation.",
    learnMore: { href: "/day", label: "A day in 1941" },
  },
  {
    question: "How can a computer break an Enigma message today with no crib at all?",
    options: ["It tries every possible key one by one", "It measures how much the letters look like real language", "It can't: it still needs a crib", "It looks the answer up"],
    answer: 1,
    why: "Nearly right settings leave text that is a little like German. A computer can measure that and climb towards the answer.",
    learnMore: { href: "/codebreaker#ioc", label: "Telling nearly right from wrong" },
  },
];

export const PASS_MARK = 7;

/** The title on the certificate, by score; below the pass mark there is no certificate. */
export function rank(score: number) {
  if (score >= QUESTIONS.length) return "Head of Hut";
  if (score >= 8) return "Cryptanalyst";
  if (score >= PASS_MARK) return "Codebreaker";
  return null;
}

export const score = (answers: (number | null)[]) => answers.filter((a, i) => a === QUESTIONS[i].answer).length;

/** The key every certificate's name is enciphered on, printed on the certificate so anyone can check it. */
export const CERTIFICATE_KEY: Settings = { ...DEFAULT_SETTINGS, rotors: ["II", "IV", "V"], positions: lettersToPositions("BLQ"), plugboard: ["AV", "BS", "CG", "DL", "FU", "HZ"] };

/** The name as Enigma would have sent it, with a link that types it back into the machine. */
export function enciphered(name: string) {
  const letters = name.toUpperCase().replace(/[^A-Z ]/g, "").trim().replace(/\s+/g, "X");
  const text = encipher(CERTIFICATE_KEY, letters).text;
  return { text, key: keyCode(CERTIFICATE_KEY), link: machineLink(CERTIFICATE_KEY, text) };
}
