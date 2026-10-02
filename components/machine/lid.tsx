"use client";

import {
  ALPHABET,
  GREEK_ROTORS,
  M3_REFLECTORS,
  M4_REFLECTORS,
  ROTORS,
  type GreekName,
  type ReflectorName,
  type RotorName,
  type Settings,
} from "@/lib/enigma";
import { cn } from "@/lib/cn";
import { LidGuide } from "./lid-guide";

const SLOTS = ["Left", "Middle", "Right"] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold tracking-widest text-case-muted uppercase">{label}</span>
      {children}
    </label>
  );
}

const select =
  "rounded-sm border border-case-edge bg-key px-2 py-1.5 font-stencil text-base font-semibold text-case-ink focus-visible:outline-2 focus-visible:outline-lamp-on";

/** Ring settings were marked A to Z on some machines and 01 to 26 on others. */
function RingSelect({ label, value, onChange }: { label: string; value: number; onChange: (ring: number) => void }) {
  return (
    <Field label={label}>
      <select className={select} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {ALPHABET.split("").map((letter, i) => (
          <option key={letter} value={i}>
            {letter} · {String(i + 1).padStart(2, "0")}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Lid({ settings, onChange }: { settings: Settings; onChange: (settings: Settings) => void }) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const reflectors = settings.model === "M4" ? M4_REFLECTORS : M3_REFLECTORS;

  return (
    <div className="grid gap-5">
      <fieldset className="inline-flex w-fit rounded-sm border border-case-edge p-0.5">
        <legend className="sr-only">Model</legend>
        {(["M3", "M4"] as const).map((model) => (
          <button
            key={model}
            type="button"
            aria-pressed={settings.model === model}
            onClick={() =>
              model !== settings.model &&
              set({ model, reflector: model === "M4" ? "B Thin" : "B" })
            }
            className={cn(
              "rounded-[1px] px-3 py-1 font-stencil text-sm font-bold tracking-wider",
              settings.model === model ? "bg-metal text-key" : "text-case-muted hover:text-case-ink",
            )}
          >
            {model === "M3" ? "M3 · Army" : "M4 · Navy"}
          </button>
        ))}
      </fieldset>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Reflector">
          <select className={select} value={settings.reflector} onChange={(e) => set({ reflector: e.target.value as ReflectorName })}>
            {reflectors.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        {settings.model === "M4" && (
          <Field label="Greek wheel">
            <select className={select} value={settings.greek} onChange={(e) => set({ greek: e.target.value as GreekName })}>
              {Object.keys(GREEK_ROTORS).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
        )}
        {SLOTS.map((slot, i) => (
          <Field key={slot} label={`${slot} rotor`}>
            <select
              className={select}
              value={settings.rotors[i]}
              onChange={(e) => {
                const rotors = [...settings.rotors] as Settings["rotors"];
                const chosen = e.target.value as RotorName;
                // Each rotor existed once per machine, so taking one from another slot swaps them
                const elsewhere = rotors.indexOf(chosen);
                if (elsewhere >= 0) rotors[elsewhere] = rotors[i];
                rotors[i] = chosen;
                set({ rotors });
              }}
            >
              {Object.keys(ROTORS).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <span className="text-xs text-case-muted">
              Notch {ROTORS[settings.rotors[i]].notches.split("").join(" & ")}
            </span>
          </Field>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {settings.model === "M4" && (
          <RingSelect label="Greek ring" value={settings.greekRing} onChange={(greekRing) => set({ greekRing })} />
        )}
        {SLOTS.map((slot, i) => (
          <RingSelect
            key={slot}
            label={`${slot} ring`}
            value={settings.rings[i]}
            onChange={(ring) => {
              const rings = [...settings.rings] as Settings["rings"];
              rings[i] = ring;
              set({ rings });
            }}
          />
        ))}
      </div>

      <LidGuide settings={settings} />
    </div>
  );
}
