"use client";

import { useCallback, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Keyboard } from "@/components/machine/keyboard";
import { Lampboard } from "@/components/machine/lampboard";
import { Lid } from "@/components/machine/lid";
import { Plugboard } from "@/components/machine/plugboard";
import { RotorWindow } from "@/components/machine/rotor-window";
import { Tape } from "@/components/machine/tape";
import { Wiring } from "@/components/machine/wiring";
import { Intercepts } from "@/components/intercepts";
import { useHardwareKeys } from "@/hooks/use-hardware-keys";
import { useMachine } from "@/hooks/use-machine";
import type { Settings } from "@/lib/enigma";
import { playKey } from "@/lib/sound";

const SLOT_NAMES = ["Left", "Middle", "Right"] as const;

export default function Home() {
  const machine = useMachine();
  const { settings, configure, keyDown, keyUp } = machine;
  const [sound, setSound] = useState(true);
  const blocked = machine.errors.length > 0;

  const down = useCallback(
    (letter: string) => {
      if (sound && !machine.held && !blocked) playKey();
      keyDown(letter);
    },
    [sound, machine.held, blocked, keyDown],
  );
  useHardwareKeys(down, keyUp);

  const turn = (slot: number, delta: number) => {
    const positions = [...settings.positions] as Settings["positions"];
    positions[slot] = (positions[slot] + delta + 26) % 26;
    configure({ ...settings, positions });
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-4 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="sr-only">The machine</h1>
          <p className="max-w-prose text-sm text-room-muted">
            Set the rotors, plug the cables and press a key. The current runs through the machine and lights a lamp, and
            the same settings turn the ciphertext back into the message.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSound((s) => !s)}
          aria-label={sound ? "Mute" : "Unmute"}
          className="rounded-full p-2 text-room-muted hover:text-room-ink"
        >
          {sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,40rem)_minmax(0,1fr)]">
        <section aria-label="The machine" className="wood rounded-xl p-2.5 shadow-2xl sm:p-4">
          <div className="crinkle flex flex-col items-center gap-6 rounded-lg border border-case-edge px-2 py-5 sm:gap-8 sm:px-6 sm:py-7">
            <div className="flex items-end gap-3 rounded-md border border-case-edge bg-black/30 px-4 py-3 sm:gap-5">
              {settings.model === "M4" && (
                <RotorWindow
                  label={settings.greek}
                  position={settings.greekPosition}
                  onTurn={(delta) => configure({ ...settings, greekPosition: (settings.greekPosition + delta + 26) % 26 })}
                />
              )}
              {SLOT_NAMES.map((name, i) => (
                <RotorWindow key={name} label={settings.rotors[i]} position={settings.positions[i]} onTurn={(d) => turn(i, d)} />
              ))}
            </div>

            <Lampboard lit={machine.held?.output ?? null} />
            <div className="h-px w-full bg-case-edge" />
            <Keyboard held={machine.held?.input ?? null} disabled={blocked} onDown={down} onUp={keyUp} />

            {blocked && (
              <ul role="alert" className="w-full rounded-sm border border-danger/50 px-3 py-2 text-sm text-danger">
                {machine.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="crinkle mt-2.5 rounded-lg border border-case-edge px-3 py-4 sm:mt-4">
            <h2 className="mb-2 text-center font-stencil text-xs font-semibold tracking-[0.3em] text-case-muted uppercase">
              Steckerbrett
            </h2>
            <Plugboard pairs={settings.plugboard} onChange={(plugboard) => configure({ ...settings, plugboard })} />
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <Tape
            input={machine.input}
            output={machine.output}
            onRewind={machine.rewind}
            onClear={machine.clear}
            onMessage={machine.typeMessage}
            disabled={blocked}
          />

          <details className="crinkle group rounded-lg border border-case-edge text-case-ink" open>
            <summary className="cursor-pointer px-4 py-3 font-stencil text-sm font-bold tracking-widest uppercase">
              Inside the lid
            </summary>
            <div className="px-4 pb-4">
              <Lid settings={settings} onChange={configure} />
            </div>
          </details>

          <Intercepts
            onLoad={(intercept) => {
              configure(intercept.settings);
              machine.clear();
            }}
            onType={machine.typeMessage}
          />
        </div>
      </div>

      <section aria-labelledby="wiring" className="crinkle rounded-lg border border-case-edge p-4 text-case-ink">
        <h2 id="wiring" className="font-stencil text-sm font-bold tracking-widest uppercase">The current&rsquo;s path</h2>
        <p className="mb-4 text-sm text-case-muted">
          {machine.last
            ? `${machine.last.input} went in and lit ${machine.last.output}. The reflector sends every signal back by a different route, which is why a letter can never encrypt as itself.`
            : "Press a key to trace the current through each part of the machine."}
        </p>
        <Wiring settings={settings} press={machine.last} />
      </section>
    </main>
  );
}
