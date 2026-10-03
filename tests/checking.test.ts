import { describe, expect, it } from "vitest";
import { PRACTICE_PLAINTEXT } from "@/lib/messages";
import { DISCOVERY, FIRST_PAIR, LOOP, SCAN, TRUE_RIGHT, partialRead } from "@/lib/story/checking";

describe("from Bombe stop to German", () => {
  it("stops at the true setting with the true pair among the survivors", () => {
    expect(SCAN[TRUE_RIGHT].stops.length).toBeGreaterThan(0);
    expect(FIRST_PAIR).toHaveLength(2);
    // The survivors are partners for the loop's first letter; the true partner is among them
    const partner = FIRST_PAIR.replace(LOOP[0].a, "");
    expect(SCAN[TRUE_RIGHT].stops).toContain(partner);
  });

  it("reads more of the message with every pair found, and all of it at the end", () => {
    const reads = DISCOVERY.map((_, n) => partialRead(DISCOVERY.slice(0, n + 1)));
    expect(reads[0].correct).toBeGreaterThan(partialRead([]).correct);
    expect(reads.at(-1)!.text).toBe(PRACTICE_PLAINTEXT);
    for (let i = 1; i < reads.length; i++) expect(reads[i].correct).toBeGreaterThanOrEqual(reads[i - 1].correct);
  });

  it("turns out gibberish at a false stop", () => {
    const falseStop = SCAN.find((s) => s.right !== TRUE_RIGHT && s.stops.length > 0)!;
    const read = partialRead([FIRST_PAIR], falseStop.right);
    expect(read.correct / read.total).toBeLessThan(0.25);
  });
});
