import { describe, expect, it } from "vitest";
import { PRACTICE_PLAINTEXT } from "@/lib/messages";
import { DISCOVERY, FIRST_PAIR, FROM_STOP, LOOP, SCAN, TRUE_RIGHT, partialRead, testStop } from "@/lib/story/checking";
import { PRACTICE_KEY } from "@/lib/messages";

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

  it("throws out every false stop on test, and the true one hands over real plugs", () => {
    for (const s of SCAN.filter((s) => s.stops.length > 0)) expect(testStop(s.right).holds).toBe(s.right === TRUE_RIGHT);
    expect(FROM_STOP.length).toBeGreaterThan(1);
    for (const pair of FROM_STOP) expect(PRACTICE_KEY.plugboard).toContain(pair);
    expect(partialRead(FROM_STOP).correct / partialRead([]).total).toBeGreaterThan(0.5);
  });

  it("names the clash that sinks a false stop", () => {
    const falseStop = SCAN.find((s) => s.right !== TRUE_RIGHT && s.stops.length > 0)!;
    for (const { check } of testStop(falseStop.right).tried) {
      expect(check.clash).not.toBeNull();
      expect(check.clash!.plugs[0]).not.toBe(check.clash!.plugs[1]);
    }
  });
});
