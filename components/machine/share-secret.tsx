"use client";

import { useState } from "react";
import { Check, Copy, Send, Shuffle } from "lucide-react";
import { KeyCard, copyText } from "@/components/machine/key-card";
import type { Settings } from "@/lib/enigma";
import { secretLink } from "@/lib/share";
import { cn } from "@/lib/cn";

const input = "min-w-0 rounded-md border border-panel-edge bg-room px-3 py-2 text-sm focus:outline-2 focus:outline-brass";
const action = "inline-flex shrink-0 items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold";

/**
 * Sending a secret to a friend the proper way: the key on a card handed over
 * separately, and the ciphertext as a link anyone may see. The key can go in
 * the link instead, which is easier and gives the secret away to anyone who
 * sees it. The key is the settings the message began from, not where the
 * rotors have got to.
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
  const [withKey, setWithKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare] = useState(() => typeof navigator !== "undefined" && typeof navigator.share === "function");
  if (!ciphertext) {
    return (
      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        <p>
          Send a friend a message only they can read. Pick a secret key, type your message on the machine, then give them the key card
          one way and the message another.
        </p>
        <button type="button" onClick={onNewKey} className={cn(action, "w-fit bg-room-ink text-room")}>
          <Shuffle className="size-4" /> Pick a secret key
        </button>
        <p className="text-room-muted">Or set the rotors and cables yourself; whatever the machine is set to is the key.</p>
      </div>
    );
  }
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const link = origin + secretLink(ciphertext, { from, to, key: withKey ? settings : undefined });
  const send = async () => {
    if (canShare) {
      try {
        await navigator.share({ title: "A secret message", text: from ? `A secret message from ${from}` : "A secret message", url: link });
        onShare();
      } catch {}
      return;
    }
    await copyText(link);
    onShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
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
      <div className={cn("transition-opacity", withKey && "opacity-50")}>
        <p className="mb-2 text-sm font-semibold">1. Give them the key card</p>
        <KeyCard settings={settings} from={from} to={to} onUse={onShare} />
        <p className="mt-2 text-sm text-room-muted">
          {withKey ? "Not needed: the key is going in the link." : "Hand it over, print it or read it out. Never in the same message as the link."}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">2. Send the message</p>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="checkbox" checked={withKey} onChange={(e) => setWithKey(e.target.checked)} className="mt-0.5 size-4 accent-brass" />
          <span>
            Put the key in the link too
            <span className="block text-room-muted">
              {withKey ? "Easier, but anyone who gets hold of the link can read the message." : "Off: the link is gibberish without the key card."}
            </span>
          </span>
        </label>
        <div className="flex gap-2">
          <input
            readOnly
            value={link}
            aria-label="Link to send"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-md border border-panel-edge bg-room px-3 py-2 font-type text-sm"
          />
          <button type="button" onClick={send} className={cn(action, "bg-room-ink text-room")}>
            {canShare ? <Send className="size-4" /> : copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {canShare ? "Send" : copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
      <button type="button" onClick={onNewKey} className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brass underline underline-offset-2">
        <Shuffle className="size-4" /> Start a new message with a new key
      </button>
    </div>
  );
}
