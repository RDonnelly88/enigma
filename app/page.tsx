import Link from "next/link";
import { FieldStation, JourneyStrip } from "@/components/art/story-scenes";
import { Hero } from "@/components/story/hero";
import { KeyspaceDemo } from "@/components/story/keyspace-demo";
import { Onward } from "@/components/story/onward";
import { OperatorDemos } from "@/components/story/operator-demos";
import { PlugboardDemo } from "@/components/story/plugboard-demo";
import { ReflectorDemo } from "@/components/story/reflector-demo";
import { RotorDemo } from "@/components/story/rotor-demo";
import { SteppingDemo } from "@/components/story/stepping-demo";
import { SwapDemo } from "@/components/story/swap-demo";
import { Timeline } from "@/components/story/timeline";
import { Aside, Chapter, Prose } from "@/components/ui/chapter";
import { ChapterRail } from "@/components/ui/chapter-rail";
import { Term } from "@/components/glossary/glossary";
import { MACHINE_HISTORY, WEAKNESSES } from "@/lib/story/history";

const CHAPTERS = [
  { id: "what", title: "What it was" },
  { id: "how", title: "How it works" },
  { id: "used", title: "How it was used" },
  { id: "strong", title: "Why it was strong" },
  { id: "fell", title: "How it fell" },
];

export default function Story() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <Hero />
      <ChapterRail chapters={CHAPTERS} />

      <Chapter
        id="what"
        number={1}
        eyebrow="What it was"
        title="A typewriter that lied"
        short={{
          says: "Enigma was a machine that turned messages into jumbled letters. Germany used it in the Second World War to send orders by radio, where anyone could listen in. Without a machine set up exactly the same way, the jumble couldn’t be read.",
          bigIdea: "Radio let anyone listen, so every message had to be scrambled.",
        }}
        intro={
          <p>
            Enigma looked like a typewriter in a wooden box. Press a key and, instead of printing it, the machine lit a
            different letter on a panel of lamps. An operator typed the message, a second wrote down the lamps, and what
            went out over the radio was nonsense to anyone without the same machine set the same way.
          </p>
        }
      >
        <Prose>
          <p>
            Radio changed war. Orders could reach a tank, an aircraft or a submarine in seconds, wherever it was. But a
            radio message is heard by anyone listening on that frequency, enemy included. Everything sent had to be
            <Term id="encryption">enciphered</Term>, quickly, by tired signallers in the field, without a <Term id="code">codebook</Term> that could be captured and read.
          </p>
          <p>
            Enigma was the answer Germany chose. Invented as a commercial product to keep business secrets, it was taken
            up by the navy, then the army and the air force, and made steadily harder to break. Tens of thousands were
            built. The Germans believed, with good mathematical reason, that messages sent on it could not be read.
          </p>
        </Prose>
        <FieldStation />
        <Timeline label="The machine's history" moments={MACHINE_HISTORY} />
        <Aside>Its users thought it unbreakable. They were wrong for reasons that had little to do with the machine itself.</Aside>
      </Chapter>

      <Chapter
        id="how"
        number={2}
        eyebrow="How it works"
        title="Built up, one part at a time"
        short={{
          says: "Press a key and electricity takes a twisty path through wired wheels called rotors, bounces off a reflector and comes back to light up a different letter. The rotors turn with every key press, so the path keeps changing.",
          bigIdea: "Press the same key twice and you get two different letters.",
        }}
        intro={
          <p>
            Enigma is a chain of simple parts, each easy to understand on its own. The strength comes from putting them
            together. Here they are in the order the electric current meets them, starting with the problem they solve.
          </p>
        }
      >
        <SwapDemo />
        <Prose>
          <p>
            Enigma&rsquo;s answer to <Term id="frequency-analysis">letter counting</Term> was to keep changing the swap. The scrambling is done by <Term id="rotor">rotors</Term>:
            wheels with 26 brass contacts on each face and a tangle of wires inside, so current entering on one letter
            leaves on another.
          </p>
        </Prose>
        <RotorDemo />
        <Prose>
          <p>
            One rotor repeats itself every 26 letters, so Enigma used three side by side, each scrambling what the last
            one handed it, and made them carry each other round like the digits of a mileometer.
          </p>
        </Prose>
        <SteppingDemo />
        <ReflectorDemo />
        <PlugboardDemo />
        <Prose>
          <p>
            That is the whole machine: keyboard, <Term id="plugboard">plugboard</Term>, three rotors, <Term id="reflector">reflector</Term>, back through the rotors and the
            plugboard, to a lamp. Every press turns the rotors and the whole route changes.
          </p>
          <p>
            <Link href="/machine" className="font-sans font-semibold text-brass underline underline-offset-4">
              Try the full machine
            </Link>
            , where every key press is traced through each part, step by step.
          </p>
        </Prose>
      </Chapter>

      <Chapter
        id="used"
        number={3}
        eyebrow="How it was used"
        title="Midnight, a key sheet, and two operators"
        short={{
          says: "Every day, operators set up their machines from a secret sheet of settings. Each message then got its own starting position, called the message key, typed twice at the start of the message. At the other end, an operator with the same sheet did it all in reverse and read the message off the lamps. Typing the key twice turned out to be a big mistake.",
          bigIdea: "Typing the key twice gave the codebreakers a way in.",
        }}
        intro={
          <p>
            A machine is only as secret as its settings. Every Enigma on a network had to be set exactly alike, every day,
            by people working in tents, cabins and submarines, and the settings had to reach them without falling into the
            wrong hands.
          </p>
        }
      >
        <Prose>
          <p>
            Operators usually worked in pairs. One read the message and typed; the other watched the lamps and wrote down
            each letter as it lit. The result went to a radio operator, who sent it in <Term id="morse">Morse</Term>, usually in groups of five
            letters. At the other end the same routine ran backwards: copy down the Morse, type it into an identically set
            machine, and read the message off the lamps.
          </p>
        </Prose>
        <JourneyStrip />
        <OperatorDemos />
        <Prose>
          <p>
            In May 1940 the army and air force stopped typing the key twice. By then it was too late: the Poles had shown
            how much it gave away, and had handed everything they knew to Britain and France.
          </p>
        </Prose>
      </Chapter>

      <Chapter
        id="strong"
        number={4}
        eyebrow="Why it was strong"
        title="Numbers too big to search"
        short={{
          says: "There were about 159 million million million ways to set the machine up. Even trying a million every second, you would need millions of years to try them all. That is why the Germans thought nobody could ever break it.",
          bigIdea: "Far too many settings to try them all.",
        }}
        intro={
          <p>
            Enigma&rsquo;s designers were right about the mathematics. Even with a captured machine in front of you, its
            wiring known, you still had to find the day&rsquo;s <Term id="key">key</Term> among more possibilities than there are grains of sand
            on every beach on Earth, and tomorrow there would be a new one.
          </p>
        }
      >
        <KeyspaceDemo />
        <Prose>
          <p>
            The Germans trusted the numbers, and the numbers were right. What they got wrong were the assumptions behind
            them: that the enemy could never reconstruct the wiring, that operators would always follow the rules, and that
            nobody could guess a word of what a message said.
          </p>
        </Prose>
      </Chapter>

      <Chapter
        id="fell"
        number={5}
        eyebrow="How it fell"
        title="Cracks in the system"
        short={{
          says: "Enigma wasn’t broken by trying every setting. It was broken by clever people who spotted small weaknesses: no letter ever turned into itself, operators got lazy, and lots of messages started with the same words.",
          bigIdea: "Small mistakes added up to a big crack.",
        }}
        intro={
          <p>
            Enigma was not broken by trying every key. It was broken by people who found that each part of the system,
            the machine, the procedures and the operators, leaked a little, and that the leaks added up.
          </p>
        }
      >
        <Timeline label="Enigma's weaknesses" moments={WEAKNESSES} />
        <Onward />
      </Chapter>
    </main>
  );
}
