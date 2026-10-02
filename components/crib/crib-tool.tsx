"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { MenuGraph } from "@/components/crib/menu-graph";
import { PositionMap } from "@/components/crib/position-map";
import { Strip } from "@/components/crib/strip";
import { menu, onlyLetters, placements } from "@/lib/crib";
import { PRACTICE_CIPHERTEXT, PRACTICE_CRIB } from "@/lib/messages";

/** The crib dragger: slide a guessed word along an intercept and see where it could and couldn't be. */
export function CribTool() {
  const [ciphertextDraft, setCiphertextDraft] = useState(PRACTICE_CIPHERTEXT);
  const [cribDraft, setCribDraft] = useState(PRACTICE_CRIB);
  const [offset, setOffset] = useState(0);

  const ciphertext = onlyLetters(ciphertextDraft);
  const crib = onlyLetters(cribDraft);
  const all = useMemo(() => placements(ciphertext, crib), [ciphertext, crib]);
  const current = all[Math.min(offset, all.length - 1)];
  const at = current?.offset ?? 0;
  const possible = all.filter((p) => p.clashes.length === 0);
  const nextPossible = possible.find((p) => p.offset > at) ?? possible[0];

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 rounded-sm bg-paper p-4 text-paper-ink shadow-md sm:grid-cols-[2fr_1fr]">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Intercept</span>
          <textarea
            value={ciphertextDraft}
            onChange={(e) => {
              setCiphertextDraft(e.target.value);
              setOffset(0);
            }}
            rows={3}
            spellCheck={false}
            className="resize-y rounded-sm border border-paper-muted/60 bg-transparent px-2 py-1.5 font-type text-base break-all uppercase focus:outline-2 focus:outline-paper-ink"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Crib</span>
          <input
            value={cribDraft}
            onChange={(e) => {
              setCribDraft(e.target.value);
              setOffset(0);
            }}
            spellCheck={false}
            autoComplete="off"
            className="rounded-sm border border-paper-muted/60 bg-transparent px-2 py-1.5 font-type text-base uppercase focus:outline-2 focus:outline-paper-ink"
          />
          <span className="text-xs text-paper-muted">Try WETTERVORHERSAGE, then something shorter like WETTER.</span>
        </label>
        {(ciphertextDraft !== PRACTICE_CIPHERTEXT || cribDraft !== PRACTICE_CRIB) && (
          <button
            type="button"
            className="tape-button w-fit"
            onClick={() => {
              setCiphertextDraft(PRACTICE_CIPHERTEXT);
              setCribDraft(PRACTICE_CRIB);
              setOffset(0);
            }}
          >
            Back to the practice intercept
          </button>
        )}
      </section>

      {!current ? (
        <p className="text-sm text-room-muted">
          {crib.length === 0 ? "Enter a crib to start dragging." : "The crib is longer than the intercept."}
        </p>
      ) : (
        <>
          <section aria-labelledby="drag" className="rounded-sm bg-paper p-4 text-paper-ink shadow-md">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 id="drag" className="font-semibold">
                Position {at + 1}:{" "}
                <span data-testid="verdict" className={current.clashes.length ? "text-danger" : "text-signal-in"}>
                  {current.clashes.length === 0
                    ? "possible"
                    : `ruled out, ${current.clashes.map((i) => crib[i]).join(", ")} would encrypt as itself`}
                </span>
              </h3>
              <div className="flex gap-2 text-sm">
                <button type="button" className="tape-button" aria-label="Previous position" disabled={at === 0} onClick={() => setOffset(at - 1)}>
                  <ChevronLeft className="size-4" />
                </button>
                <button type="button" className="tape-button" aria-label="Next position" disabled={at === all.length - 1} onClick={() => setOffset(at + 1)}>
                  <ChevronRight className="size-4" />
                </button>
                <button type="button" className="tape-button" disabled={!nextPossible} onClick={() => nextPossible && setOffset(nextPossible.offset)}>
                  <SkipForward className="size-4" /> Next possible
                </button>
              </div>
            </div>
            <Strip ciphertext={ciphertext} crib={crib} offset={at} clashes={current.clashes} onOffset={setOffset} />
            <div className="mt-4 border-t border-dashed border-paper-muted/50 pt-4">
              <p className="mb-2 text-sm">
                <strong data-testid="survivors">
                  {possible.length} of {all.length}
                </strong>{" "}
                positions survive. A longer crib rules out more: each extra letter gives one more chance of a clash.
              </p>
              <PositionMap placements={all} offset={at} onOffset={setOffset} />
            </div>
          </section>

          <section aria-labelledby="menu" className="grid gap-4 rounded-sm bg-paper p-4 text-paper-ink shadow-md md:grid-cols-[1fr_1fr]">
            <div>
              <h3 id="menu" className="font-semibold">The Bombe&rsquo;s menu</h3>
              <p className="mt-1 text-sm text-paper-muted">
                Each surviving position gives a menu: every crib letter joined to the letter it became, at its place in
                the message. Turing&rsquo;s Bombe was wired up from this diagram, then spun through every rotor setting
                looking for one where the plugboard could make all the links agree at once. Loops are what made that
                test sharp: a wrong guess going round a loop contradicts itself.
              </p>
              {current.clashes.length > 0 && (
                <p className="mt-3 text-sm font-medium text-danger">
                  This position is ruled out, so there&rsquo;s no point building its menu. Try the next possible one.
                </p>
              )}
            </div>
            {current.clashes.length === 0 && <MenuGraph links={menu(ciphertext, crib, at)} />}
          </section>
        </>
      )}
    </div>
  );
}
