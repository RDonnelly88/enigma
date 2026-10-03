"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, Volume2, VolumeX } from "lucide-react";
import { Intercepts } from "@/components/intercepts";
import { Incoming } from "@/components/machine/incoming";
import { Keyboard } from "@/components/machine/keyboard";
import { Lampboard } from "@/components/machine/lampboard";
import { LessonsPanel } from "@/components/machine/lessons-panel";
import { Lid } from "@/components/machine/lid";
import { Plugboard } from "@/components/machine/plugboard";
import { RotorWindow } from "@/components/machine/rotor-window";
import { ShareSecret } from "@/components/machine/share-secret";
import { Tape } from "@/components/machine/tape";
import { Transmitter } from "@/components/machine/transmitter";
import { Walkthrough } from "@/components/machine/walkthrough";
import { Wiring } from "@/components/machine/wiring";
import { Tabs } from "@/components/ui/tabs";
import { useHardwareKeys } from "@/hooks/use-hardware-keys";
import { useMachine } from "@/hooks/use-machine";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/enigma";
import { explain } from "@/lib/explain";
import { LESSONS } from "@/lib/lessons";
import { readMachineLink } from "@/lib/share";
import { playKey } from "@/lib/sound";

const SLOT_NAMES = ["Left", "Middle", "Right"] as const;
const STORE = "enigma.lessons";
type Panel = "lessons" | "trace" | "settings" | "messages";

/** Lessons finished on an earlier visit. Storage can be missing or refused; then it starts fresh. */
function storedLessons(): string[] {
  try {
    const raw = window.localStorage.getItem(STORE);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(ids) ? ids.filter((id): id is string => LESSONS.some((l) => l.id === id)) : [];
  } catch {
    return [];
  }
}

/**
 * The machine on a bench: the machine and its tape on one side, and on the
 * other everything about it, tabbed: the lessons, the trace of the last key
 * press, the settings under the lid, and messages to load, send or transmit.
 */
export function Bench({ lesson, incoming }: { lesson?: string | null; incoming?: string | null }) {
  const machine = useMachine(DEFAULT_SETTINGS);
  const { settings, configure, keyDown, keyUp, typeMessage, clear, restoreLessons } = machine;
  const [sound, setSound] = useState(true);
  const [panel, setPanel] = useState<Panel>("lessons");
  // Until a lesson is picked, show the linked one, else the one just finished so it can say what it
  // showed, else the first unfinished
  const [picked, setActive] = useState<string | null>(lesson && LESSONS.some((l) => l.id === lesson) ? lesson : null);
  const active = picked ?? machine.justCompleted ?? LESSONS.find((l) => !machine.completed.includes(l.id))?.id ?? LESSONS[0].id;
  const activeIndex = Math.max(0, LESSONS.findIndex((l) => l.id === active));
  const activeLesson = LESSONS[activeIndex];

  // Storage only exists in the browser, so earlier progress comes back after the first render
  useEffect(() => {
    restoreLessons(storedLessons());
  }, [restoreLessons]);
  const [secret, setSecret] = useState(incoming ?? null);
  const blocked = machine.errors.length > 0;

  const down = useCallback(
    (letter: string) => {
      if (sound && !machine.held && !blocked) playKey();
      keyDown(letter);
    },
    [sound, machine.held, blocked, keyDown],
  );
  useHardwareKeys(down, keyUp);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORE, JSON.stringify(machine.completed));
    } catch {}
  }, [machine.completed]);

  // Arriving with a key and its message, from the codebreaker or a shared link: set up and type it
  useEffect(() => {
    const link = readMachineLink(window.location.search);
    if (!link) return;
    configure(link.settings);
    if (link.text) typeMessage(link.text);
    window.history.replaceState(null, "", window.location.pathname);
  }, [configure, typeMessage]);

  const steps = useMemo(() => (machine.last ? explain(settings, machine.last) : []), [settings, machine.last]);
  // A new key press starts its story from the top
  const [selected, setSelected] = useState<{ press: unknown; step: number } | null>(null);
  const selectedStep = selected?.press === machine.last ? selected.step : null;
  const focus = selectedStep === null ? undefined : steps[selectedStep]?.hop;

  const turn = (slot: number, delta: number) => {
    const positions = [...settings.positions] as Settings["positions"];
    positions[slot] = (positions[slot] + delta + 26) % 26;
    configure({ ...settings, positions });
  };
  const setUp = (s: Settings) => {
    configure(s);
    clear();
  };
  // The key a message was sent on is where the rotors stood when it began
  const messageKey: Settings = { ...settings, positions: machine.start };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-8 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-brass uppercase">Enigma I · M3 · M4</p>
          <h1 className="mt-2 font-stencil text-4xl leading-none font-bold tracking-wide sm:text-5xl">The machine</h1>
          <p className="mt-3 max-w-2xl font-serif text-lg leading-relaxed text-room-ink/90">
            Press a key, on screen or on your own keyboard. Signals school walks you through what it&rsquo;s doing; the
            trace shows the current&rsquo;s route through every part, and the same settings turn the ciphertext back
            into the message.
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

      {secret && (
        <Incoming
          ciphertext={secret}
          onRead={(key) => {
            setUp(key);
            typeMessage(secret);
            setSecret(null);
            window.history.replaceState(null, "", window.location.pathname);
          }}
          onDismiss={() => setSecret(null)}
        />
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,38rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          {/* On a phone the lessons sit below the machine, so say what to do where the keys are */}
          <button
            type="button"
            onClick={() => {
              setPanel("lessons");
              document.getElementById("bench-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex items-start gap-3 rounded-lg border border-panel-edge bg-panel px-3 py-2.5 text-left text-sm lg:hidden"
            data-testid="lesson-strip"
          >
            <span className="mt-0.5 shrink-0 font-stencil text-xs font-bold text-brass">{activeIndex + 1}/{LESSONS.length}</span>
            <span className="min-w-0 flex-1">
              <span className="font-semibold">{activeLesson.title}. </span>
              <span className="text-room-muted">
                {machine.completed.includes(activeLesson.id) ? "Done: see what it showed below." : activeLesson.task}
              </span>
            </span>
            <ArrowDown className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
          </button>
          <section aria-label="The machine" className="stage wood rounded-xl p-2.5 shadow-2xl sm:p-4">
            <div className="crinkle relative flex flex-col items-center gap-6 overflow-hidden rounded-lg border border-case-edge px-2 py-5 sm:gap-7 sm:px-6 sm:py-6">
              <p className="nameplate rounded-sm px-4 py-0.5 font-stencil text-sm font-bold tracking-[0.5em]" aria-hidden>
                ENIGMA
              </p>
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
              <h2 className="mb-2 text-center font-stencil text-xs font-semibold tracking-[0.3em] text-case-muted uppercase">Steckerbrett</h2>
              <Plugboard pairs={settings.plugboard} onChange={(plugboard) => configure({ ...settings, plugboard })} />
            </div>
          </section>
          <Tape
            input={machine.input}
            output={machine.output}
            onRewind={machine.rewind}
            onClear={machine.clear}
            onMessage={typeMessage}
            disabled={blocked}
          />
        </div>

        <div id="bench-panel" className="min-w-0 scroll-mt-20">
          <Tabs
            label="About the machine"
            value={panel}
            onChange={setPanel}
            tabs={[
              { value: "lessons", label: "Lessons", badge: `${machine.completed.length}/${LESSONS.length}` },
              { value: "trace", label: "Trace" },
              { value: "settings", label: "Settings" },
              { value: "messages", label: "Messages" },
            ]}
          >
            {panel === "lessons" && (
              <LessonsPanel
                snapshot={machine}
                completed={machine.completed}
                active={active}
                onActive={setActive}
                onSetup={(id) => {
                  const setup = LESSONS.find((l) => l.id === id)?.setup;
                  if (setup) setUp(setup);
                }}
              />
            )}
            {panel === "trace" && (
              <div className="crinkle rounded-xl border border-case-edge p-4 text-case-ink">
                <p className="mb-4 text-sm text-case-muted">
                  {machine.last
                    ? `${machine.last.input} went in and lit ${machine.last.output}. Pick a step to see its part of the route.`
                    : "Press a key to trace the current through each part of the machine."}
                </p>
                <Wiring settings={settings} press={machine.last} focus={focus} />
                {steps.length > 0 && (
                  <div className="mt-6">
                    <Walkthrough
                      steps={steps}
                      selected={selectedStep}
                      onSelect={(step) => setSelected(step === null ? null : { press: machine.last, step })}
                    />
                  </div>
                )}
              </div>
            )}
            {panel === "settings" && (
              <div className="crinkle rounded-xl border border-case-edge p-4 text-case-ink">
                <Lid settings={settings} onChange={configure} />
              </div>
            )}
            {panel === "messages" && (
              <div className="flex flex-col gap-8">
                <section aria-labelledby="transmit">
                  <h2 id="transmit" className="mb-3 font-stencil text-xl font-bold tracking-wide">Transmit in Morse</h2>
                  <Transmitter text={machine.output} sound={sound} onTransmit={machine.markTransmitted} />
                </section>
                <section aria-labelledby="send">
                  <h2 id="send" className="mb-3 font-stencil text-xl font-bold tracking-wide">Send a secret</h2>
                  <ShareSecret settings={messageKey} ciphertext={machine.output} onShare={machine.markShared} />
                </section>
                <Intercepts
                  onLoad={(intercept) => setUp(intercept.settings)}
                  onType={typeMessage}
                />
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </main>
  );
}
