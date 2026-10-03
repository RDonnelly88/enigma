"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
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

/**
 * Sending a secret the proper way: the ciphertext as a link anyone may see,
 * and the key as a code to pass on separately. The key is the settings the
 * message began from, not where the rotors have got to.
 */
export function ShareSecret({ settings, ciphertext, onShare }: { settings: Settings; ciphertext: string; onShare: () => void }) {
  if (!ciphertext) {
    return <p className="text-sm text-room-muted">Type a message on the machine and it will appear here, ready to send.</p>;
  }
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return (
    <div className="flex flex-col gap-4">
      <CopyField label="1. Link to the ciphertext" value={origin + secretLink(ciphertext)} onCopy={onShare} />
      <CopyField label="2. The key, to send another way" value={keyCode(settings)} onCopy={onShare} />
      <p className="text-sm leading-relaxed text-room-muted">
        Send the link however you like; it&rsquo;s gibberish without the key. Send the key some other way, a text or a word
        in person. The link opens the machine and asks for it.
      </p>
      <details className="text-sm">
        <summary className="cursor-pointer text-room-muted hover:text-room-ink">Or send it with the key built in</summary>
        <div className="mt-3">
          <CopyField label="Opens already deciphered" value={origin + machineLink(settings, ciphertext)} onCopy={onShare} />
        </div>
      </details>
    </div>
  );
}
