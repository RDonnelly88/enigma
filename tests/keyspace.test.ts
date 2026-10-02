import { describe, expect, it } from "vitest";
import { duration, keyspace, plugboardWays, roughly } from "@/lib/keyspace";

describe("the key space", () => {
  it("counts plugboard arrangements", () => {
    expect(plugboardWays(0)).toBe(1n);
    expect(plugboardWays(1)).toBe(325n);
    expect(plugboardWays(10)).toBe(150_738_274_937_250n);
  });

  it("gives the famous figure for the army machine", () => {
    // Five rotors, three fitted, ten cables
    expect(keyspace({ box: 5, cables: 10 })).toBe(158_962_555_217_826_360_000n);
    expect(roughly(keyspace({ box: 5, cables: 10 }))).toBe("about 159 quintillion");
  });

  it("reads small numbers as they are", () => {
    expect(roughly(325n)).toBe("325");
    expect(roughly(1_054_560n)).toBe("about 1 million");
  });
});

describe("brute force", () => {
  it("would take millions of years for the army machine, not the age of the universe", () => {
    const years = keyspace({ box: 5, cables: 10 }) / 1_000_000n / 31_557_600n;
    expect(roughly(years)).toBe("about 5 million");
  });
});

describe("the plugboard's peak", () => {
  it("allows the most arrangements with eleven cables, and fewer with thirteen than with nine", () => {
    const ways = Array.from({ length: 14 }, (_, n) => plugboardWays(n));
    expect(ways.indexOf(ways.reduce((a, b) => (b > a ? b : a)))).toBe(11);
    expect(ways[13] < ways[9]).toBe(true);
  });

  it("multiplies the keys by about a hundred billion with six cables", () => {
    expect(roughly(plugboardWays(6))).toBe("about 100 billion");
  });
});

describe("reading out a brute-force time", () => {
  it("picks a sensible unit, singular when it should be", () => {
    expect(duration(0n)).toBe("under a second");
    expect(duration(1n)).toBe("1 second");
    expect(duration(90n)).toBe("1 minute");
    expect(duration(86_400n * 3n)).toBe("3 days");
    expect(duration(31_557_600n * 5_000_000n)).toBe("about 5 million years");
  });
});
