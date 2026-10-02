import { describe, expect, it } from "vitest";
import { keyspace, plugboardWays, roughly } from "@/lib/keyspace";

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
