import Link from "next/link";
import { Crest } from "@/components/art/small-scenes";
import { Stamp } from "@/components/ui/stamp";
import { enciphered, QUESTIONS, rank } from "@/lib/quiz";
import { rating } from "@/lib/story/challenge";
import { clock, type BreakResult } from "./break-intercept";

export type Award = { name: string; score: number; date: string };

/** The certificate itself, laid out to print on its own as a page. */
export function Certificate({ award, broke }: { award: Award; broke?: BreakResult | null }) {
  const title = rank(award.score);
  const secret = enciphered(award.name);
  const date = new Date(award.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <article
      className="print-me relative overflow-hidden rounded-sm bg-paper p-2 text-paper-ink shadow-2xl sm:p-3"
      aria-label="Codebreaker's certificate"
      data-testid="certificate"
    >
      <div className="relative border-4 border-double border-paper-ink/60 px-5 pt-14 pb-10 text-center sm:px-12 sm:py-14">
        <Stamp tilt={12} className="absolute top-3 right-3 text-sm sm:top-10 sm:right-10 sm:border-4 sm:px-3 sm:py-1 sm:text-3xl">
          Passed
        </Stamp>
        {broke && (
          <Stamp ink="green" tilt={-12} className="absolute top-3 left-3 text-sm sm:top-10 sm:left-10 sm:border-4 sm:px-3 sm:py-1 sm:text-2xl">
            Broken
          </Stamp>
        )}
        <Crest className="mx-auto mb-3 h-20 w-auto sm:h-24" />
        <p className="font-stencil text-sm font-bold tracking-[0.5em] text-paper-muted">ENIGMA</p>
        <h2 className="mt-4 font-stencil text-4xl leading-none font-bold tracking-wide sm:text-6xl">Codebreaker&rsquo;s certificate</h2>
        <p className="mt-8 font-serif text-lg italic">This is to certify that</p>
        <p className="mt-3 font-type text-3xl break-words sm:text-5xl" data-testid="certificate-name">
          {award.name}
        </p>
        <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed">
          has learnt how the Enigma machine worked, how it was used and how it was broken, and answered{" "}
          <strong>
            {award.score} of {QUESTIONS.length}
          </strong>{" "}
          questions correctly, earning the title of
        </p>
        <p className="mt-3 font-stencil text-3xl font-bold tracking-widest uppercase sm:text-4xl">{title}</p>
        {broke && (
          <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed" data-testid="certificate-break">
            and broke an intercept with a Bombe in <strong>{clock(broke.seconds)}</strong>, as a{" "}
            <strong>{rating(broke.seconds)}</strong>.
          </p>
        )}

        <div className="mx-auto mt-10 max-w-xl border-t border-paper-ink/30 pt-6">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-paper-muted uppercase">Your name, as Enigma would send it</p>
          <p className="mt-2 font-type text-xl tracking-[0.2em] break-all" data-testid="certificate-cipher">
            {secret.text}
          </p>
          <p className="mt-1 font-type text-xs text-paper-muted">Key: {secret.key}</p>
          <Link href={secret.link} className="no-print mt-2 inline-block text-sm font-semibold text-paper-ink underline underline-offset-4">
            Decipher it on the machine
          </Link>
        </div>

        <div className="mt-10 flex items-end justify-between gap-4 text-left text-sm">
          <div>
            <p className="font-type text-base">{date}</p>
            <p className="border-t border-paper-ink/40 pt-1 text-paper-muted">Date</p>
          </div>
          <div className="text-right">
            <p className="font-serif text-base italic">The Enigma signals school</p>
            <p className="border-t border-paper-ink/40 pt-1 text-paper-muted">Awarded by</p>
          </div>
        </div>
      </div>
    </article>
  );
}
