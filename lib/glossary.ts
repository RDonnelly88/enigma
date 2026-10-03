/**
 * The words the site leans on, each with a one-line meaning a younger reader
 * can follow, a little more for anyone who wants it, a picture to play with
 * where one helps, and the place on the site where the idea is shown at work.
 */

export type Visual = "shift" | "lamp" | "rotor" | "reflector" | "plug" | "crib" | "bombe" | "freq" | "morse";

export type Term = {
  id: string;
  term: string;
  /** Other names the same idea goes by, shown under the term and matched by search. */
  aka?: string[];
  says: string;
  more: string;
  visual?: Visual;
  see: { href: string; label: string };
  related: string[];
};

export const TERMS: Term[] = [
  {
    id: "bombe",
    term: "Bombe",
    says: "An electrical machine that raced through rotor settings, throwing out every one that couldn’t fit a crib.",
    more: "Designed by Alan Turing and improved by Gordon Welchman, it never read a message. It ruled out wrong settings so fast that the few left could be tried by hand. Hundreds were built, most of them run by Wrens.",
    visual: "bombe",
    see: { href: "/crib#bombe", label: "Step through the Bombe" },
    related: ["crib", "menu", "cryptanalysis"],
  },
  {
    id: "cipher",
    term: "Cipher",
    says: "A set of rules for scrambling each letter of a message, so it reads as nonsense.",
    more: "A cipher works on letters, not meanings. The simplest moves every letter the same number of places along the alphabet. Enigma changed its scramble with every key press.",
    visual: "shift",
    see: { href: "/#how", label: "Why a simple cipher fails" },
    related: ["code", "key", "encryption"],
  },
  {
    id: "ciphertext",
    term: "Ciphertext",
    says: "The scrambled message: what is sent over the radio, and what an enemy hears.",
    more: "Enigma ciphertext went out in groups of five letters, so even the length of the words was hidden.",
    visual: "lamp",
    see: { href: "/#used", label: "Sending a message" },
    related: ["plaintext", "encryption", "decryption"],
  },
  {
    id: "code",
    term: "Code",
    says: "Swapping whole words for code words or numbers from a codebook.",
    more: "A code needs a book both sides share, and a captured book gives everything away. People say ‘code’ for any secret writing, and Bletchley was a codebreaking centre, but strictly speaking Enigma was a cipher.",
    see: { href: "/#what", label: "What Enigma was" },
    related: ["cipher", "cryptography"],
  },
  {
    id: "crib",
    term: "Crib",
    says: "A word you guess is in the message, like the German for weather forecast.",
    more: "Because no letter can become itself on Enigma, a crib can’t sit anywhere one of its letters would land on the same letter. Every attack at Bletchley started with one.",
    visual: "crib",
    see: { href: "/crib#cribs", label: "Drag a crib yourself" },
    related: ["menu", "bombe", "reflector"],
  },
  {
    id: "cryptanalysis",
    term: "Cryptanalysis",
    aka: ["Codebreaking"],
    says: "Breaking ciphers and codes without being given the key.",
    more: "What Rejewski, Turing and everyone at Bletchley Park did. Cribs, the Bombe and the codebreaker’s statistics are all cryptanalysis.",
    visual: "freq",
    see: { href: "/crib", label: "Cribs & the Bombe" },
    related: ["cryptography", "crib", "frequency-analysis"],
  },
  {
    id: "cryptography",
    term: "Cryptography",
    says: "The art of writing secrets so only the right people can read them.",
    more: "From the Greek kryptos, hidden, and graphein, to write. Enigma was a tool of cryptography; breaking it was cryptanalysis.",
    visual: "lamp",
    see: { href: "/#what", label: "What Enigma was" },
    related: ["cryptanalysis", "cipher", "key"],
  },
  {
    id: "decryption",
    term: "Decryption",
    aka: ["Deciphering"],
    says: "Turning ciphertext back into the real message, using the key.",
    more: "On Enigma, decrypting is the same as encrypting: set the same key, type the ciphertext, and the message lights up on the lamps. The reflector makes that work.",
    visual: "lamp",
    see: { href: "/#used", label: "Receiving a message" },
    related: ["encryption", "key", "reflector"],
  },
  {
    id: "double-step",
    term: "Double step",
    says: "A quirk of Enigma’s gears: the middle rotor sometimes turns on two key presses in a row.",
    more: "When the middle rotor reaches its own notch, it pushes itself and the left rotor on at the next key press. So the rotors don’t quite count like a mileometer, and the machine repeats after 16,900 presses, not 17,576.",
    visual: "rotor",
    see: { href: "/#how", label: "Watch the rotors step" },
    related: ["rotor", "message-key"],
  },
  {
    id: "encryption",
    term: "Encryption",
    aka: ["Enciphering"],
    says: "Turning a message into ciphertext so it can’t be read on the way.",
    more: "The sending operator typed the message and a second operator wrote down each lamp as it lit. That was encryption, done one letter at a time by hand.",
    visual: "shift",
    see: { href: "/#used", label: "Sending a message" },
    related: ["decryption", "plaintext", "ciphertext"],
  },
  {
    id: "frequency-analysis",
    term: "Frequency analysis",
    says: "Counting how often each letter appears. In a simple cipher, the commonest letter is probably E.",
    more: "Known for over a thousand years, it breaks any cipher that always swaps a letter for the same one. Enigma’s turning rotors were built to defeat it.",
    visual: "freq",
    see: { href: "/#how", label: "Why a simple swap fails" },
    related: ["cipher", "index-of-coincidence"],
  },
  {
    id: "hill-climbing",
    term: "Hill climbing",
    says: "Making small changes one at a time, and keeping each one that makes things better.",
    more: "The codebreaker page finds the plugboard this way: try a cable, keep it if the text looks more like German, and repeat until nothing helps.",
    see: { href: "/codebreaker#climb", label: "Watch a climb" },
    related: ["index-of-coincidence", "plugboard"],
  },
  {
    id: "hut-6",
    term: "Hut 6",
    aka: ["Hut 8", "Hut 3"],
    says: "The team at Bletchley Park that broke the army and air force’s Enigma. Hut 8 broke the navy’s.",
    more: "The huts were wooden buildings in the grounds. Hut 3 turned Hut 6’s decrypts into intelligence; Hut 4 did the same for Hut 8.",
    see: { href: "/crib#bletchley", label: "Bletchley Park" },
    related: ["ultra", "bombe"],
  },
  {
    id: "index-of-coincidence",
    term: "Index of coincidence",
    says: "One number that says how lumpy the letter counts are: high for a real language, low for random letters.",
    more: "It is the chance that two letters picked at random from the text are the same. Nearly right Enigma settings leave text a little lumpier than random, which is how a computer spots them.",
    visual: "freq",
    see: { href: "/codebreaker#ioc", label: "Try the index" },
    related: ["frequency-analysis", "hill-climbing"],
  },
  {
    id: "indicator",
    term: "Indicator",
    says: "The letters at the start of a message that told the receiver its message key, themselves enciphered.",
    more: "Until May 1940 the army’s indicator was the message key typed twice: six letters. That repetition was what the Polish codebreakers broke.",
    see: { href: "/#used", label: "Sending and receiving" },
    related: ["message-key", "key-sheet"],
  },
  {
    id: "key",
    term: "Key",
    says: "The secret settings both sides need. Without the key, the ciphertext can’t be read.",
    more: "An Enigma key was the rotors and their order, the ring settings, the plug cables and the starting positions. The army’s changed every day at midnight.",
    visual: "shift",
    see: { href: "/#used", label: "A month of keys" },
    related: ["key-sheet", "message-key", "cipher"],
  },
  {
    id: "key-sheet",
    term: "Key sheet",
    says: "A printed list of a whole month’s keys, one line per day.",
    more: "The most closely guarded paper in the system. A captured machine showed how Enigma worked; a captured key sheet let an enemy read a network for a month.",
    see: { href: "/#used", label: "A month of keys" },
    related: ["key", "indicator"],
  },
  {
    id: "menu",
    term: "Menu",
    says: "A drawing of a crib, joining each guessed letter to the cipher letter it became.",
    more: "The Bombe was wired to match it. Loops in the menu are what let the Bombe throw out a wrong setting on its own.",
    see: { href: "/crib#bombe", label: "See a menu" },
    related: ["crib", "bombe"],
  },
  {
    id: "message-key",
    term: "Message key",
    says: "Three letters an operator chose for each message, telling the rotors where to start.",
    more: "So that no two messages started from the same place. It was sent enciphered at the head of the message, as the indicator.",
    visual: "rotor",
    see: { href: "/#used", label: "Sending a message" },
    related: ["indicator", "key", "rotor"],
  },
  {
    id: "morse",
    term: "Morse code",
    says: "Letters sent as short and long beeps, dots and dashes, over the radio.",
    more: "Enigma ciphertext was tapped out in Morse, which is how listening stations in Britain could write it all down.",
    visual: "morse",
    see: { href: "/machine?lesson=transmit", label: "Send one yourself" },
    related: ["ciphertext"],
  },
  {
    id: "plaintext",
    term: "Plaintext",
    says: "The message as it was written, before it is scrambled.",
    more: "Operators typed X for a space, so ANGRIFF IM MORGENGRAUEN went in as ANGRIFFXIMXMORGENGRAUEN.",
    visual: "lamp",
    see: { href: "/#what", label: "The machine typing an order" },
    related: ["ciphertext", "encryption"],
  },
  {
    id: "plugboard",
    term: "Plugboard",
    aka: ["Steckerbrett"],
    says: "Cables on the front of the machine that swap pairs of letters, once on the way in and once on the way out.",
    more: "Ten cables gave about 151 million million ways to plug the board, and it was rewired every day.",
    visual: "plug",
    see: { href: "/#how", label: "Add cables" },
    related: ["key", "rotor"],
  },
  {
    id: "reflector",
    term: "Reflector",
    says: "A fixed wheel that sends the current back through the rotors.",
    more: "It made the same settings both lock and unlock a message. It also meant no letter could ever become itself, the flaw that let codebreakers place their cribs.",
    visual: "reflector",
    see: { href: "/#how", label: "Pick a letter" },
    related: ["rotor", "crib", "decryption"],
  },
  {
    id: "ring-setting",
    term: "Ring setting",
    aka: ["Ringstellung"],
    says: "A movable alphabet ring on each rotor, shifting its wiring against the letters you see in the window.",
    more: "It also moved where the rotor’s notch sat, so it changed when the next rotor turned. It was part of each day’s key.",
    visual: "rotor",
    see: { href: "/machine", label: "Set the rings on the machine" },
    related: ["rotor", "key"],
  },
  {
    id: "rotor",
    term: "Rotor",
    aka: ["Wheel", "Walze"],
    says: "A wheel with 26 contacts on each side, wired inside so every letter comes out as a different one. It turns with each key press.",
    more: "Enigma used three side by side, chosen from five, each scrambling what the last one handed it. The navy’s four-rotor machine added a fourth.",
    visual: "rotor",
    see: { href: "/#how", label: "Turn a rotor" },
    related: ["double-step", "ring-setting", "reflector"],
  },
  {
    id: "ultra",
    term: "Ultra",
    says: "The codename for intelligence from broken Enigma messages, and the secret around it.",
    more: "Ultra reached commanders through special liaison units, and its source was hidden with care: a spotter plane might be sent so the enemy thought they had been seen, not read.",
    see: { href: "/day", label: "A day in 1941" },
    related: ["hut-6", "cryptanalysis"],
  },
];

export const findTerm = (id: string) => TERMS.find((t) => t.id === id);

/** Search over terms, other names and meanings, best matches first. */
export function searchTerms(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return TERMS;
  const score = (t: Term) =>
    t.term.toLowerCase().startsWith(q) ? 0 : (t.aka ?? []).some((a) => a.toLowerCase().includes(q)) || t.term.toLowerCase().includes(q) ? 1 : t.says.toLowerCase().includes(q) ? 2 : 3;
  return TERMS.filter((t) => score(t) < 3).sort((a, b) => score(a) - score(b) || a.term.localeCompare(b.term));
}
