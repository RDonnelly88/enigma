"use client";

import { INTERCEPTS, type Intercept } from "@/lib/messages";

type Props = {
  onLoad: (intercept: Intercept) => void;
  onType: (text: string) => void;
};

export function Intercepts({ onLoad, onType }: Props) {
  return (
    <section aria-labelledby="intercepts" className="flex flex-col gap-3">
      <h2 id="intercepts" className="font-stencil text-sm font-bold tracking-widest uppercase">
        Intercepted messages
      </h2>
      {INTERCEPTS.map((intercept) => (
        <article key={intercept.id} className="rounded-sm bg-paper p-4 text-paper-ink shadow-md">
          <h3 className="font-semibold">{intercept.title}</h3>
          <p className="mt-1 text-sm text-paper-muted">{intercept.story}</p>
          <p className="mt-2 line-clamp-2 font-type text-sm break-all">{intercept.ciphertext}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <button type="button" className="tape-button" onClick={() => onLoad(intercept)}>
              1. Set the machine
            </button>
            <button type="button" className="tape-button" onClick={() => onType(intercept.ciphertext)}>
              2. Type the message
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
