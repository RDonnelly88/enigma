"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PAGES } from "@/lib/pages";

/**
 * The way on at the foot of every page but the story, which ends with cards of
 * its own. The last page sends the reader back to the machine to send a secret.
 */
export function NextPage() {
  const path = usePathname();
  const here = PAGES.findIndex((p) => p.href !== "/" && path.startsWith(p.href));
  if (here < 0) return null;
  const next = PAGES[here + 1];
  const target = next
    ? { href: next.href, eyebrow: "Next", title: next.label, lead: next.lead }
    : {
        href: "/machine?lesson=share",
        eyebrow: "The end of the story",
        title: "Send a secret",
        lead: "Now you know how it was broken, set up a machine, encipher a message and send a friend the key.",
      };

  return (
    <footer className="mx-auto max-w-6xl px-4 pb-16">
      <Link
        href={target.href}
        className="group flex flex-col gap-3 rounded-xl border border-panel-edge bg-panel p-6 transition-colors hover:border-brass sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-brass uppercase">{target.eyebrow}</p>
          <p className="mt-2 font-stencil text-3xl font-bold tracking-wide">{target.title}</p>
          <p className="mt-2 max-w-2xl font-serif text-lg leading-relaxed text-room-ink/85">{target.lead}</p>
        </div>
        <ArrowRight className="size-8 shrink-0 text-brass transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
      </Link>
    </footer>
  );
}
