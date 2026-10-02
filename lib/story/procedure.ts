import { encipher, lettersToPositions } from "../enigma";
import { settingsFor, type DailyKey } from "./keysheet";

/**
 * Sending a message the 1930s way. The operator picks three letters as the
 * message key, sets the rotors to the day's basic setting and types the key
 * twice, to guard against a garble in transmission. The six letters that light
 * go at the head of the message. Then the rotors go to the message key itself
 * and the message is typed.
 *
 * Typing the key twice was the flaw: the first and fourth letters, second and
 * fifth, third and sixth, were the same letter enciphered three places apart,
 * on every message of the day.
 */
export function sendMessage(key: DailyKey, messageKey: string, text: string) {
  const indicator = encipher(settingsFor(key, key.basic), messageKey + messageKey).text;
  const body = encipher(settingsFor(key, lettersToPositions(messageKey)), text).text;
  return { indicator, body };
}

/** The receiving end: recover the message key from the indicator, then read the message. */
export function receiveMessage(key: DailyKey, indicator: string, body: string) {
  const doubled = encipher(settingsFor(key, key.basic), indicator).text;
  const messageKey = doubled.slice(0, 3);
  return { doubled, messageKey, text: encipher(settingsFor(key, lettersToPositions(messageKey)), body).text };
}
