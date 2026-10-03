"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { TERMS, findTerm, gloss, searchTerms } from "@/lib/glossary";
import { GlossaryVisual } from "./visuals";

type Glossary = { open: (id?: string) => void };
const GlossaryContext = createContext<Glossary>({ open: () => {} });

/**
 * The glossary lives once, beside the page, and anything can open it at a
 * term: the book in the header, or an underlined word in the story.
 */
export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  const [term, setTerm] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = useCallback((id?: string) => {
    opener.current = document.activeElement as HTMLElement | null;
    setTerm(id ?? null);
    setShown(true);
  }, []);
  const close = useCallback(() => {
    setShown(false);
    opener.current?.focus();
  }, []);
  const value = useMemo(() => ({ open }), [open]);
  return (
    <GlossaryContext.Provider value={value}>
      {children}
      <Drawer shown={shown} term={term} onTerm={setTerm} onClose={close} />
    </GlossaryContext.Provider>
  );
}

const useGlossary = () => useContext(GlossaryContext);

/**
 * A technical word in running text: underlined, and a tap opens the glossary
 * at it. The rule everywhere: underline a term the first time it appears in a
 * block of reading (a chapter, a demo's explanation, a card, a lesson), and
 * never in buttons, labels or charts.
 */
export function Term({ id, children }: { id: string; children: React.ReactNode }) {
  const { open } = useGlossary();
  const term = findTerm(id);
  return (
    <button
      type="button"
      onClick={() => open(id)}
      title={term ? `${term.term}: ${term.says}` : undefined}
      className="inline cursor-help font-[inherit] text-[length:inherit] underline decoration-brass decoration-dotted decoration-2 underline-offset-[0.2em] hover:text-brass"
    >
      {children}
    </button>
  );
}

/** A string of reading, from a lesson, an event or a card, with its terms underlined by the same rule as any block. */
export function Glossed({ text }: { text: string }) {
  return (
    <>
      {gloss(text, new Set()).map((piece, i) =>
        typeof piece === "string" ? (
          piece
        ) : (
          <Term key={i} id={piece.id}>
            {piece.text}
          </Term>
        ),
      )}
    </>
  );
}

export function GlossaryButton() {
  const { open } = useGlossary();
  return (
    <button
      type="button"
      onClick={() => open()}
      aria-label="Open the glossary"
      title="Glossary"
      className="grid size-8 shrink-0 place-items-center rounded-full text-room-muted transition-colors hover:bg-panel hover:text-room-ink"
    >
      <BookOpen className="size-4" />
    </button>
  );
}

function Drawer({ shown, term, onTerm, onClose }: { shown: boolean; term: string | null; onTerm: (id: string | null) => void; onClose: () => void }) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const found = searchTerms(query);
  const initials = [...new Set(TERMS.map((t) => t.term[0].toUpperCase()))].sort();

  // While open: Escape closes, the page behind stays still, and focus starts inside
  useEffect(() => {
    if (!shown) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
    };
  }, [shown, onClose]);

  // Opening at a term brings its card into view
  useEffect(() => {
    if (!shown || !term) return;
    list.current?.querySelector(`[data-term="${term}"]`)?.scrollIntoView({ block: "start" });
  }, [shown, term]);

  return (
    <AnimatePresence>
      {shown && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a sliding panel animated as an aside; <dialog> brings its own top-layer behaviour
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-title"
            className="relative flex h-full w-full max-w-md flex-col border-l border-panel-edge bg-panel shadow-2xl"
            initial={{ x: reduced ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduced ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <header className="flex flex-col gap-3 border-b border-panel-edge p-4">
              <div className="flex items-center justify-between">
                <h2 id="glossary-title" className="flex items-center gap-2 font-stencil text-2xl font-bold tracking-wide">
                  <BookOpen className="size-5 text-brass" aria-hidden /> Glossary
                </h2>
                <button ref={closeButton} type="button" onClick={onClose} aria-label="Close the glossary" className="rounded-full p-1.5 hover:bg-room">
                  <X className="size-5" />
                </button>
              </div>
              <label className="flex items-center gap-2 rounded-lg border border-panel-edge bg-room px-3 py-2 focus-within:border-brass">
                <Search className="size-4 text-room-muted" aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search: cipher, rotor, Bombe…"
                  aria-label="Search the glossary"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </label>
              {!query && (
                <nav aria-label="Jump to a letter" className="flex flex-wrap gap-1">
                  {initials.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => list.current?.querySelector(`[data-initial="${l}"]`)?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" })}
                      className="grid size-7 place-items-center rounded font-stencil text-sm font-bold text-room-muted hover:bg-room hover:text-brass"
                    >
                      {l}
                    </button>
                  ))}
                </nav>
              )}
            </header>
            <div ref={list} className="flex-1 overflow-y-auto overscroll-contain p-4" data-testid="glossary-list">
              {found.length === 0 && <p className="text-sm text-room-muted">Nothing matches &ldquo;{query}&rdquo;.</p>}
              <ul className="flex flex-col gap-2">
                {found.map((t, i) => {
                  const open = t.id === term;
                  const firstOfLetter = i === 0 || found[i - 1].term[0] !== t.term[0];
                  return (
                    <li key={t.id} data-term={t.id} data-initial={firstOfLetter ? t.term[0].toUpperCase() : undefined} className="scroll-mt-2">
                      <div className={cn("rounded-xl border transition-colors", open ? "border-brass bg-room" : "border-panel-edge hover:border-brass/60")}>
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => onTerm(open ? null : t.id)}
                          className="flex w-full flex-col items-start gap-1 p-3 text-left"
                        >
                          <span className="font-stencil text-xl font-bold tracking-wide">{t.term}</span>
                          {t.aka && <span className="text-xs text-room-muted">Also: {t.aka.join(", ")}</span>}
                          <span className="text-sm leading-relaxed">{t.says}</span>
                        </button>
                        {open && (
                          <div className="flex flex-col gap-3 px-3 pb-3" data-testid="glossary-open">
                            {t.visual && <GlossaryVisual kind={t.visual} />}
                            <p className="font-serif text-[0.95rem] leading-relaxed text-room-ink/90">{t.more}</p>
                            <Link
                              href={t.see.href}
                              onClick={onClose}
                              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brass underline underline-offset-2"
                            >
                              {t.see.label} <ArrowRight className="size-3.5" />
                            </Link>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs text-room-muted">See also</span>
                              {t.related.map((id) => (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => {
                                    setQuery("");
                                    onTerm(id);
                                  }}
                                  className="rounded-full border border-panel-edge px-2.5 py-0.5 text-xs font-semibold hover:border-brass"
                                >
                                  {findTerm(id)?.term}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
