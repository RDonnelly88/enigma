import { DEFAULT_SETTINGS, encipher, type Settings } from "../enigma";
import type { Moment } from "./history";

/** The naval war against the U-boats, as Hut 8 lived it. */
export const ATLANTIC_HISTORY: Moment[] = [
  {
    when: "1939",
    title: "Hut 8",
    text: "Alan Turing takes on the German navy’s [[cipher]], the hardest of them all. Hardly anyone else at Bletchley thinks it can be broken.",
  },
  {
    when: "Mar 1941",
    title: "The Lofoten raid",
    text: "Commandos raiding the Lofoten Islands in Norway seize the armed trawler Krebs. Aboard are spare [[rotor|rotors]] and the February keys.",
  },
  {
    when: "May 1941",
    title: "München and U-110",
    text: "A weather ship is captured on purpose for its June keys. Two days later HMS Bulldog boards U-110 and takes its machine and codebooks.",
  },
  {
    when: "Jun 1941",
    title: "Reading the U-boats",
    text: "With another weather ship’s July keys, Hut 8 is reading U-boat signals, often within hours. [[convoy|Convoys]] are steered round the packs.",
  },
  {
    when: "1 Feb 1942",
    title: "Shark",
    text: "The Atlantic U-boats change to a new key on the four-rotor M4. Bletchley calls it Shark, and can read none of it.",
  },
  {
    when: "30 Oct 1942",
    title: "U-559",
    text: "Off Egypt, two sailors from HMS Petard swim to a sinking U-boat and pass up its codebooks. Both drown when it goes down.",
  },
  {
    when: "13 Dec 1942",
    title: "Shark broken",
    text: "With the captured weather book, Hut 8 reads Shark again after ten months, in time to reroute convoys within days.",
  },
  {
    when: "Summer 1943",
    title: "American Bombes",
    text: "Fast four-rotor [[bombe|Bombes]], built in Dayton, Ohio, and run by the US Navy’s WAVES, take on more and more of the Shark work.",
  },
  {
    when: "May 1943",
    title: "Black May",
    text: "More than forty U-boats are lost in a month. On 24 May Admiral Dönitz pulls his boats out of the North Atlantic.",
  },
];

// The four-rotor machine against the three-rotor one

/** A key on the army's machine, and the same three rotors in a U-boat's M4 with Beta and the thin B reflector. */
export const THREE_ROTOR: Settings = {
  ...DEFAULT_SETTINGS,
  rotors: ["II", "IV", "V"],
  rings: [1, 20, 11],
  positions: [1, 11, 0],
  plugboard: ["AV", "BS", "CG", "DL", "FU", "HZ", "IN", "KM", "OW", "RX"],
};

/** The same key on an M4, with its fourth wheel standing at `fourth`. */
export const fourRotor = (fourth: number): Settings => ({ ...THREE_ROTOR, model: "M4", reflector: "B Thin", greek: "Beta", greekRing: 0, greekPosition: fourth });

/** A U-boat weather report, the kind of message that gave Hut 8 its cribs. */
export const WEATHER_REPORT = "WETTERBERICHTQUADRATAJDREIVIERLUFTDRUCKFALLEND";

/** The same message on both machines, and how many letters come out alike. */
export function twin(text: string, fourth: number) {
  const three = encipher(THREE_ROTOR, text).text;
  const four = encipher(fourRotor(fourth), text).text;
  const same = [...three].filter((c, i) => c === four[i]).length;
  return { three, four, same, identical: same === three.length };
}

// Routing a convoy

export type Year = 1941 | 1942 | 1943;
export const ROUTES = ["north", "centre", "south"] as const;
export type Route = (typeof ROUTES)[number];

/** What the Admiralty could know in each year, and what a convoy faced. */
export const YEARS: Record<Year, { ultra: boolean; packs: number; escorts: boolean; says: string }> = {
  1941: {
    ultra: true,
    packs: 1,
    escorts: false,
    says: "Hut 8 is reading the U-boats’ signals. The tracking room can see where the pack is waiting.",
  },
  1942: {
    ultra: false,
    packs: 2,
    escorts: false,
    says: "Shark is unbroken. There are more U-boats than ever, and the tracking room has only sightings and radio bearings.",
  },
  1943: {
    ultra: true,
    packs: 2,
    escorts: true,
    says: "Shark is being read again, and the escorts now have radar, aircraft overhead and support groups to call on.",
  },
};

/** Where the packs lie for one convoy: fixed for each year and convoy, so every reader meets the same Atlantic. */
export function packsFor(year: Year, convoy: number): Route[] {
  let seed = (year * 7919 + convoy * 104729) % 2147483647;
  const next = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const left = [...ROUTES];
  return Array.from({ length: YEARS[year].packs }, () => left.splice(Math.floor(next() * left.length), 1)[0]);
}

export type Outcome = "clear" | "lost" | "fought-off";

/** What happens to a convoy sent along `route` in `year`. */
export function sail(year: Year, convoy: number, route: Route): Outcome {
  if (!packsFor(year, convoy).includes(route)) return "clear";
  return YEARS[year].escorts ? "fought-off" : "lost";
}
