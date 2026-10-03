import Link from "next/link";
import { BombeWalkthrough } from "@/components/breaking/bombe-walkthrough";
import { RejewskiDemo } from "@/components/breaking/rejewski-demo";
import { CribTool } from "@/components/crib/crib-tool";
import { Timeline } from "@/components/story/timeline";
import { Aside, Chapter, Prose } from "@/components/ui/chapter";
import { ChapterRail } from "@/components/ui/chapter-rail";
import { PageHero } from "@/components/ui/page-hero";
import { PRACTICE_CIPHERTEXT, PRACTICE_ENGLISH, PRACTICE_PLAINTEXT } from "@/lib/messages";
import { BREAKING_HISTORY } from "@/lib/story/history";

const CHAPTERS = [
  { id: "poland", title: "Poland, 1932" },
  { id: "bletchley", title: "Bletchley Park" },
  { id: "cribs", title: "Cribs" },
  { id: "bombe", title: "The Bombe" },
  { id: "after", title: "What it changed" },
];

export default function CribsAndTheBombe() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <PageHero eyebrow="Breaking it by hand" title="Cribs & the Bombe">
        <p>
          Enigma was first broken in 1932, by three young mathematicians in Warsaw, seven years before the war began. What
          they started, Bletchley Park turned into an industry: thousands of people and hundreds of machines reading the
          enemy&rsquo;s messages, often within hours of their being sent.
        </p>
      </PageHero>
      <ChapterRail chapters={CHAPTERS} />

      <Chapter
        id="poland"
        number={1}
        eyebrow="Poland, 1932"
        title="Mathematics against a machine"
        short={{
          says: "In 1932 a young Polish mathematician, Marian Rejewski, worked out how the army’s Enigma was wired, using maths and some settings sold by a German spy. Then he used the doubled message key to find each day’s settings.",
          bigIdea: "Enigma was first broken in Poland, seven years before the war.",
        }}
        intro={
          <p>
            French and British codebreakers had looked at the military Enigma and made little headway. Poland, with Germany
            on one side and the Soviet Union on the other, could not afford to fail. Its Cipher Bureau did something new: it
            hired mathematicians.
          </p>
        }
      >
        <Prose>
          <p>
            Marian Rejewski was 27. He knew the commercial machine and the army&rsquo;s procedure, and from French
            intelligence he had settings that a German in the cipher office had sold. What he did not have was the
            wiring of the army&rsquo;s rotors. He worked it out by treating the machine as a set of permutations and
            solving equations, one of the great feats of applied mathematics.
          </p>
          <p>
            Then he found a way to read the daily keys. The doubled message key at the head of every message was the opening.
          </p>
        </Prose>
        <RejewskiDemo />
        <Prose>
          <p>
            For years the Poles read German army traffic this way, building replica machines and, as the Germans tightened
            their procedures, the bomba, an electrical machine named, so the story goes, after an ice cream. In December
            1938 the Germans added two rotors. Sixty rotor orders instead of six put the work beyond Poland&rsquo;s resources.
          </p>
        </Prose>
      </Chapter>

      <Chapter
        id="bletchley"
        number={2}
        eyebrow="Bletchley Park"
        title="An industry of codebreaking"
        short={{
          says: "Just before the war, the Poles shared everything they knew with Britain and France. Britain’s codebreakers worked at Bletchley Park, a country house that grew to nearly ten thousand people, most of them women. They kept it secret for thirty years.",
          bigIdea: "Codebreaking became a huge, secret team effort.",
        }}
        intro={
          <p>
            In July 1939, at a forest site outside Warsaw, the Poles gave everything to their British and French allies:
            their methods, their machines and two replica Enigmas. Five weeks later Germany invaded.
          </p>
        }
      >
        <Prose>
          <p>
            Britain&rsquo;s Government Code and Cypher School had moved to Bletchley Park, a Victorian mansion halfway
            between Oxford and Cambridge. It recruited mathematicians, linguists, chess players and crossword solvers, and
            then, as the work grew, thousands of people from every walk of life. Most were women: Wrens who ran the
            machines, and women who indexed, translated, analysed and broke codes themselves.
          </p>
          <p>
            The work ran in huts: Hut 6 broke army and air force Enigma, Hut 8 the navy&rsquo;s, and Huts 3 and 4 turned the
            results into intelligence. Nobody outside was to know. Most of them kept the secret for thirty years.
          </p>
        </Prose>
        <Timeline label="How Enigma was broken" moments={BREAKING_HISTORY} />
      </Chapter>

      <Chapter
        id="cribs"
        number={3}
        eyebrow="Cribs"
        title="Guess a word, rule out a place"
        short={{
          says: "Codebreakers guessed words that were probably in a message, like the German for weather forecast. A guessed word is called a crib. Because no letter can turn into itself, they could rule out lots of places where the guess couldn’t fit.",
          bigIdea: "A good guess is the first step to breaking a code.",
        }}
        intro={
          <p>
            Every attack on Enigma at Bletchley started with a guess. Weather reports said <em>WETTERVORHERSAGE</em>,
            routine reports said there was nothing to report, and a guessed word is called a crib. The reflector&rsquo;s
            flaw tells you where a crib can&rsquo;t be: anywhere one of its letters would land on itself.
          </p>
        }
      >
        <CribTool />
      </Chapter>

      <Chapter
        id="bombe"
        number={4}
        eyebrow="The Bombe"
        title="Testing a guess against every setting"
        short={{
          says: "Alan Turing designed the Bombe, a machine that took a crib and raced through the rotor settings, throwing out every one that couldn’t be right. The few left were tested by hand until the message turned into German.",
          bigIdea: "The Bombe didn’t read messages. It ruled out wrong settings, fast.",
        }}
        intro={
          <p>
            Knowing where a crib sits still leaves millions of rotor settings and an unknown plugboard. Alan Turing saw that
            the crib itself could test a setting without knowing the plugboard at all, and designed a machine to run the
            test at speed.
          </p>
        }
      >
        <BombeWalkthrough />
        <Aside>
          The Bombe did not read messages. It threw out wrong settings so fast that the few left could be tried by hand.
        </Aside>
      </Chapter>

      <Chapter
        id="after"
        number={5}
        eyebrow="What it changed"
        title="Ultra"
        short={{
          says: "The secrets read at Bletchley were called Ultra. They told Britain and its allies where U-boats were hunting and what enemy armies were planning. Some historians think it shortened the war by up to two years.",
          bigIdea: "Reading the enemy’s messages changed the war.",
        }}
        intro={
          <p>
            The intelligence from Enigma was called Ultra, and it reached commanders throughout the war: the positions of
            U-boat packs in the Atlantic, the plans of armies in North Africa, the German order of battle before D-Day.
          </p>
        }
      >
        <div className="rounded-xl border-2 border-signal-in bg-panel p-6">
          <p className="text-xs font-semibold tracking-[0.25em] text-signal-in uppercase">The practice intercept, read</p>
          <p className="mt-3 font-type text-lg break-all">{PRACTICE_CIPHERTEXT.match(/.{1,5}/g)!.slice(0, 8).join(" ")} …</p>
          <p className="mt-3 font-type text-xl">{PRACTICE_PLAINTEXT.replace(/X/g, " ")}</p>
          <p className="mt-3 font-serif text-xl italic">{PRACTICE_ENGLISH}</p>
          <p className="mt-4 text-sm text-room-muted">
            From an intercepted jumble to a readable message, with a guessed word, a loop, a machine that threw out wrong
            settings, and a checking machine. Multiply that by every network, every day, and you have Bletchley Park.
          </p>
        </div>
        <Prose>
          <p>
            How much it changed the outcome is still argued over. Some historians have suggested it shortened the war in
            Europe by as much as two years; others are more cautious. What is not in doubt is the scale of the effort, or
            that it began with three Polish mathematicians and a flaw in a wheel that never turned.
          </p>
          <p>
            Today a computer can do what took Bletchley a building full of machines, and with no crib at all.{" "}
            <Link href="/codebreaker" className="font-sans font-semibold text-brass underline underline-offset-4">
              Try the codebreaker
            </Link>
            .
          </p>
        </Prose>
      </Chapter>
    </main>
  );
}
