import Link from "next/link";
import { ClimbDemo } from "@/components/breaking/climb-demo";
import { IocDemo } from "@/components/breaking/ioc-demo";
import { CodebreakerFromLink } from "@/components/codebreaker/from-link";
import { Timeline } from "@/components/story/timeline";
import { Chapter, Prose } from "@/components/ui/chapter";
import { ChapterRail } from "@/components/ui/chapter-rail";
import { PageHero } from "@/components/ui/page-hero";
import { COMPUTER_HISTORY } from "@/lib/story/history";

const CHAPTERS = [
  { id: "computers", title: "After the war" },
  { id: "ioc", title: "Nearly right" },
  { id: "climb", title: "Climbing" },
  { id: "try", title: "Break one yourself" },
  { id: "limits", title: "Where it stops" },
];

export default function Codebreaker() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <PageHero eyebrow="Breaking it by computer" title="Codebreaker">
        <p>
          Bletchley needed a crib, a building full of Bombes and thousands of people. Half a century later, a home computer
          could break an Enigma message with nothing to go on but the ciphertext. Here is how, and a chance to do it
          yourself.
        </p>
      </PageHero>
      <ChapterRail chapters={CHAPTERS} />

      <Chapter
        id="computers"
        number={1}
        eyebrow="After the war"
        title="Statistics instead of guesses"
        intro={
          <p>
            A crib is a guess about what a message says. Statistics need no guess at all, only enough text, and enough
            computing power to try millions of settings. Bletchley had neither in the quantity required. Modern computers
            have both.
          </p>
        }
      >
        <Timeline label="Breaking Enigma by computer" moments={COMPUTER_HISTORY} />
        <Prose>
          <p>
            The method runs in two halves. First, find the rotors while ignoring the plugboard altogether, by spotting the
            settings that make the output slightly less random than it should be. Then, from each of the best, find the
            plugboard by climbing: one cable at a time, keeping whichever makes the text look most like the language.
          </p>
        </Prose>
      </Chapter>

      <Chapter
        id="ioc"
        number={2}
        eyebrow="Nearly right"
        title="Telling nearly right from wrong"
        intro={
          <p>
            A wrong rotor setting turns a message into random letters. A nearly right one leaves some of it German, and
            German has a fingerprint: some letters far commoner than others. One number captures it.
          </p>
        }
      >
        <IocDemo />
      </Chapter>

      <Chapter
        id="climb"
        number={3}
        eyebrow="Climbing"
        title="Finding the plugboard one cable at a time"
        intro={
          <p>
            Once the rotors are right, there are 150 trillion ways to plug ten cables, far too many to try. But they
            don&rsquo;t need trying. Each correct cable makes the text a little more like German, so the search can feel
            its way uphill.
          </p>
        }
      >
        <ClimbDemo />
      </Chapter>

      <Chapter
        id="try"
        number={4}
        eyebrow="Break one yourself"
        title="No key, no crib, just the ciphertext"
        intro={
          <p>
            Here is the whole attack, running in your browser. Pick a practice intercept, or paste in a message you
            enciphered on the{" "}
            <Link href="/machine" className="text-brass underline underline-offset-4">
              machine
            </Link>
            , and watch it work through 27 million rotor settings.
          </p>
        }
      >
        <CodebreakerFromLink />
      </Chapter>

      <Chapter
        id="limits"
        number={5}
        eyebrow="Where it stops"
        title="Where statistics run out"
        intro={
          <p>
            Try the ten-cable intercept and the codebreaker fails. That is not a bug. With ten cables, only six letters pass
            the plugboard untouched, and the faint signal the first stage relies on sinks into the noise.
          </p>
        }
      >
        <Prose>
          <p>
            The army used ten cables from 1939, and kept messages short. Against that traffic this straightforward version
            of the attack fails. Refined modern methods, given far more computing time than a web page has, can break some
            of it; but the wartime answer was the one in{" "}
            <Link href="/crib" className="font-sans font-semibold text-brass underline underline-offset-4">
              cribs and the Bombe
            </Link>
            : guess part of the message, and let the guess do the work.
          </p>
        </Prose>
      </Chapter>
    </main>
  );
}
