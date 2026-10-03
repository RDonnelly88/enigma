"use client";

import { useState } from "react";
import { Check, Copy, Send, Shuffle } from "lucide-react";
import { KeyCard } from "@/components/machine/key-card";
import type { Settings } from "@/lib/enigma";
import { keyCode, machineLink, secretLink } from "@/lib/share";

/** Copies text, and says so for a moment. */
function CopyField({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">{label}</p>
      <div className="mt-1 flex gap-2">
        <input
          readOnly
          value={value}
          aria-label={label}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border border-panel-edge bg-room px-3 py-2 font-type text-sm"
        />
        <button
          type="button"
          onClick={async () => {
            // Clipboard access can be refused; the field is still there to copy by hand
            try {
              await navigator.clipboard.writeText(value);
            } catch {}
            setCopied(true);
            onCopy();
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-panel-edge px-3 text-sm font-semibold hover:border-brass"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

const input = "min-w-0 rounded-md border border-panel-edge bg-room px-3 py-2 text-sm focus:outline-2 focus:outline-brass";

/**
 * Sending a secret to a friend the proper way: the key on a card handed over
 * separately, and the ciphertext as a link anyone may see. The key is the
 * settings the message began from, not where the rotors have got to.
 */
export function ShareSecret({
  settings,
  ciphertext,
  onShare,
  onNewKey,
}: {
  settings: Settings;
  ciphertext: string;
  onShare: () => void;
  onNewKey: () => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [canShare] = useState(() => typeof navigator !== "undefined" && typeof navigator.share === "function");
  if (!ciphertext) {
    return (
      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        <p>
          Send a friend a message only they can read. Pick a secret key, type your message on the machine, then give them the key card
          one way and the message another.
        </p>
        <button type="button" onClick={onNewKey} className="inline-flex w-fit items-center gap-1.5 rounded-md bg-room-ink px-4 py-2 font-semibold text-room">
          <Shuffle className="size-4" /> Pick a secret key
        </button>
        <p className="text-room-muted">Or set the rotors and cables yourself; whatever the machine is set to is the key.</p>
      </div>
    );
  }
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const link = origin + secretLink(ciphertext, { from, to });
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">From</span>
          <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Your name" maxLength={24} autoComplete="off" className={input} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-widest text-room-muted uppercase">To</span>
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Your friend" maxLength={24} autoComplete="off" className={input} />
        </label>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">1. Give them the key card</p>
        <KeyCard settings={settings} from={from} to={to} onPrint={onShare} />
        <p className="mt-2 text-sm text-room-muted">Hand it over, print it, or read it out. Not in the same message as the link.</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">2. Send the message</p>
        {canShare && (
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.share({ title: "A secret message", text: from ? `A secret message from ${from}` : "A secret message", url: link });
                onShare();
              } catch {}
            }}
            className="inline-flex w-fit items-center gap-1.5 rounded-md bg-room-ink px-4 py-2 text-sm font-semibold text-room"
          >
            <Send className="size-4" /> Send the link
          </button>
        )}
        <CopyField label="Link to the ciphertext" value={link} onCopy={onShare} />
        <CopyField label="The key, as one line" value={keyCode(settings)} onCopy={onShare} />
        <p className="text-sm leading-relaxed text-room-muted">
          The link is gibberish without the key card. It opens the machine, asks for the key, and types the message in for them.
        </p>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-room-muted hover:text-room-ink">Or send it with the key built in</summary>
        <div className="mt-3">
          <CopyField label="Opens already deciphered" value={origin + machineLink(settings, ciphertext)} onCopy={onShare} />
        </div>
      </details>
      <button type="button" onClick={onNewKey} className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brass underline underline-offset-2">
        <Shuffle className="size-4" /> Start a new message with a new key
      </button>
    </div>
  );
}
