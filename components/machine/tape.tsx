"use client";

import { useState } from "react";
import { Check, Copy, FastForward, RotateCcw, Trash2 } from "lucide-react";

/** Groups of five, as operators wrote messages down. */
function groups(text: string) {
  return text.match(/.{1,5}/g)?.join(" ") ?? "";
}

type Props = {
  input: string;
  output: string;
  onRewind: () => void;
  onClear: () => void;
  onMessage: (text: string) => void;
  disabled: boolean;
  /** Letters still to go while a message types itself in. */
  typing: number;
  onFinish: () => void;
};

export function Tape({ input, output, onRewind, onClear, onMessage, disabled, typing, onFinish }: Props) {
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState("");

  const copy = async () => {
    await navigator.clipboard.writeText(groups(output));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section aria-label="Message tape" className="rounded-sm bg-paper p-4 text-paper-ink shadow-[0_2px_0_rgb(0_0_0/0.1),0_8px_24px_rgb(0_0_0/0.25)]">
      <dl className="grid gap-3 font-type text-lg leading-snug break-all sm:text-xl">
        <div>
          <dt className="font-sans text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Typed</dt>
          <dd data-testid="tape-input" className="min-h-7">{groups(input) || <span className="text-paper-muted">Press a key…</span>}</dd>
        </div>
        <div>
          <dt className="font-sans text-[11px] font-semibold tracking-widest text-paper-muted uppercase">Lit</dt>
          <dd data-testid="tape-output" className="min-h-7">{groups(output)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-dashed border-paper-muted/50 pt-3 text-sm">
        <button type="button" onClick={onRewind} disabled={!input} className="tape-button">
          <RotateCcw className="size-4" /> Rewind
        </button>
        <button type="button" onClick={onClear} disabled={!input} className="tape-button">
          <Trash2 className="size-4" /> New message
        </button>
        <button type="button" onClick={copy} disabled={!output} className="tape-button">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {typing > 0 ? (
        <div className="mt-3 flex items-center justify-between gap-2 text-sm">
          <span className="font-type">
            Typing it in… {typing} {typing === 1 ? "letter" : "letters"} to go
          </span>
          <button type="button" onClick={onFinish} className="tape-button">
            <FastForward className="size-4" /> Finish now
          </button>
        </div>
      ) : (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onMessage(draft);
            setDraft("");
          }}
        >
          <label className="sr-only" htmlFor="message">Type or paste a message</label>
          <input
            id="message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste a whole message…"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-sm border border-paper-muted/60 bg-transparent px-2 py-1.5 font-type text-base uppercase placeholder:normal-case placeholder:text-paper-muted focus:outline-2 focus:outline-paper-ink"
          />
          <button type="submit" disabled={disabled || !/[a-z]/i.test(draft)} className="tape-button">
            Type it
          </button>
        </form>
      )}
    </section>
  );
}
