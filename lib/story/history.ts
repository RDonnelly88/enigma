/** The little pictures a timeline card can carry, like the picture on a cigarette card. */
export type VignetteId =
  | "patent"
  | "shop"
  | "anchor"
  | "reflector"
  | "plugs"
  | "rotors"
  | "fourth"
  | "book"
  | "lecture"
  | "maths"
  | "catalogue"
  | "bomba"
  | "forest"
  | "mansion"
  | "bombe"
  | "uboat"
  | "convoy"
  | "computer"
  | "hut"
  | "raid"
  | "plane";

/** Moments in the machine's life, in order, for the timeline rail, each with a picture where one fits. */
export type Moment = { when: string; title: string; text: string; art?: VignetteId };

export const MACHINE_HISTORY: Moment[] = [
  {
    when: "1918",
    title: "A patent",
    art: "patent",
    text: "Arthur Scherbius, a German engineer, patents a cipher machine built on wired wheels that turn as you type.",
  },
  {
    when: "1923",
    title: "On sale",
    art: "shop",
    text: "Enigma goes on the market for banks and businesses. Few buy it; the machine is heavy and expensive.",
  },
  {
    when: "1926",
    title: "The navy",
    art: "anchor",
    text: "The German navy adopts its own version. The army follows in 1928.",
  },
  {
    when: "Mid-1920s",
    title: "The reflector",
    art: "reflector",
    text: "A fixed wheel sends the current back through the rotors, so the same settings both encipher and decipher. It also means no letter can ever become itself.",
  },
  {
    when: "1930",
    title: "The plugboard",
    art: "plugs",
    text: "The army’s Enigma I adds cables that swap pairs of letters. Six cables multiply the number of possible settings by about a hundred billion.",
  },
  {
    when: "1938",
    title: "Five rotors",
    art: "rotors",
    text: "Rotors IV and V join the box. Operators now fit three of five, in any of 60 orders.",
  },
  {
    when: "1939",
    title: "Ten cables",
    art: "plugs",
    text: "The plugboard carries up to ten cables, the setting that became standard for the rest of the war.",
  },
  {
    when: "1942",
    title: "A fourth rotor",
    art: "fourth",
    text: "On 1 February the U-boats in the Atlantic switch to the four-rotor M4. Bletchley Park loses their traffic for most of the year.",
  },
  {
    when: "1974",
    title: "The secret is out",
    art: "book",
    text: "F. W. Winterbotham’s The Ultra Secret tells the public that Bletchley Park had been reading Enigma. The Polish part of the story had appeared in France a year earlier.",
  },
];

/** Where the machine, and the people using it, gave the codebreakers a way in. */
export const WEAKNESSES: Moment[] = [
  {
    when: "The machine",
    title: "No letter becomes itself",
    text: "The reflector means a letter is never enciphered as itself. Slide a guessed word along a message, and anywhere a letter would land on itself, the guess can’t be there.",
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
    text: "Key sheets and codebooks taken from captured ships and U-boats, among them U-110 in May 1941 and U-559 in October 1942, opened up naval traffic that statistics alone could not.",
  },
  {
    when: "The rules",
    title: "Rules that narrowed the search",
    text: "Some key sheets followed rules meant to look random: no rotor in the same place two days running, no cable joining neighbouring letters. Each rule shrank the number of keys left to try.",
  },
];

/** How Enigma was broken by hand, from Poznań to Bletchley. */
export const BREAKING_HISTORY: Moment[] = [
  {
    when: "1929",
    title: "A cryptology course",
    art: "lecture",
    text: "Poland’s Cipher Bureau runs a secret course for mathematics students at Poznań University. Three of them, Marian Rejewski, Jerzy Różycki and Henryk Zygalski, are taken on.",
  },
  {
    when: "1932",
    title: "The wiring, from mathematics",
    art: "maths",
    text: "Rejewski works out the wiring of the army’s rotors using the theory of permutations, helped by settings that French intelligence had bought from a German in the cipher office.",
  },
  {
    when: "Mid-1930s",
    title: "A catalogue of fingerprints",
    art: "catalogue",
    text: "With a device called the cyclometer, the Poles catalogue the indicator cycle lengths of every rotor order and position. Most days' keys can now be looked up.",
  },
  {
    when: "1938",
    title: "Bomby and sheets",
    art: "bomba",
    text: "A change of procedure breaks the catalogue. The Poles answer with the bomba, an electrical machine, and with Zygalski’s perforated sheets. Then rotors IV and V arrive and the work multiplies tenfold.",
  },
  {
    when: "July 1939",
    title: "Pyry",
    art: "forest",
    text: "Five weeks before the invasion, at a forest site near Warsaw, the Poles show British and French codebreakers everything, and give each a replica Enigma.",
  },
  {
    when: "1939",
    title: "Bletchley Park",
    art: "mansion",
    text: "Britain’s codebreakers move to a country house in Buckinghamshire. By the end of the war nearly ten thousand people work there, around three quarters of them women.",
  },
  {
    when: "1940",
    title: "The Bombe",
    art: "bombe",
    text: "Alan Turing’s Bombe goes into service in March, testing rotor settings against a crib. Gordon Welchman’s diagonal board makes it far more powerful by the summer.",
  },
  {
    when: "1941",
    title: "Naval Enigma",
    art: "uboat",
    text: "Captured material, including papers from U-110 in May, lets Turing’s Hut 8 read the navy’s traffic, and convoys are routed around the U-boat packs.",
  },
  {
    when: "1942",
    title: "Blackout, and back",
    art: "fourth",
    text: "From February the four-rotor M4 shuts Bletchley out of U-boat traffic. In October sailors recover papers from the sinking U-559, two of them drowning; by December the traffic is being read again.",
  },
  {
    when: "1943",
    title: "American Bombes",
    art: "bombe",
    text: "The US Navy’s own high-speed Bombes come into service, taking on much of the four-rotor work. Britain and America between them build hundreds of machines.",
  },
];

/** Breaking Enigma by computer, long after the war. */
export const COMPUTER_HISTORY: Moment[] = [
  {
    when: "1995",
    title: "Ciphertext alone",
    art: "computer",
    text: "James Gillogly shows that a home computer can recover an Enigma key from nothing but the ciphertext, using the index of coincidence and hill climbing.",
  },
  {
    when: "2005",
    title: "Unread wartime messages",
    art: "computer",
    text: "Geoff Sullivan and Frode Weierud refine the method and use it on real German army traffic from the war.",
  },
  {
    when: "2006",
    title: "The M4 Project",
    art: "computer",
    text: "Volunteers' computers, coordinated over the internet, break four-rotor naval messages intercepted in 1942 that had gone unbroken since the war.",
  },
  {
    when: "2017",
    title: "Shorter and shorter",
    art: "computer",
    text: "Olaf Ostwald and Frode Weierud publish refinements that break much shorter messages, with heavier plugboards, than the early methods could.",
  },
];
