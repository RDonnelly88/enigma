import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PAGES = [
  {
    href: "/day",
    title: "A day in 1941",
    text: "Follow one day of messages from both sides: the German operator’s midnight key change, and Bletchley reading his orders within the hour.",
  },
  {
    href: "/crib",
    title: "Cribs & the Bombe",
    text: "How Polish mathematicians first broke Enigma in 1932, how Bletchley Park turned their work into an industry, and a turn at being the Bombe yourself.",
  },
  {
    href: "/codebreaker",
    title: "Codebreaker",
    text: "Break a message yourself, with no key and no guesses, the way a computer does it today.",
  },
  {
    href: "/certificate",
    title: "Your certificate",
    text: "Two tests: a quiz, and an intercept to break against the clock with a crib and a Bombe. Pass, and earn a certificate with your name enciphered on Enigma.",
  },
];

/** The pages that follow the story, as large cards to carry the reader on. */
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
