/**
 * Crib dragging: sliding a guessed piece of plaintext along a ciphertext to
 * find where it could sit. Enigma never encrypts a letter as itself, so any
 * position where a crib letter lines up with the same ciphertext letter is
 * ruled out without touching a machine.
 */

export function onlyLetters(text: string) {
  return text.toUpperCase().replace(/[^A-Z]/g, "");
}

export type Placement = {
  offset: number;
  /** Indexes into the crib where a letter meets itself, ruling the offset out. */
  clashes: number[];
};

export function placements(ciphertext: string, crib: string): Placement[] {
  const c = onlyLetters(ciphertext);
  const p = onlyLetters(crib);
  if (p.length === 0 || p.length > c.length) return [];
  return Array.from({ length: c.length - p.length + 1 }, (_, offset) => ({
    offset,
    clashes: [...p].flatMap((letter, i) => (c[offset + i] === letter ? [i] : [])),
  }));
}

/**
 * The Bombe's menu for a crib at one offset: each crib letter is joined to
 * the ciphertext letter beneath it, labelled with how many places into the
 * message the pair sits. The rotors are in a different position for each.
 */
export type Link = { a: string; b: string; step: number };

export function menu(ciphertext: string, crib: string, offset: number): Link[] {
  const c = onlyLetters(ciphertext);
  return [...onlyLetters(crib)].map((letter, i) => ({ a: letter, b: c[offset + i], step: offset + i }));
}

/**
 * How many independent loops the menu holds. A loop lets the Bombe test a
 * plugboard guess against itself, so the more loops, the fewer false stops.
 * For a graph that's edges minus letters plus separate pieces.
 */
export function loops(links: Link[]) {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    const p = parent.get(x) ?? x;
    if (p === x) return x;
    const root = find(p);
    parent.set(x, root);
    return root;
  };
  for (const { a, b } of links) {
    if (!parent.has(a)) parent.set(a, a);
    if (!parent.has(b)) parent.set(b, b);
    parent.set(find(a), find(b));
  }
  const letters = [...parent.keys()];
  const pieces = new Set(letters.map(find)).size;
  return links.length - letters.length + pieces;
}
