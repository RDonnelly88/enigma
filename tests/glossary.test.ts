import { describe, expect, it } from "vitest";
import { TERMS, findTerm, searchTerms } from "@/lib/glossary";

describe("the glossary", () => {
  it("gives every term its own id, and every cross-reference lands on a term", () => {
    expect(new Set(TERMS.map((t) => t.id)).size).toBe(TERMS.length);
    for (const t of TERMS) for (const id of t.related) expect(findTerm(id), `${t.id} → ${id}`).toBeDefined();
  });

  it("is in alphabetical order", () => {
    const names = TERMS.map((t) => t.term.toLowerCase());
    expect(names).toEqual([...names].sort());
  });

  it("finds a term by its other names as well as its own", () => {
    expect(searchTerms("Steckerbrett")[0].id).toBe("plugboard");
    expect(searchTerms("deciph")[0].id).toBe("decryption");
    expect(searchTerms("rot")[0].id).toBe("rotor");
    expect(searchTerms("")).toHaveLength(TERMS.length);
    expect(searchTerms("zzzz")).toHaveLength(0);
  });
});
