import type { Metadata } from "next";
import Link from "next/link";
import { Gloss } from "@/components/glossary/gloss";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "About this site",
  description: "Who made it, what's real and what's invented, what it keeps about you (nothing), and where to read more.",
};

const READING = [
  { title: "The Code Book", by: "Simon Singh", note: "The best place to start: Enigma in the long story of codes and codebreaking." },
  { title: "The Hut Six Story", by: "Gordon Welchman", note: "The army and air force breaks, told by the man who ran Hut 6." },
  { title: "Enigma: The Battle for the Code", by: "Hugh Sebag-Montefiore", note: "The pinches and the people, from Poland to the Atlantic." },
  { title: "Seizing the Enigma", by: "David Kahn", note: "The naval Enigma and the captures at sea." },
  { title: "Alan Turing: The Enigma", by: "Andrew Hodges", note: "Turing’s life, and Hut 8’s work on the navy’s machine." },
  { title: "Codebreakers: The Inside Story of Bletchley Park", by: "F. H. Hinsley and Alan Stripp (eds.)", note: "Short accounts by the people who worked there." },
];

/** About-page text stays put in every reading mode: unlike the story's long reading, it isn't part of the story. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-stencil text-3xl font-bold tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

export default function About() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <PageHero eyebrow="About this site" title="Behind the machine">
        <p>
          A free, interactive history of the Enigma machine: how it worked, how it was used, and how it was broken. Everything
          on it runs in your browser, from the machine itself to the Bombes and the codebreaker.
        </p>
      </PageHero>

      <div className="flex max-w-2xl flex-col gap-14">
        <Section title="Who made it">
          <div className="space-y-4 font-serif text-[1.075rem] leading-relaxed text-room-ink/90">
            <p>
              Made by Ross Donnelly. The code is open on{" "}
              <a href="https://github.com/RDonnelly88/enigma" className="text-brass underline underline-offset-2">
                GitHub
              </a>
              .
            </p>
            <p>
              It was built with the help of Claude Code, an AI coding tool, which also helped research and write the text. The
              historical detail hasn&rsquo;t been checked line by line against the books below, so if you spot a mistake, please
              say.
            </p>
          </div>
        </Section>

        <Section title="What’s real, and what isn’t">
          <Gloss>
            <div className="space-y-4 font-serif text-[1.075rem] leading-relaxed text-room-ink/90">
              <p>
                The machine is real: its rotor wiring, notches, reflectors and plugboard are the historical ones, and it
                enciphers exactly as an Enigma I, M3 or M4 did. So are the procedures, the people named in the history and the
                dates.
              </p>
              <p>
                The practice messages, their keys, and the unit and people of <Link href="/day" className="text-brass underline underline-offset-2">A day in 1941</Link> are invented, so that
                every message on the site can be broken on the site. The illustrations are drawn in the style of the period,
                not copied from photographs, and the convoy routes on{" "}
                <Link href="/atlantic" className="text-brass underline underline-offset-2">The U-boat war</Link> are illustrative.
              </p>
              <p>
                Spot something wrong? Please say so on{" "}
                <a href="https://github.com/RDonnelly88/enigma/issues" className="text-brass underline underline-offset-2">
                  GitHub
                </a>
                . History deserves to be got right.
              </p>
            </div>
          </Gloss>
        </Section>

        <Section title="Your privacy">
          <div className="space-y-4 font-serif text-[1.075rem] leading-relaxed text-room-ink/90">
            <p>
              There are no accounts, no adverts, no analytics and no cookies. Nothing you type into the machine leaves your
              device. Your choices (light or dark, sound, the short or long reading), your lessons, your quiz result and your
              certificate are kept only in your own browser, and clearing your browser’s data for this site removes them.
            </p>
            <p>
              A secret you send to a friend travels in the link you share, and nowhere else. Like any website, the host that
              serves these pages keeps ordinary server logs.
            </p>
          </div>
        </Section>

        <Section title="For teachers">
          <div className="space-y-4 font-serif text-[1.075rem] leading-relaxed text-room-ink/90">
            <p>
              Free to use in class, with nothing to sign up for, on any device with a browser. It fits computing lessons on
              encryption and history lessons on the Second World War. A few routes through it:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>One lesson:</strong> <Link href="/" className="text-brass underline underline-offset-2">How it worked</Link> in its short reading, then the
                first lessons on <Link href="/machine" className="text-brass underline underline-offset-2">Try the machine</Link>.
              </li>
              <li>
                <strong>Pairs:</strong> one pupil picks a secret key and sends a message; the other copies the key card onto their
                machine and reads it. Then try it without the key, on <Link href="/codebreaker" className="text-brass underline underline-offset-2">By computer</Link>.
              </li>
              <li>
                <strong>A longer project:</strong> <Link href="/crib" className="text-brass underline underline-offset-2">Breaking Enigma</Link> and{" "}
                <Link href="/day" className="text-brass underline underline-offset-2">A day in 1941</Link>, ending with{" "}
                <Link href="/certificate" className="text-brass underline underline-offset-2">Test yourself</Link> and a certificate to print.
              </li>
            </ul>
          </div>
        </Section>

        <Section title="Further reading">
          <p className="text-sm text-room-muted">Good places to go further. They are suggestions for reading, not sources this site has been checked against.</p>
          <ul className="flex flex-col gap-4">
            {READING.map((b) => (
              <li key={b.title} className="rounded-lg border border-panel-edge bg-panel p-4">
                <p className="font-semibold">
                  <cite className="not-italic">{b.title}</cite> <span className="font-normal text-room-muted">· {b.by}</span>
                </p>
                <p className="mt-1 text-sm text-room-muted">{b.note}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-room-muted">
            To see the real thing: Bletchley Park, and The National Museum of Computing beside it, have working rebuilds of
            the Bombe and of the machines that came after.
          </p>
        </Section>
      </div>
    </main>
  );
}
