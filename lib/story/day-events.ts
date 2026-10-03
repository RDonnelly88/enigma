/**
 * The day, event by event, on two sides: the German signals unit and the
 * British codebreakers. Times are illustrative; what happens at each is how
 * the work was really done.
 */
export type Lane = "german" | "allied";

export type Artefact =
  | "key-sheet"
  | "weather-plain"
  | "encipher"
  | "transmit"
  | "intercept"
  | "registry"
  | "crib"
  | "menu"
  | "bombe"
  | "decrypt"
  | "hut3"
  | "order"
  | "order-read"
  | "ultra"
  | null;

export type DayEvent = { id: string; time: number; lane: Lane; title: string; text: string; artefact: Artefact };

const at = (h: number, m = 0) => h * 60 + m;

export const DAY_EVENTS: DayEvent[] = [
  {
    id: "midnight",
    time: at(0),
    lane: "german",
    title: "Midnight: a new key",
    text: "At a Luftwaffe signals post in northern France, the duty operator opens the machine, fits today’s three rotors in order, turns each ring to its number and plugs ten cables, all from the month’s key sheet. Every Enigma on the network does the same.",
    artefact: "key-sheet",
  },
  {
    id: "weather",
    time: at(5, 45),
    lane: "german",
    title: "The dawn weather report",
    text: "The meteorological officer hands over the morning forecast, as he does every morning, in the same words and the same order.",
    artefact: "weather-plain",
  },
  {
    id: "encipher",
    time: at(5, 55),
    lane: "german",
    title: "Enciphering",
    text: "The operator picks three letters at random as a starting point and sends them in the clear. From there he enciphers a message key of his own choosing, once, then turns the rotors to it and types the report while his partner writes down the lamps.",
    artefact: "encipher",
  },
  {
    id: "transmit",
    time: at(6),
    lane: "german",
    title: "On the air",
    text: "The radio operator sends it in Morse: a preamble with the time, the number of letters and the indicator, then the ciphertext in groups of five. Anyone listening on the frequency can hear it.",
    artefact: "transmit",
  },
  {
    id: "intercept",
    time: at(6, 1),
    lane: "allied",
    title: "Intercepted",
    text: "At RAF Chicksands in Bedfordshire, a listening station, an operator with headphones writes every group onto a message form, noting the time, the frequency and the call sign. Hundreds of messages a day come in like this.",
    artefact: "intercept",
  },
  {
    id: "registry",
    time: at(6, 40),
    lane: "allied",
    title: "To Bletchley Park",
    text: "The forms go to Bletchley by teleprinter and motorcycle. In Hut 6’s registration room, call signs and frequencies identify the network: Red, the Luftwaffe’s general key, broken most days since 1940.",
    artefact: "registry",
  },
  {
    id: "crib",
    time: at(8, 30),
    lane: "allied",
    title: "A crib",
    text: "Hut 6 knows this station. It sends a weather report at dawn every day, and it always begins the same way. That guessed opening is the crib, and the reflector’s flaw says where it can and can’t sit.",
    artefact: "crib",
  },
  {
    id: "menu",
    time: at(9, 15),
    lane: "allied",
    title: "The menu",
    text: "A cryptanalyst draws the menu: each crib letter joined to the cipher letter it became, labelled with its place in the message. The loops in it are what will make the Bombe’s test sharp.",
    artefact: "menu",
  },
  {
    id: "bombe",
    time: at(10),
    lane: "allied",
    title: "The Bombes run",
    text: "The menu goes by teleprinter to a Bombe outstation. Wrens wire a Bombe to match it, load the drums for one rotor order, and start it. It runs through every rotor position, testing the loop at each, and stops wherever the test holds.",
    artefact: "bombe",
  },
  {
    id: "decrypt",
    time: at(11, 20),
    lane: "allied",
    title: "A stop that reads",
    text: "Each stop is tried on a checking machine, a British Typex adapted to work like an Enigma. Most stops are false. This one turns the indicator into a message key, and the message into German.",
    artefact: "decrypt",
  },
  {
    id: "broken",
    time: at(11, 45),
    lane: "allied",
    title: "Red is broken for the day",
    text: "With the day’s rotors, rings and plugs known, every message on Red until midnight can be read as fast as it arrives, the same way its intended recipients read it.",
    artefact: null,
  },
  {
    id: "hut3",
    time: at(12, 30),
    lane: "allied",
    title: "Hut 3",
    text: "Translators and intelligence officers in Hut 3 turn the German into reports. A weather forecast tells the RAF what the Luftwaffe expects over the Channel.",
    artefact: "hut3",
  },
  {
    id: "order",
    time: at(14),
    lane: "german",
    title: "An order",
    text: "An operational order goes out on the same key: a bomber wing is to attack a convoy this afternoon.",
    artefact: "order",
  },
  {
    id: "order-read",
    time: at(14, 25),
    lane: "allied",
    title: "Read within the hour",
    text: "Intercepted at 14:00, deciphered on the day’s key as soon as it reaches Hut 6. No crib, no Bombe: the key is already known.",
    artefact: "order-read",
  },
  {
    id: "ultra",
    time: at(14, 50),
    lane: "allied",
    title: "Ultra",
    text: "The warning goes to commanders through special liaison units, under the codeword Ultra. To protect the source, a reconnaissance aircraft is often sent to be seen, so any surprise looks like it came from luck or a sighting.",
    artefact: "ultra",
  },
  {
    id: "attack",
    time: at(16),
    lane: "german",
    title: "The attack",
    text: "The bombers find the convoy’s fighter escort strengthened and waiting. A spotter plane was seen over the convoy earlier; that, the unit concludes, is how they knew.",
    artefact: null,
  },
  {
    id: "night",
    time: at(23, 50),
    lane: "german",
    title: "Midnight again",
    text: "The day’s key is finished with. At midnight the operator sets up tomorrow’s, confident, as his superiors are, that what he sends cannot be read.",
    artefact: null,
  },
  {
    id: "night-allied",
    time: at(23, 55),
    lane: "allied",
    title: "And again tomorrow",
    text: "At midnight the key changes and Hut 6 starts again from nothing, with tomorrow’s dawn weather report as its first crib.",
    artefact: null,
  },
];
