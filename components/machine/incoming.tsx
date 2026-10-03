"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import type { Settings } from "@/lib/enigma";
import { readKeyCode } from "@/lib/share";

const groups = (t: string) => t.match(/.{1,5}/g)?.join(" ") ?? "";

/** A secret message arrived by link: ask for its key, then set the machine and type it in. */
export function Incoming({ ciphertext, onRead, onDismiss }: { ciphertext: string; onRead: (settings: Settings) => void; onDismiss: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  return (
    <section aria-label="An incoming message" className="rounded-xl border-2 border-brass bg-panel p-5 shadow-lg">
      <div className="flex items-start gap-3">
        <Mail className="mt-1 size-5 shrink-0 text-brass" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="font-stencil text-2xl font-bold tracking-wide">A secret message has arrived</h2>
          <p className="mt-2 font-type text-base break-all">{groups(ciphertext)}</p>
          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const settings = readKeyCode(code);
              if (!settings) return setError(true);
              setError(false);
              onRead(settings);
            }}
          >
            <label className="sr-only" htmlFor="key-code">Key code</label>
            <input
              id="key-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="B · II IV V · BUL · BLA · AV BS"
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-md border border-panel-edge bg-room px-3 py-2 font-type focus:outline-2 focus:outline-brass"
            />
            <button type="submit" className="rounded-md bg-room-ink px-4 py-2 text-sm font-semibold text-room">
              Set the machine and read it
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-danger" role="alert">That isn&rsquo;t a key the machine can use. Check it against what you were sent.</p>}
          <p className="mt-3 text-sm text-room-muted">
            No key?{" "}
            <Link href={`/codebreaker?cipher=${ciphertext}`} className="font-semibold text-brass underline underline-offset-2">
              Try to break it
            </Link>{" "}
            ·{" "}
            <button type="button" onClick={onDismiss} className="underline underline-offset-2 hover:text-room-ink">
              Put it aside
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
