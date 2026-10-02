import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PAGES = [
  {
    href: "/crib",
    title: "Cribs & the Bombe",
    text: "How Polish mathematicians first broke Enigma in 1932, and how Bletchley Park turned their work into an industry that read it through the war.",
  },
  {
    href: "/codebreaker",
    title: "Codebreaker",
    text: "Break a message yourself, with no key and no guesses, the way a computer does it today.",
  },
];

/** The two pages on breaking the machine, as large cards to carry the reader on. */
export function Onward() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PAGES.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className="group flex flex-col justify-between gap-6 rounded-xl border border-panel-edge bg-panel p-6 transition-colors hover:border-brass sm:p-8"
        >
          <div>
            <h3 className="font-stencil text-3xl font-bold tracking-wide">{p.title}</h3>
            <p className="mt-3 font-serif text-lg leading-relaxed text-room-ink/85">{p.text}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-brass">
            Read on <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </Link>
      ))}
    </div>
  );
}
