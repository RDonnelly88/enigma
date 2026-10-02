import Link from "next/link";
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
            enciphered, quickly, by tired signallers in the field, without a codebook that could be captured and read.
          </p>
          <p>
            Enigma was the answer Germany chose. Invented as a commercial product to keep business secrets, it was taken
            up by the navy, then the army and the air force, and made steadily harder to break. Tens of thousands were
            built. The Germans believed, with good mathematical reason, that messages sent on it could not be read.
          </p>
        </Prose>
        <Timeline label="The machine's history" moments={MACHINE_HISTORY} />
        <Aside>Its users thought it unbreakable. They were wrong for reasons that had little to do with the machine itself.</Aside>
      </Chapter>

      <Chapter
        id="how"
        number={2}
        eyebrow="How it works"
        title="Built up, one part at a time"
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
            Enigma&rsquo;s answer to letter counting was to keep changing the swap. The scrambling is done by rotors:
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
            That is the whole machine: keyboard, plugboard, three rotors, reflector, back through the rotors and the
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
            each letter as it lit. The result went to a radio operator, who sent it in Morse, usually in groups of five
            letters. At the other end the same routine ran backwards: copy down the Morse, type it into an identically set
            machine, and read the message off the lamps.
          </p>
        </Prose>
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
        intro={
          <p>
            Enigma&rsquo;s designers were right about the mathematics. Even with a captured machine in front of you, its
            wiring known, you still had to find the day&rsquo;s key among more possibilities than there are grains of sand
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
