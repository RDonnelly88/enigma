import type { Metadata } from "next";
import Link from "next/link";
import { AirCoverScene, AtlanticHero, BoardingScene, SinkingScene } from "@/components/art/atlantic-scenes";
import { AsdicHunt } from "@/components/atlantic/asdic-hunt";
import { ConvoyRouter } from "@/components/atlantic/convoy-router";
import { M4Twin } from "@/components/atlantic/m4-twin";
import { Timeline } from "@/components/story/timeline";
import { Aside, Chapter, Prose } from "@/components/ui/chapter";
import { ChapterRail } from "@/components/ui/chapter-rail";
import { PageHero } from "@/components/ui/page-hero";
import { ATLANTIC_HISTORY } from "@/lib/story/atlantic";

export const metadata: Metadata = {
  title: "The U-boat war",
  description:
    "How Hut 8 fought the Battle of the Atlantic: the navy's Enigma, the captures at sea, the ten-month blackout of the four-rotor machine, and how it was broken.",
};

const CHAPTERS = [
  { id: "lifeline", title: "The lifeline" },
  { id: "navy", title: "The navy’s Enigma" },
  { id: "pinches", title: "Pinches" },
  { id: "blackout", title: "The blackout" },
  { id: "u559", title: "U-559" },
  { id: "shark", title: "The fourth wheel" },
  { id: "tide", title: "The tide turns" },
];

export default function TheUBoatWar() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <PageHero eyebrow="The Battle of the Atlantic" title="The U-boat war">
        <p>
          The longest battle of the war was fought over the supply line between North America and Britain. On one side,
          U-boats hunting in packs; on the other, convoys of merchant ships and their escorts. Between them, in a hut at
          Bletchley Park, a small team trying to read the navy&rsquo;s Enigma.
        </p>
      </PageHero>
      <AtlanticHero />
      <ChapterRail chapters={CHAPTERS} />

      <Chapter
        id="lifeline"
        number={1}
        eyebrow="1939 to 1941"
        title="The lifeline"
        short={{
          says: "Britain needed ships from America to bring food, fuel and weapons. German submarines, called U-boats, hunted them in groups called wolfpacks. To work together, the U-boats had to talk by radio, and their messages were in Enigma.",
          bigIdea: "The U-boats needed the radio, so whoever could read it could find them.",
        }}
        intro={
          <p>
            An island cannot fight without ships. Britain needed food, oil and weapons from across the Atlantic every week,
            and Germany&rsquo;s plan was to sink them faster than they could be built.
          </p>
        }
      >
        <Prose>
          <p>
            Merchant ships crossed together in convoys, guarded by warships. Admiral Karl Dönitz, who commanded the U-boats,
            answered with the wolfpack: a line of U-boats spread across a convoy&rsquo;s likely path. The first to sight it
            shadowed it and reported by radio; headquarters in France called the rest in, and they attacked together at night.
          </p>
          <p>
            It worked, and it depended on the radio. Every pack was run from ashore: orders out, sightings, positions,
            fuel and weather back. The U-boats talked constantly, sure that Enigma kept every word of it secret.
          </p>
        </Prose>
        <Aside source="Winston Churchill, The Second World War">
          &ldquo;The only thing that ever really frightened me during the war was the U-boat peril.&rdquo;
        </Aside>
      </Chapter>

      <Chapter
        id="navy"
        number={2}
        eyebrow="Hut 8"
        title="The navy’s Enigma"
        short={{
          says: "The German navy used Enigma more carefully than the army or air force. It had more rotors to choose from, and its operators couldn’t pick easy message keys. At Bletchley, Hut 8, led by Alan Turing, took it on when hardly anyone else thought it could be done.",
          bigIdea: "The navy’s Enigma was the hardest, because it was used the most carefully.",
        }}
        intro={
          <p>
            The navy had adopted Enigma first, and it used it best. Where the army and the air force left openings, the navy
            closed them.
          </p>
        }
      >
        <Prose>
          <p>
            A naval operator chose his three rotors from eight, not five: the navy had three of its own, VI, VII and VIII,
            each with two notches. He did not make up his message key either. It came from a book, and it was disguised with
            tables of letter pairs before it went out, so the habits that gave the army&rsquo;s keys away were not there to
            find.
          </p>
          <p>
            At Bletchley the navy&rsquo;s Enigma went to Hut 8, and to Alan Turing, who took it on in 1939 partly because no
            one else was working on it. He worked out how the indicators were built, and invented a statistical method,
            Banburismus, that cut down the rotor orders to try. What Hut 8 lacked was the books: without the tables that
            disguised the keys, it could not read a day&rsquo;s traffic however clever it was. The answer was to take them.
          </p>
          <p>
            The rotors you can fit on the <Link href="/machine" className="text-brass underline underline-offset-2">machine</Link>{" "}
            include the navy&rsquo;s three, and its four-rotor M4.
          </p>
        </Prose>
      </Chapter>

      <Chapter
        id="pinches"
        number={3}
        eyebrow="1941"
        title="Pinches"
        short={{
          says: "In 1941 the Royal Navy captured German codebooks and Enigma keys from ships and a U-boat, U-110. Hut 8 used them to read the U-boats’ messages, and convoys were steered around the waiting wolfpacks. Fewer ships were sunk.",
          bigIdea: "Captured codebooks let Hut 8 read the U-boats, and ships stopped being sunk.",
        }}
        intro={
          <p>
            Bletchley called them pinches: captures of keys, codebooks or machines, some planned and some lucky. In the spring
            of 1941 there were three in two months.
          </p>
        }
      >
        <Prose>
          <p>
            In March a commando raid on the Lofoten Islands took the trawler Krebs, with spare rotors and February&rsquo;s keys.
            In May a cruiser force went looking for a German weather ship, the München, alone in the sea north-east of Iceland,
            and captured her for the keys she carried for June.
          </p>
          <p>
            Two days later, on 9 May, U-110 attacked a convoy south of Iceland, and the escort group led by the destroyer HMS
            Bulldog depth-charged it to the surface. Its crew abandoned ship, sure it would sink. It didn&rsquo;t. Sub-Lieutenant David
            Balme led a boarding party down the hatch and passed up the Enigma machine, the codebooks and the charts. U-110 sank under tow the next day, and
            her crew, held below on the British ships, never knew it had been boarded. The secret was kept until the 1950s.
          </p>
        </Prose>
        <BoardingScene />
        <Prose>
          <p>
            With a second weather ship&rsquo;s July keys and what Hut 8 had learnt from the books, the U-boats&rsquo; signals
            could now be read, often within hours. In the Admiralty&rsquo;s Submarine Tracking Room, Rodger Winn plotted where
            the packs were waiting, and convoys were steered round them. Sinkings fell steeply through the second half of 1941.
          </p>
        </Prose>
      </Chapter>

      <Chapter
        id="blackout"
        number={4}
        eyebrow="1942"
        title="The blackout"
        short={{
          says: "In February 1942 the Atlantic U-boats got a new Enigma machine with a fourth wheel. Bletchley called their key Shark, and couldn’t read it for ten months. Without it, convoys had to guess where the wolfpacks were, and many more ships were sunk.",
          bigIdea: "When the reading stopped, convoys sailed blind, and the losses rose.",
        }}
        intro={
          <p>
            On 1 February 1942 the Atlantic U-boats switched to a new machine and a new key. Hut 8 called it Shark. From that
            day, it could not read a word.
          </p>
        }
      >
        <Prose>
          <p>
            The new machine was the M4, with a fourth wheel squeezed in beside a thinner reflector. It made the search 26 times
            longer, and the Bombes were already working flat out on the three-rotor keys. The tracking room went back to what
            it had before: sightings, and the bearings of U-boat radio signals taken from stations ashore.
          </p>
          <p>
            1942 was the U-boats&rsquo; best year. Part of that had nothing to do with Enigma: the United States was now in the
            war, and for months ships sailed alone along its east coast, lit up against the shore. But in the open Atlantic the
            convoys were sailing blind again, into more U-boats than ever. And there was a twist: the German navy&rsquo;s own
            codebreakers, the B-Dienst, were reading the code the Allies used to route their convoys. The U-boats knew where the
            convoys were going, and Hut 8 could no longer see the U-boats.
          </p>
        </Prose>
        <ConvoyRouter />
      </Chapter>

      <Chapter
        id="u559"
        number={5}
        eyebrow="30 October 1942"
        title="U-559"
        short={{
          says: "In 1942 British sailors forced a U-boat, U-559, to the surface near Egypt. Two of them, Tony Fasson and Colin Grazier, swam to it as it sank and passed up its codebooks to a 16-year-old canteen assistant, Tommy Brown. Fasson and Grazier drowned when it went down. The books they saved helped break Shark.",
          bigIdea: "Two sailors gave their lives for the codebooks that broke Shark.",
        }}
        intro={
          <p>
            The way back in came from the other end of the war, in the eastern Mediterranean, off Port Said, and it cost two
            lives.
          </p>
        }
      >
        <Prose>
          <p>
            On 30 October 1942, after a day of depth-charging, the destroyer HMS Petard and her group forced U-559 to the
            surface. Her crew got out. Holed and filling with water, the U-boat stayed afloat a little longer, and three men from
            Petard went over to her: Lieutenant Tony Fasson, Able Seaman Colin Grazier, and Tommy Brown, a canteen assistant
            who had lied about his age to serve and was 16.
          </p>
          <p>
            Fasson and Grazier went down into the dark, flooding control room and found the documents. They passed them up to
            Brown at the top of the conning tower, who handed them down to the boat alongside, load after load. Then U-559 sank suddenly. Brown got clear. Fasson and Grazier went down with
            her.
          </p>
        </Prose>
        <SinkingScene />
        <Prose>
          <p>
            Among what they saved were the current editions of two books: the short signal book the U-boats used to send
            sightings in a few letters, and the short weather cipher, which squeezed a weather report into a handful. Fasson and
            Grazier were awarded the George Cross after their deaths, and Brown the George Medal. None of them could be told
            why it had mattered.
          </p>
        </Prose>
        <Aside>Their medals were announced in 1943. Why they had earned them stayed secret for more than thirty years.</Aside>
      </Chapter>

      <Chapter
        id="shark"
        number={6}
        eyebrow="13 December 1942"
        title="The fourth wheel"
        short={{
          says: "The U-boats sent weather reports every day. With the captured weather book, Hut 8 could guess exactly what a report said, which gave it cribs. And there was a weakness in the new machine: with its fourth wheel at A, it worked exactly like the old three-rotor one, so the old Bombes could still be used.",
          bigIdea: "Weather reports gave the cribs, and the old Bombes could still do the work.",
        }}
        intro={
          <p>
            The books reached Bletchley in late November. On 13 December 1942, after ten months, Hut 8 read Shark again, and
            within hours the tracking room had U-boat positions.
          </p>
        }
      >
        <Prose>
          <p>
            The weather was the way in. U-boats reported the weather every day in the short weather cipher, and the German
            weather service broadcast those reports again for its own forecasters, in a cipher Bletchley could already read.
            With the weather book, Hut 8 could rebuild exactly what a U-boat had typed before enciphering it. That was a crib,
            and a crib was all a Bombe needed.
          </p>
          <p>
            The fourth wheel was the other problem, and it had a flaw. It never moved while a message was typed, so with the thin
            reflector beside it, it behaved like one fixed reflector, a different one for each of its 26 places. At one of those
            places, A, it was exactly the old reflector B. The M4 was a three-rotor Enigma with a choice of 26 reflectors, and
            the three-rotor Bombes could be wired for each in turn. Turn the wheel below and see.
          </p>
        </Prose>
        <M4Twin />
        <Prose>
          <p>
            That was 26 runs for every key, on Bombes already stretched. Bletchley&rsquo;s own four-rotor Bombes were slow to
            come and unreliable. The answer came from America: the US Navy, building on Bletchley&rsquo;s designs, had a fast
            four-rotor Bombe designed by Joseph Desch at the National Cash Register company in Dayton, Ohio. From the summer of
            1943, more than a hundred of them, run by the women of the US Navy&rsquo;s WAVES in Washington, took on more and
            more of the Shark work.
          </p>
        </Prose>
      </Chapter>

      <Chapter
        id="tide"
        number={7}
        eyebrow="1943"
        title="The tide turns"
        short={{
          says: "In 1943 the Allies won the Battle of the Atlantic. Reading Shark helped, along with radar, aircraft that could fly further out to sea, and more warships. In May 1943 so many U-boats were sunk that Germany pulled them out of the North Atlantic.",
          bigIdea: "Codebreaking helped win the Atlantic, as one weapon among several.",
        }}
        intro={
          <p>
            March 1943 brought the biggest convoy battles of the war. Two months later, the U-boats had lost.
          </p>
        }
      >
        <Prose>
          <p>
            Shark was not read every day. A new edition of the weather book that March blinded Hut 8 again for a time, and some
            days were read too late to use. But the reading came back, and by then it was not working alone. Long-range aircraft
            now closed the gap in mid-ocean where U-boats had been safe from the air. Escorts carried radar that found a U-boat
            on the surface at night, and direction finders that took a bearing on its radio the moment it reported. Once it
            dived, they hunted it with ASDIC, a beam of sound sent through the water that echoed back off its hull. Support
            groups of warships hunted the packs instead of waiting for them, and small escort carriers brought aircraft with the
            convoy.
          </p>
          <p>
            In May 1943 more than forty U-boats were lost. On 24 May Dönitz withdrew his boats from the North Atlantic. They
            came back, but never again with the upper hand, and for the rest of the war Shark was read, more often than not, in
            time to use.
          </p>
          <p>
            How much did Enigma matter? It did not win the Atlantic on its own, and no one at Bletchley claimed it had. What it
            did was let the Allies put their ships where the U-boats weren&rsquo;t, and their escorts where they were. In 1941
            that was the difference between a convoy arriving and not. In 1943 it was the difference between losing and winning.
          </p>
        </Prose>
        <AsdicHunt />
        <AirCoverScene />
        <Timeline label="The war against the U-boats" moments={ATLANTIC_HISTORY} />
      </Chapter>
    </main>
  );
}
