import { menu, loops, placements, type Link } from "../crib";
import { ALPHABET, encipher, lettersToPositions, type Settings } from "../enigma";
import { findLoop, survivors } from "./bombe";
import { keySheet, settingsFor, type DailyKey } from "./keysheet";

/**
 * One day in 1941, reconstructed: a Luftwaffe unit's dawn weather report and
 * an afternoon order, sent on the day's key, intercepted, and broken at
 * Bletchley Park. The people and messages are invented; the procedures,
 * and every ciphertext, crib, menu, stop and decrypt shown, are real
 * computations on the machine.
 */

/** From May 1940: the operator picks a start in the clear and enciphers the message key once from it. */
function sendWithIndicator(key: DailyKey, start: string, messageKey: string, text: string) {
  const enciphered = encipher(settingsFor(key, lettersToPositions(start)), messageKey).text;
  const body = encipher(settingsFor(key, lettersToPositions(messageKey)), text).text;
  return { start, enciphered, body };
}

function readWithIndicator(key: DailyKey, start: string, enciphered: string, body: string) {
  const messageKey = encipher(settingsFor(key, lettersToPositions(start)), enciphered).text;
  return { messageKey, text: encipher(settingsFor(key, lettersToPositions(messageKey)), body).text };
}

export const DAY_KEY = keySheet(31, 1941)[7];

export const WEATHER = {
  plain: "WETTERVORHERSAGEXFUERXDENXKANALXBEWOELKTXSICHTXZEHNXKILOMETERXWINDXWESTXSTAERKEXVIERXAMXNACHMITTAGXREGENSCHAUER",
  english: "Weather forecast for the Channel: overcast, visibility ten kilometres, wind west force four, rain showers in the afternoon.",
  start: "WZA",
  messageKey: "SXT",
};

export const ORDER = {
  plain: "ANXKAMPFGESCHWADERXZWEIXANGRIFFXAUFXGELEITZUGXIMXQUADRATXSIEBENXVIERXUMXSECHZEHNXUHR",
  english: "To Bomber Wing 2: attack the convoy in square seven four at 16:00.",
  start: "PLQ",
  messageKey: "KMB",
};

export const CRIB = "WETTERVORHERSAGE";

export type DayData = ReturnType<typeof buildDay>;

export function buildDay() {
  const weather = sendWithIndicator(DAY_KEY, WEATHER.start, WEATHER.messageKey, WEATHER.plain);
  const order = sendWithIndicator(DAY_KEY, ORDER.start, ORDER.messageKey, ORDER.plain);
  const crib = placements(weather.body, CRIB);
  const links: Link[] = menu(weather.body, CRIB, 0);
  const loop = findLoop(links);
  // The rotors as the weather report began, which is what the Bombe hunted for
  const truth: Settings = settingsFor(DAY_KEY, lettersToPositions(WEATHER.messageKey));
  // Run the right rotor through all 26 places with the rest as they were, and note where the loop holds
  const scan = ALPHABET.split("").map((_, r) => {
    const at: Settings = { ...truth, positions: [truth.positions[0], truth.positions[1], r] };
    return { position: r, stops: loop ? survivors(at, loop) : [] };
  });
  return {
    weather,
    order,
    crib,
    cribSurvivors: crib.filter((p) => p.clashes.length === 0).length,
    links,
    loopCount: loops(links),
    loop,
    scan,
    truePosition: truth.positions[2],
    readWeather: readWithIndicator(DAY_KEY, weather.start, weather.enciphered, weather.body),
    readOrder: readWithIndicator(DAY_KEY, order.start, order.enciphered, order.body),
  };
}
