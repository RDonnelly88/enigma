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

const ENTRIES: Term[] = [
  {
    id: "hut-8",
    term: "Hut 8",
    aka: ["Hut 4"],
    says: "The team at Bletchley Park that broke the German navy’s Enigma, led at first by Alan Turing.",
    more: "The navy’s procedures were the hardest of all, and Hut 8 often depended on codebooks captured at sea. Hut 4 turned its decrypts into intelligence for the Admiralty.",
    see: { href: "/atlantic#navy", label: "The navy’s Enigma" },
    related: ["hut-6", "shark", "pinch"],
  },
  {
    id: "convoy",
    term: "Convoy",
    says: "Merchant ships crossing the sea together, guarded by warships, instead of sailing alone.",
    more: "Britain depended on convoys from North America for food, fuel and weapons. Steering them away from waiting U-boats was the most valuable use of naval Ultra.",
    see: { href: "/atlantic#blackout", label: "Route a convoy" },
    related: ["u-boat", "wolfpack", "ultra"],
  },
  {
    id: "u-boat",
    term: "U-boat",
    aka: ["Unterseeboot"],
    says: "A German submarine. In both world wars U-boats tried to starve Britain by sinking the ships that supplied it.",
    more: "U-boats spent most of their time on the surface and were directed by radio from headquarters ashore, so they sent and received a great deal of Enigma traffic.",
    see: { href: "/atlantic", label: "The U-boat war" },
    related: ["wolfpack", "convoy", "shark"],
  },
  {
    id: "wolfpack",
    term: "Wolfpack",
    aka: ["Rudeltaktik"],
    says: "A group of U-boats spread across a convoy’s path, called together by radio to attack it at once.",
    more: "The first boat to sight a convoy shadowed it and radioed headquarters, which sent the others in. All that radio traffic was the pack’s weakness.",
    see: { href: "/atlantic#lifeline", label: "The lifeline" },
    related: ["u-boat", "convoy"],
  },
  {
    id: "shark",
    term: "Shark",
    aka: ["Triton", "M4", "four-rotor Enigma"],
    says: "Bletchley’s name for the key used by Atlantic U-boats on the four-rotor M4 Enigma from February 1942.",
    more: "The fourth wheel made the machine 26 times harder for the Bombes, and for ten months Shark could not be read at all. Captured weather codebooks broke it in December 1942.",
    see: { href: "/atlantic#shark", label: "The fourth wheel" },
    related: ["hut-8", "rotor", "pinch"],
  },
  {
    id: "pinch",
    term: "Pinch",
    says: "A capture of Enigma keys, codebooks or machines from a ship or U-boat, planned or lucky.",
    more: "Pinches gave Hut 8 the keys or cribs it could not get any other way. Each one was kept secret, so the Germans would not change their codes.",
    see: { href: "/atlantic#pinches", label: "Pinches" },
    related: ["hut-8", "shark", "code"],
  },
  {
    id: "basic-setting",
    term: "Basic setting",
    aka: ["Grundstellung"],
    says: "Where everyone on a network turned their rotors before typing a message key, printed on the key sheet for each day.",
    more: "Because every operator started the day’s message keys from the same place, the indicators of a whole day could be compared, which is what the Polish codebreakers did.",
    see: { href: "/#used", label: "A month of keys" },
    related: ["indicator", "message-key", "key-sheet"],
  },
  {
    id: "bombe",
    term: "Bombe",
    says: "An electrical machine that raced through rotor settings, throwing out every one that couldn’t fit a crib.",
    more: "Designed by Alan Turing and improved by Gordon Welchman, it never read a message. It ruled out wrong settings so fast that the few left could be tried by hand. Hundreds were built, most of them run by Wrens.",
    visual: "bombe",
    see: { href: "/crib#bombe", label: "Step through the Bombe" },
    related: ["drum", "menu", "stop", "crib"],
  },
  {
    id: "checking-machine",
    term: "Checking machine",
    says: "A machine set up like an Enigma, used at Bletchley to test each Bombe stop on the real message.",
    more: "Most stops were false. On the checking machine a false stop gave gibberish, and the true one began to give German, which let the rest of the plugboard be worked out by hand. Many were British Typex machines adapted to work like an Enigma.",
    see: { href: "/crib#bombe", label: "Read the message" },
    related: ["stop", "bombe"],
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
    see: { href: "/crib", label: "Breaking Enigma" },
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
    term: "Deciphering",
    aka: ["Decryption", "Decrypting"],
    says: "Turning ciphertext back into the real message, using the key. Also called decryption.",
    more: "On Enigma, deciphering is the same as enciphering: set the same key, type the ciphertext, and the message lights up on the lamps. The reflector makes that work. At Bletchley a broken message was called a decrypt.",
    visual: "lamp",
    see: { href: "/#used", label: "Receiving a message" },
    related: ["encryption", "key", "reflector"],
  },
  {
    id: "drum",
    term: "Drum",
    says: "One of the Bombe’s spinning wheels. Each drum was wired like an Enigma rotor, so three drums together copied one Enigma’s rotors.",
    more: "A Bombe carried dozens of drums in rows, one set of three for each link of the menu. They turned together like rotors stepping, so the machine could test every rotor position in turn.",
    visual: "bombe",
    see: { href: "/crib#bombe", label: "Be the Bombe" },
    related: ["bombe", "rotor", "menu"],
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
    term: "Enciphering",
    aka: ["Encryption", "Encrypting"],
    says: "Turning a message into ciphertext so it can’t be read on the way. Also called encryption.",
    more: "The sending operator typed the message and a second operator wrote down each lamp as it lit. That was enciphering, done one letter at a time by hand.",
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
    more: "The site’s computer codebreaker finds the plugboard this way: try a cable, keep it if the text looks more like German, and repeat until nothing helps.",
    see: { href: "/codebreaker#climb", label: "Watch a climb" },
    related: ["index-of-coincidence", "plugboard"],
  },
  {
    id: "hut-6",
    term: "Hut 6",
    aka: ["Hut 3"],
    says: "The team at Bletchley Park that broke the army and air force’s Enigma. Hut 8 broke the navy’s.",
    more: "The huts were wooden buildings in the grounds. Hut 3 turned Hut 6’s decrypts into intelligence; Hut 4 did the same for Hut 8.",
    see: { href: "/crib#bletchley", label: "Bletchley Park" },
    related: ["ultra", "bombe", "hut-8"],
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
    id: "loop",
    term: "Loop",
    says: "A circle in a crib’s menu: letters that lead from one to the next and back to the start, like E to Q, Q to T, T to E.",
    more: "A loop is what lets the Bombe test a guess against itself. Follow a guessed plug all the way round, and at a wrong rotor position it comes back as a different letter.",
    see: { href: "/crib#bombe", label: "Be the Bombe" },
    related: ["menu", "crib", "bombe"],
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
    id: "stop",
    term: "Stop",
    says: "A rotor position where the Bombe couldn’t rule out every guess, so it halted to have it checked.",
    more: "A stop gave the rotor positions and at least one plugboard cable. Many were false and were thrown out on the checking machine; the true one gave the day’s key.",
    see: { href: "/crib#bombe", label: "Be the Bombe" },
    related: ["bombe", "checking-machine", "drum"],
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

/** In alphabetical order, as the panel lists them. */
export const TERMS = ENTRIES.sort((a, b) => a.term.localeCompare(b.term));

export const findTerm = (id: string) => TERMS.find((t) => t.id === id);

/** Search over terms, other names and meanings, best matches first. */
export function searchTerms(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return TERMS;
  const score = (t: Term) =>
    t.term.toLowerCase().startsWith(q) ? 0 : (t.aka ?? []).some((a) => a.toLowerCase().includes(q)) || t.term.toLowerCase().includes(q) ? 1 : t.says.toLowerCase().includes(q) ? 2 : 3;
  return TERMS.filter((t) => score(t) < 3).sort((a, b) => score(a) - score(b) || a.term.localeCompare(b.term));
}

/**
 * Text kept outside a component, like a lesson or a day's event, marks its
 * glossary words as [[id|shown words]], or [[id]] to show the term itself.
 */
const GLOSS = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;


/**
 * The words that mark each term in running text, for underlining the first
 * mention in a block automatically. Words with an everyday meaning too (key,
 * code, stop) are left out and marked by hand where they mean the term.
 */
const FORMS: [string, RegExp][] = [
  ["index-of-coincidence", /\bindex of coincidence\b/i],
  ["frequency-analysis", /\b(frequency analysis|letter counting|counting letters)\b/i],
  ["hill-climbing", /\bhill climbing\b/i],
  ["checking-machine", /\bchecking machines?\b/i],
  ["basic-setting", /\b(basic setting|Grundstellung)\b/i],
  ["message-key", /\bmessage keys?\b/i],
  ["key-sheet", /\bkey sheets?\b/i],
  ["double-step", /\bdouble step\b/i],
  ["ring-setting", /\b(ring settings?|Ringstellung)\b/i],
  ["ciphertext", /\bciphertexts?\b/i],
  ["plaintext", /\bplaintext\b/i],
  ["cryptanalysis", /\b(cryptanalysis|codebreaking)\b/i],
  ["cryptography", /\bcryptography\b/i],
  ["encryption", /\b(encipher(s|ed|ing)?|encrypt(s|ed|ing|ion)?)\b/i],
  ["decryption", /\b(decipher(s|ed|ing)?|decrypt(ed|ing|ion)?)\b/i],
  ["cipher", /\bciphers?\b/i],
  ["code", /\bcodebooks?\b/i],
  ["plugboard", /\b(plugboard|Steckerbrett)\b/i],
  ["reflector", /\breflector\b/i],
  ["rotor", /\brotors?\b/i],
  ["indicator", /\bindicators?\b/i],
  ["crib", /\bcribs?\b/i],
  ["menu", /\bmenus?\b/i],
  ["loop", /\bloops?\b/i],
  ["drum", /\bdrums?\b/i],
  ["bombe", /\bBombes?\b/],
  ["hut-6", /\bHut [36]\b/],
  ["hut-8", /\bHut [48]\b/],
  ["u-boat", /\bU-boats?\b/],
  ["wolfpack", /\bwolf ?packs?\b/i],
  ["convoy", /\bconvoys?\b/i],
  ["shark", /\bShark\b/],
  ["pinch", /\bpinch(es)?\b/i],
  ["ultra", /\bUltra\b/],
  ["morse", /\bMorse\b/],
];

export type Piece = string | { id: string; text: string };

/**
 * Splits running text into plain pieces and glossary terms: anything marked
 * [[id|words]], and the first mention of each other term not yet in `seen`.
 * `seen` carries over between pieces of the same block, so a term is
 * underlined once per block however the text is split.
 */
export function gloss(text: string, seen: Set<string>): Piece[] {
  const spans: { start: number; end: number; id: string; text: string }[] = [];
  for (const m of text.matchAll(GLOSS)) {
    spans.push({ start: m.index, end: m.index + m[0].length, id: m[1], text: m[2] ?? findTerm(m[1])?.term.toLowerCase() ?? m[1] });
  }
  const free = (start: number, end: number) => spans.every((s) => end <= s.start || start >= s.end);
  for (const [id, form] of FORMS) {
    if (seen.has(id) || spans.some((s) => s.id === id)) continue;
    const re = new RegExp(form.source, form.flags.includes("g") ? form.flags : form.flags + "g");
    for (const m of text.matchAll(re)) {
      if (free(m.index, m.index + m[0].length)) {
        spans.push({ start: m.index, end: m.index + m[0].length, id, text: m[0] });
        break;
      }
    }
  }
  spans.sort((a, b) => a.start - b.start);
  const pieces: Piece[] = [];
  let at = 0;
  for (const s of spans) {
    if (s.start > at) pieces.push(text.slice(at, s.start));
    // A marked term already shown in this block is shown as plain words
    pieces.push(seen.has(s.id) ? s.text : { id: s.id, text: s.text });
    seen.add(s.id);
    at = s.end;
  }
  if (at < text.length) pieces.push(text.slice(at));
  return pieces;
}
