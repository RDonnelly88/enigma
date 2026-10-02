/**
 * How many ways the machine could be set, as an operator chose them. Ring
 * settings are left out, as they usually are: they mostly shift what the
 * windows show rather than adding new scrambles.
 */

const factorial = (n: number) => {
  let f = 1n;
  for (let i = 2n; i <= BigInt(n); i++) f *= i;
  return f;
};

/** Ways to place n cables on 26 sockets: 26! / ((26 - 2n)! n! 2^n). */
export function plugboardWays(cables: number) {
  return factorial(26) / (factorial(26 - 2 * cables) * factorial(cables) * 2n ** BigInt(cables));
}

/** Ordered choices of three rotors from a box of `box`. */
export function rotorOrders(box: number) {
  return BigInt(box * (box - 1) * (box - 2));
}

export function keyspace({ box, cables }: { box: number; cables: number }) {
  return rotorOrders(box) * 26n ** 3n * plugboardWays(cables);
}

/** 158,962,555,217,826,360,000 as "about 159 quintillion". */
export function roughly(n: bigint) {
  const names = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion"];
  const digits = n.toString().length;
  const group = Math.min(Math.floor((digits - 1) / 3), names.length - 1);
  if (group === 0) return n.toString();
  const scaled = Number(n / 10n ** BigInt(group * 3 - 3)) / 1000;
  return `about ${Math.round(scaled).toLocaleString("en-GB")} ${names[group]}`;
}

const SECONDS_PER_YEAR = 31_557_600n;

const count = (n: bigint, unit: string) => `${n.toLocaleString("en-GB")} ${unit}${n === 1n ? "" : "s"}`;

/** A duration in seconds, in whichever unit reads best. */
export function duration(seconds: bigint) {
  if (seconds < 1n) return "under a second";
  if (seconds < 60n) return count(seconds, "second");
  if (seconds < 3600n) return count(seconds / 60n, "minute");
  if (seconds < 86_400n) return count(seconds / 3600n, "hour");
  if (seconds < SECONDS_PER_YEAR) return count(seconds / 86_400n, "day");
  const years = seconds / SECONDS_PER_YEAR;
  return years < 1000n ? count(years, "year") : `${roughly(years)} years`;
}
