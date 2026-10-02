/**
 * Plain-English account of one key press: why each rotor moved, and what
 * each part of the machine did to the current, with the arithmetic shown.
 * Everything here is worked out from the settings and the recorded path, so
 * it can't drift from what the machine actually did.
 */

import { GREEK_ROTORS, REFLECTORS, ROTORS, toLetter, type Hop, type Keypress, type Settings } from "./enigma";

export type Step = {
  title: string;
  body: string;
  /** Which hop of the path this step describes, so the diagram can pick it out. */
  hop?: number;
};

const SLOTS = ["left", "middle", "right"] as const;

/** "turned 3 places", "not turned", or "turned 1 place" */
function turned(shift: number) {
  const n = ((shift % 26) + 26) % 26;
  return n === 0 ? "isn't turned at all" : `is turned ${n} ${n === 1 ? "place" : "places"} round`;
}

function stepping(settings: Settings, press: Keypress): Step {
  const [, middleRotor, rightRotor] = settings.rotors;
  const [left0, middle0, right0] = press.before;
  const [left1, middle1] = press.positions;
  const rightNotch = ROTORS[rightRotor].notches;
  const middleNotch = ROTORS[middleRotor].notches;
  const lines = [`Pressing a key turns the rotors before any current flows. The right rotor (${rightRotor}) always moves on one: ${toLetter(right0)} to ${toLetter(right0 + 1)}.`];

  const middleMoved = middle1 !== middle0;
  const leftMoved = left1 !== left0;
  const rightAtNotch = rightNotch.includes(toLetter(right0));
  const middleAtNotch = middleNotch.includes(toLetter(middle0));

  if (rightAtNotch) {
    lines.push(
      `Rotor ${rightRotor} was showing ${toLetter(right0)}, its notch letter, so it carried the middle rotor (${middleRotor}) with it: ${toLetter(middle0)} to ${toLetter(middle1)}.`,
    );
  }
  if (middleAtNotch) {
    lines.push(
      `The middle rotor was showing ${toLetter(middle0)}, its own notch letter, so it stepped${rightAtNotch ? "" : " itself"} and carried the left rotor too: ${toLetter(left0)} to ${toLetter(left1)}. This is the double step: the middle rotor moves on two key presses in a row.`,
    );
  }
  if (!middleMoved && !leftMoved) {
    const next = rightNotch.split("").map((n) => `${n}`).join(" or ");
    lines.push(`The middle rotor stays put until rotor ${rightRotor} shows ${next}.`);
  }
  return { title: "The rotors step", body: lines.join(" ") };
}

function wheelName(settings: Settings, stage: Hop["stage"]) {
  if (stage === "greek") return settings.greek;
  const slot = SLOTS.indexOf(stage as (typeof SLOTS)[number]);
  return settings.rotors[slot];
}

function wheelStep(settings: Settings, press: Keypress, hop: Hop, index: number): Step {
  const greek = hop.stage === "greek";
  const slot = SLOTS.indexOf(hop.stage as (typeof SLOTS)[number]);
  const name = wheelName(settings, hop.stage);
  const wiring = greek ? GREEK_ROTORS[settings.greek].wiring : ROTORS[settings.rotors[slot]].wiring;
  const position = greek ? settings.greekPosition : press.positions[slot];
  const ring = greek ? settings.greekRing : settings.rings[slot];
  const shift = position - ring;
  const label = greek ? `Greek wheel ${name}` : `Rotor ${name}`;
  const where = greek ? "beside the reflector" : `in the ${hop.stage} slot`;
  const setting = `It shows ${toLetter(position)} with its ring at ${toLetter(ring)}, so its wiring ${turned(shift)}`;

  const n = ((shift % 26) + 26) % 26;
  if (hop.direction === "in") {
    const face = toLetter(hop.from + shift);
    const wired = wiring[(hop.from + n) % 26];
    return {
      hop: index,
      title: `${label}, on the way in`,
      body:
        n === 0
          ? `${label} sits ${where}. ${setting}. The current arrives on contact ${toLetter(hop.from)}, and ${label} wires ${face} to ${wired}, so it comes out on contact ${toLetter(hop.to)}.`
          : `${label} sits ${where}. ${setting}. The current arrives on contact ${toLetter(hop.from)}, which now touches the wire starting at ${face}. ${label} wires ${face} to ${wired}, and turned back ${n}, that comes out on contact ${toLetter(hop.to)}.`,
    };
  }
  const face = toLetter(hop.from + shift);
  const start = toLetter(wiring.indexOf(face));
  return {
    hop: index,
    title: `${label}, on the way back`,
    body:
      n === 0
        ? `Coming back, the current runs through the same wires the other way. It arrives on contact ${toLetter(hop.from)}, the end of the wire from ${start}, so it leaves on contact ${toLetter(hop.to)}.`
        : `Coming back, the current runs through the same wires the other way. Contact ${toLetter(hop.from)} now touches the end of the wire from ${start} to ${face}, so it leaves by ${start}, which turned back ${n} is contact ${toLetter(hop.to)}.`,
  };
}

export function explain(settings: Settings, press: Keypress): Step[] {
  const steps: Step[] = [
    {
      title: `You press ${press.input}`,
      body: `The key closes a circuit. Battery current will run into the machine on the ${press.input} wire, and the lamp it finally reaches is the letter of the ciphertext.`,
    },
    stepping(settings, press),
  ];

  press.path.forEach((hop, i) => {
    if (hop.stage === "plugboard") {
      const plugged = hop.from !== hop.to;
      const way = hop.direction === "in" ? "on its way in" : "on its way out";
      steps.push({
        hop: i,
        title: hop.direction === "in" ? "The plugboard, going in" : "The plugboard, coming out",
        body: plugged
          ? `${toLetter(hop.from)} has a cable to ${toLetter(hop.to)}, so ${way} the current swaps to ${toLetter(hop.to)}.`
          : `${toLetter(hop.from)} has no cable, so ${way} the current passes straight through as ${toLetter(hop.from)}.`,
      });
    } else if (hop.stage === "reflector") {
      steps.push({
        hop: i,
        title: `Reflector ${settings.reflector}`,
        body: `The reflector doesn't turn. It joins letters in fixed pairs and sends the current back the way it came by a different wire: ${toLetter(hop.from)} is paired with ${REFLECTORS[settings.reflector][hop.from]}. Because no letter is paired with itself, a key can never light its own lamp.`,
      });
    } else {
      steps.push(wheelStep(settings, press, hop, i));
    }
  });

  const last = press.path.at(-1)!;
  steps.push({
    title: `Lamp ${press.output} lights`,
    body: `The current reaches the lampboard on the ${toLetter(last.to)} wire. Press ${press.output} with the rotors set the same way and the current runs this exact route backwards to light ${press.input}: that is why the same settings both encrypt and decrypt.`,
  });
  return steps;
}
