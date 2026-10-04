/**
 * ASDIC, the escorts' sonar, as a game: a U-boat hidden somewhere round the
 * ship, a beam that can be trained on any bearing, and an echo that comes back
 * only from where the U-boat is.
 */

/** Half the width of the beam, in degrees: a ping hears anything this close to where it points. */
export const BEAM = 12;
/** Sound in seawater, metres a second. */
const SOUND = 1500;
const YARD = 0.9144;
/** Inside this range the beam passes over a deep U-boat and contact is lost, which is why escorts lost it in the last moments of an attack. */
const TOO_CLOSE = 300;

export type Hunt = { bearing: number; range: number; closing: boolean };

/** Where the U-boat lies for one hunt: fixed for each hunt number, so every reader can be given the same one. */
export function hunt(n: number): Hunt {
  let seed = (n * 7919 + 104729) % 2147483647;
  const next = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  return { bearing: Math.floor(next() * 72) * 5, range: 700 + Math.round(next() * 18) * 100, closing: next() < 0.5 };
}

/** The difference between two bearings, either way round, 0 to 180. */
export const apart = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

export type Echo = { range: number; after: number; shift: number };

/**
 * A ping on a bearing: an echo if the U-boat is in the beam, with the seconds it
 * takes to come back and its change of note, up if the U-boat is closing.
 */
export function ping(h: Hunt, bearing: number): Echo | null {
  if (apart(h.bearing, bearing) > BEAM || h.range < TOO_CLOSE) return null;
  return { range: h.range, after: (2 * h.range * YARD) / SOUND, shift: h.closing ? 0.03 : -0.03 };
}

/** The U-boat between pings: closing or opening the range, and creeping round a little. */
export function move(h: Hunt, n: number): Hunt {
  const drift = ((n * 37) % 3) - 1;
  return { ...h, bearing: (h.bearing + drift * 2 + 360) % 360, range: Math.max(100, h.range + (h.closing ? -100 : 100)) };
}

const POINTS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];

/** What Ultra could tell an escort: not where the U-boat is, only roughly which way to look. */
export const sector = (bearing: number) => POINTS[Math.round(bearing / 45) % 8];
