"use client";

import { Gloss, readable } from "@/components/glossary/gloss";
import { ROTORS, type Settings } from "@/lib/enigma";
import { keyspace, plugboardWays, roughly, rotorOrders } from "@/lib/keyspace";

const Part = readable(function Part({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-case-edge py-2">
      <summary className="cursor-pointer list-none font-semibold text-case-ink marker:hidden">
        <span className="mr-2 inline-block text-case-muted transition-transform group-open:rotate-90 motion-reduce:transition-none">›</span>
        {title}
      </summary>
      <div className="mt-2 space-y-2 pl-5 text-sm leading-relaxed text-case-muted">{children}</div>
    </details>
  );
});

/** What each setting under the lid does, written for someone seeing the machine for the first time. */
export function LidGuide({ settings }: { settings: Settings }) {
  const box = settings.model === "M4" ? 8 : 5;
  const cables = settings.plugboard.length;
  const [l, m, r] = settings.rotors;
  const keys = keyspace({ box, cables }) * (settings.model === "M4" ? 52n : 1n);
  const years = keys / 1_000_000n / 31_557_600n;

  return (
    <Gloss>
      <div className="mt-4">
        <h3 className="mb-1 text-[11px] font-semibold tracking-widest text-case-muted uppercase">How the parts work</h3>

        <Part title="Rotors">
          <p>
            Each rotor is a wheel with 26 contacts on each face and a tangle of 26 wires inside joining them, so a current
            that goes in on one letter comes out on another. Rotor I, for instance, sends A to E and B to K. Three rotors
            sit side by side, each scrambling what the last one gave it.
          </p>
          <p>
            The trick is that they move. Every key press turns the right rotor one place before the current flows, so
            the same key goes through different wires each time. Type AAAAA and you get five different letters.
          </p>
          <p>
            The army had a box of five rotors and chose three, in any order: {rotorOrders(5).toString()} ways to fit them.
            The navy had eight. You have {l}, {m} and {r} fitted, left to right.
          </p>
        </Part>

        <Part title="Notches and stepping">
          <p>
            Like a car&rsquo;s mileometer, the rotors carry each other round. Each rotor has a notch, and when its notch
            letter is showing in the window, the next key press turns the rotor to its left as well.
          </p>
          <p>
            Your right rotor, {r}, has its notch at {ROTORS[r].notches.split("").join(" and ")}; your middle rotor, {m}, at{" "}
            {ROTORS[m].notches.split("").join(" and ")}. So the middle rotor moves once every 26 letters, and the left one
            once every 650.
          </p>
          <p>
            The quirk is the double step. The middle rotor&rsquo;s own notch is read on the same mechanism, so when it
            reaches its notch letter it steps again on the very next key press, taking the left rotor with it. The
            middle rotor moves twice in a row, which shortened the machine&rsquo;s cycle and gave codebreakers something
            to work with.
          </p>
          <p>Rotors VI, VII and VIII, the navy&rsquo;s, have two notches each, so they turn their neighbour twice as often.</p>
        </Part>

        <Part title="Ring settings">
          <p>
            The letters you see in the windows are printed on a ring around each rotor, and the ring can be turned
            against the wiring inside. The ring setting (Ringstellung) says how far. It changes which letter shows for
            a given wiring position, and moves the notch along with the letters.
          </p>
          <p>
            So two machines showing the same letters but with different rings scramble differently. Turning a ring by
            one and its rotor by one together leaves the wiring where it was, which is why codebreakers could often
            ignore the left ring entirely.
          </p>
        </Part>

        <Part title="Start positions">
          <p>
            The three letters showing in the windows before the first key press. The day&rsquo;s key sheet set the
            rotors and rings, and each message began at a start position the operator picked and sent, itself
            enciphered, at the head of the message. Use the thumbwheels on the machine to set them.
          </p>
        </Part>

        <Part title="The reflector">
          <p>
            After the third rotor the current hits the reflector (Umkehrwalze), a fixed wheel that joins letters in
            pairs and sends the current back through all three rotors by a different route.
          </p>
          <p>
            This is why Enigma is its own inverse: if A lights G, then at the same settings G lights A, so one machine
            both enciphers and deciphers. It is also the machine&rsquo;s great weakness. Because the reflector never pairs a
            letter with itself, no letter can ever be enciphered as itself, and that single fact is what the crib dragger
            exploits.
          </p>
          {settings.model === "M4" && (
            <p>
              The navy&rsquo;s M4 squeezed a fourth wheel, the greek wheel {settings.greek}, in beside a thinner reflector.
              The greek wheel never turns, but the choice of two wheels and 26 positions multiplies the keys by 52.
            </p>
          )}
        </Part>

        <Part title="The plugboard">
          <p>
            The Steckerbrett on the front swaps pairs of letters with cables, once on the way in and again on the way
            out. Rotors alone could be worked out from their wiring; the plugboard is what made the numbers enormous.
          </p>
          <p>
            With {cables} {cables === 1 ? "cable" : "cables"} plugged there {cables === 1 ? "is" : "are"}{" "}
            {plugboardWays(cables).toLocaleString("en-GB")} {cables === 1 ? "way" : "ways"} to arrange them. With the ten
            the army used, there are 150,738,274,937,250.
          </p>
        </Part>

        <Part title="How many keys?">
          <p>
            A {settings.model} with {box} rotors to choose from, 17,576 start positions and {cables}{" "}
            {cables === 1 ? "cable" : "cables"} can be set {roughly(keys)} ways, before counting the rings. Trying a
            million keys a second, every second, would take {years < 1n ? "under a year" : `${roughly(years)} years`}.
          </p>
          <p>
            It was broken anyway, by mathematics, by captured material, by operators&rsquo; habits and by the reflector&rsquo;s
            flaw, never by trying every key.
          </p>
        </Part>
      </div>
    </Gloss>
  );
}
