"use client";

import { useMemo, useState } from "react";
import { RotorWindow } from "@/components/machine/rotor-window";
import { Demo } from "@/components/ui/demo";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_SETTINGS, ROTORS } from "@/lib/enigma";
import { history } from "@/lib/story/stepping";

const MAX = 700;
const SETTINGS = DEFAULT_SETTINGS;

/**
 * Three rotors carrying each other round like a mileometer. Drag through the
 * key presses: the right rotor turns every time, the middle one when the right
 * passes its notch, and the double step shows up as the middle rotor moving on
 * two presses running.
 */
export function SteppingDemo() {
  const moves = useMemo(() => history(SETTINGS, MAX), []);
  const [presses, setPresses] = useState(0);
  const windows = presses === 0 ? "AAA" : moves[presses - 1].windows;
  const now = presses === 0 ? null : moves[presses - 1];
  const [left, middle, right] = SETTINGS.rotors;
  const middleTurns = moves.filter((m) => m.middle);
  const leftTurns = moves.filter((m) => m.left);
  const x = (press: number) => `${(press / MAX) * 100}%`;

  const happened = !now
    ? "Every rotor at A, before any key is pressed."
    : now.left
      ? `Double step. The middle rotor was showing ${ROTORS[middle].notches}, its own notch, so it moved again and carried the left rotor with it.`
      : now.middle
        ? `Rotor ${right} passed its notch at ${ROTORS[right].notches}, so it carried the middle rotor on one.`
        : `Only the right rotor moved, as it does on every key press.`;

  return (
    <Demo title="Three rotors, stepping" prompt="Drag through the key presses">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="crinkle flex shrink-0 items-end gap-3 rounded-lg border border-case-edge px-4 py-3">
          {[left, middle, right].map((name, i) => (
            <RotorWindow key={name} label={name} position={windows.charCodeAt(i) - 65} />
          ))}
        </div>
        <div className="w-full flex-1">
          <Slider
            label="Key presses"
            value={presses}
            min={0}
            max={MAX}
            onChange={setPresses}
            format={(v) => v.toLocaleString("en-GB")}
            marks={leftTurns.slice(0, 1).map((m) => ({ value: m.press, label: "double step" }))}
          />
          <p className="mt-4 min-h-12 font-serif text-[1.05rem] leading-relaxed" aria-live="polite" data-testid="stepping-now">
            {happened}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative h-14 rounded-md bg-room" aria-hidden>
          {middleTurns.map((m) => (
            <span
              key={m.press}
              className={m.left ? "absolute bottom-0 h-full w-0.5 bg-chart-accent" : "absolute bottom-0 h-1/2 w-px bg-chart-mark"}
              style={{ left: x(m.press) }}
            />
          ))}
          <span className="absolute top-0 bottom-0 w-0.5 bg-room-ink" style={{ left: x(presses) }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-room-muted">
          <span>
            <span className="mr-1.5 inline-block h-2.5 w-px bg-chart-mark align-middle" />
            middle rotor turns ({middleTurns.length} in {MAX} presses)
          </span>
          <span>
            <span className="mr-1.5 inline-block h-3 w-0.5 bg-chart-accent align-middle" />
            double step, left rotor turns ({leftTurns.length})
          </span>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-room-muted">
        Three rotors at 26 positions each could make 17,576 combinations, but the double step skips some, so the machine
        comes back to where it started after 16,900 key presses. Until then the rotors never stand the same way twice. Army
        rules kept a message to 250 letters, sending anything longer in parts.
      </p>
    </Demo>
  );
}
