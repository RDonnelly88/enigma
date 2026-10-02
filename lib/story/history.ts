/** Moments in the machine's life, in order, for the timeline rail. */
export type Moment = { when: string; title: string; text: string };

export const MACHINE_HISTORY: Moment[] = [
  {
    when: "1918",
    title: "A patent",
    text: "Arthur Scherbius, a German engineer, patents a cipher machine built on wired wheels that turn as you type.",
  },
  {
    when: "1923",
    title: "On sale",
    text: "Enigma goes on the market for banks and businesses. Few buy it; the machine is heavy and expensive.",
  },
  {
    when: "1926",
    title: "The navy",
    text: "The German navy adopts its own version. The army follows in 1928.",
  },
  {
    when: "Late 1920s",
    title: "The reflector",
    text: "A fixed wheel sends the current back through the rotors, so the same settings both encipher and decipher. It also means no letter can ever become itself.",
  },
  {
    when: "1930",
    title: "The plugboard",
    text: "The army's Enigma I adds cables that swap pairs of letters. Six cables multiply the number of possible settings by about a hundred billion.",
  },
  {
    when: "1938",
    title: "Five rotors",
    text: "Rotors IV and V join the box. Operators now fit three of five, in any of 60 orders.",
  },
  {
    when: "1939",
    title: "Ten cables",
    text: "The plugboard carries up to ten cables, the setting that became standard for the rest of the war.",
  },
  {
    when: "1942",
    title: "A fourth rotor",
    text: "On 1 February the U-boats in the Atlantic switch to the four-rotor M4. Bletchley Park loses their traffic for most of the year.",
  },
  {
    when: "1974",
    title: "The secret is out",
    text: "F. W. Winterbotham's The Ultra Secret tells the public that Bletchley Park had been reading Enigma. The Polish part of the story had appeared in France a year earlier.",
  },
];

/** Where the machine, and the people using it, gave the codebreakers a way in. */
export const WEAKNESSES: Moment[] = [
  {
    when: "The machine",
    title: "No letter becomes itself",
    text: "The reflector means a letter is never enciphered as itself. Slide a guessed word along a message, and anywhere a letter would land on itself, the guess can't be there.",
  },
  {
    when: "1930 – 1940",
    title: "The doubled key",
    text: "Each message key was typed twice at the head of the message, so every indicator hid the same letter three places apart. That repetition was what the Polish codebreakers first broke.",
  },
  {
    when: "Every day",
    title: "Predictable messages",
    text: "Weather reports, routine returns, “nothing to report”, the same addresses and sign-offs. A word you can guess is a crib, and cribs were what the Bombe ran on.",
  },
  {
    when: "Habit",
    title: "Lazy keys",
    text: "Tired operators picked message keys like AAA or three letters in a row on the keyboard. Bletchley called them cillies, and learnt to expect them.",
  },
  {
    when: "Habit",
    title: "The same text twice",
    text: "A message sent on a broken network and again on an unbroken one handed over a perfect crib. Naval weather reports, also sent in a weaker cipher, were one way in to the four-rotor U-boat traffic.",
  },
  {
    when: "1941 – 1942",
    title: "Captured papers",
    text: "Key lists and codebooks taken from captured ships and U-boats, among them U-110 in May 1941 and U-559 in October 1942, opened up naval traffic that statistics alone could not.",
  },
  {
    when: "The rules",
    title: "Rules that narrowed the search",
    text: "Some key lists followed rules meant to look random: no rotor in the same place two days running, no cable joining neighbouring letters. Each rule shrank the number of keys left to try.",
  },
];
