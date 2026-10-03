"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Mail, Reply } from "lucide-react";
import { KeyCardForm } from "@/components/machine/key-card";
import { Listen } from "@/components/ui/listen";
import { Stamp } from "@/components/ui/stamp";
import type { Settings } from "@/lib/enigma";
import { playStamp } from "@/lib/sound";

const groups = (t: string) => t.match(/.{1,5}/g)?.join(" ") ?? "";

/** A secret message arrived by link: copy the key card onto the machine, then it types itself in. */
export function Incoming({
  ciphertext,
  from,
  to,
  onRead,
  onDismiss,
}: {
  ciphertext: string;
  from: string;
  to: string;
  onRead: (settings: Settings) => void;
  onDismiss: () => void;
}) {
  return (
    <section aria-label="An incoming message" className="rounded-xl border-2 border-brass bg-panel p-5 shadow-lg">
      <div className="flex items-start gap-3">
        <Mail className="mt-1 size-5 shrink-0 text-brass" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div>
            <h2 className="font-stencil text-2xl font-bold tracking-wide">
              {to ? `A secret message for ${to}` : "A secret message has arrived"}
            </h2>
            {from && <p className="text-sm text-room-muted">From {from}</p>}
            <p className="mt-2 font-type text-base break-all">{groups(ciphertext)}</p>
            <Listen text={ciphertext} className="mt-2" />
          </div>
          <p className="max-w-2xl text-sm leading-relaxed">
            It&rsquo;s gibberish until your machine is set up exactly like the sender&rsquo;s. They should have given you a key card, the
            way every operator had the same key sheet. Copy it in, and the machine types the message for you.
          </p>
          <KeyCardForm onSet={onRead} />
          <p className="text-sm text-room-muted">
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

/**
 * The moment a secret reads: the deciphered message on a signal form, stamped.
 * If the key was copied wrong it reads as nonsense, and says what to check.
 */
export function Received({ text, from, onReply, onClose }: { text: string; from: string; onReply: () => void; onClose: () => void }) {
  useEffect(() => playStamp(), []);
  return (
    <section aria-label="Message received" data-testid="received" className="relative rounded-sm bg-paper p-5 text-paper-ink shadow-lg">
      <Stamp ink="green" tilt={-8} className="absolute top-4 right-4 text-lg sm:text-2xl">
        Received
      </Stamp>
      <p className="font-sans text-[11px] font-semibold tracking-[0.25em] text-paper-muted uppercase">
        Message received{from && ` · from ${from}`}
      </p>
      <p className="mt-3 max-w-[80%] font-type text-2xl leading-snug break-words" data-testid="received-text">
        {text.replace(/X/g, " ").trim()}
      </p>
      <p className="mt-2 font-type text-sm break-all text-paper-muted">As it came off the machine: {groups(text)}</p>
      <p className="mt-3 text-sm text-paper-muted">
        Deciphered on your machine, with each X read as a space, the way operators wrote them. If it reads as nonsense, a line of the key card went in wrong: check the rotors and the start
        letters first.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onReply} className="inline-flex items-center gap-1.5 rounded-md bg-paper-ink px-4 py-2 text-sm font-semibold text-paper">
          <Reply className="size-4" /> Reply with the same key
        </button>
        <button type="button" onClick={onClose} className="tape-button">
          Done
        </button>
      </div>
    </section>
  );
}
