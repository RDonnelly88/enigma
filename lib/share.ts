import { ALPHABET, DEFAULT_SETTINGS, GREEK_ROTORS, REFLECTORS, ROTORS, validate, type GreekName, type ReflectorName, type RotorName, type Settings } from "./enigma";

/**
 * A link that opens the machine set to a key with a message ready to type,
 * so a broken key can be checked on the machine itself.
 */
export function machineLink(settings: Settings, text: string) {
  const params = new URLSearchParams({ key: JSON.stringify(settings), text });
  return `/machine?${params}`;
}

export function readMachineLink(search: string): { settings: Settings; text: string } | null {
  const params = new URLSearchParams(search);
  const raw = params.get("key");
  if (!raw) return null;
  try {
    const settings = JSON.parse(raw) as Settings;
    // Anything arriving in a URL could be anything; the machine only takes what it can run
    if (!settings || !Array.isArray(settings.rotors) || validate(settings).length > 0) return null;
    return { settings, text: params.get("text") ?? "" };
  } catch {
    return null;
  }
}

/** A name as it may appear on a message: short, and only words. */
const name = (raw: string | null) => (raw ?? "").replace(/[^\p{L}\p{N} '-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 24);

/**
 * A link carrying only the ciphertext: the key has to reach its recipient some
 * other way. Who it's from and for travel in the clear, as the address on a
 * real signal did.
 */
export function secretLink(ciphertext: string, { from = "", to = "" }: { from?: string; to?: string } = {}) {
  const params = new URLSearchParams({ cipher: ciphertext });
  if (name(from)) params.set("from", name(from));
  if (name(to)) params.set("to", name(to));
  return `/machine?${params}`;
}

/** Who a secret is from and for, where the link says. */
export function readAddress(search: string) {
  const params = new URLSearchParams(search);
  return { from: name(params.get("from")), to: name(params.get("to")) };
}

export function readSecret(search: string) {
  const cipher = new URLSearchParams(search).get("cipher")?.toUpperCase().replace(/[^A-Z]/g, "");
  return cipher || null;
}

const letters = (ns: number[]) => ns.map((n) => ALPHABET[n]).join("");

/**
 * The key as something you could read down a phone: reflector, rotors left to
 * right, rings, start positions and cables, separated by dots. A four-rotor
 * key lists the greek wheel first, with its ring and start.
 * "B · II IV V · BUL · BLA · AV BS CG"
 */
export function keyCode(s: Settings) {
  const m4 = s.model === "M4";
  const rotors = m4 ? [s.greek, ...s.rotors] : s.rotors;
  const rings = m4 ? [s.greekRing, ...s.rings] : s.rings;
  const start = m4 ? [s.greekPosition, ...s.positions] : s.positions;
  return [s.reflector, rotors.join(" "), letters(rings), letters(start), s.plugboard.join(" ") || "no cables"].join(" · ");
}

/** Reads a key code back into settings, or null if it isn't one the machine can run. */
export function readKeyCode(code: string): Settings | null {
  const parts = code.split("·").map((p) => p.trim());
  if (parts.length !== 5) return null;
  const [reflectorText, rotorList, rings, start, cables] = parts;
  // Typed by hand, so match names whatever their case
  const find = <T extends string>(names: readonly T[], text: string) => names.find((n) => n.toLowerCase() === text.toLowerCase());
  const reflector = find(Object.keys(REFLECTORS) as ReflectorName[], reflectorText.replace(/\s+/g, " "));
  const names = rotorList.split(/\s+/).map((n, i, all) =>
    all.length === 4 && i === 0 ? (find(Object.keys(GREEK_ROTORS), n) ?? n) : n.toUpperCase(),
  );
  const m4 = names.length === 4;
  if (!reflector || (names.length !== 3 && !m4)) return null;
  const nums = (t: string) => t.toUpperCase().split("").map((c) => ALPHABET.indexOf(c));
  const ringNums = nums(rings);
  const startNums = nums(start);
  if (ringNums.length !== names.length || startNums.length !== names.length) return null;
  const wheels = (m4 ? names.slice(1) : names) as RotorName[];
  if (wheels.some((w) => !(w in ROTORS)) || (m4 && !(names[0] in GREEK_ROTORS))) return null;
  const [r, p] = m4 ? [ringNums.slice(1), startNums.slice(1)] : [ringNums, startNums];
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    model: m4 ? "M4" : "M3",
    reflector,
    greek: m4 ? (names[0] as GreekName) : DEFAULT_SETTINGS.greek,
    greekRing: m4 ? ringNums[0] : 0,
    greekPosition: m4 ? startNums[0] : 0,
    rotors: wheels as Settings["rotors"],
    rings: r as Settings["rings"],
    positions: p as Settings["positions"],
    plugboard: /^no cables$/i.test(cables) ? [] : cables.toUpperCase().split(/\s+/).filter(Boolean),
  };
  return validate(settings).length === 0 ? settings : null;
}

/**
 * A fresh key of the kind the army used: reflector B, three different rotors
 * of the five, any rings and start, and ten cables.
 */
export function randomKey(random: () => number = Math.random): Settings {
  const pick = <T>(from: T[]) => from.splice(Math.floor(random() * from.length), 1)[0];
  const wheels: RotorName[] = ["I", "II", "III", "IV", "V"];
  const letters = [...ALPHABET];
  const cables = Array.from({ length: 10 }, () => [pick(letters), pick(letters)].sort().join(""));
  const any = () => Math.floor(random() * 26);
  return {
    ...DEFAULT_SETTINGS,
    rotors: [pick(wheels), pick(wheels), pick(wheels)],
    rings: [any(), any(), any()],
    positions: [any(), any(), any()],
    plugboard: cables.sort(),
  };
}
