/**
 * The site's noises, synthesised so there are no audio files to load: the
 * machine's keys and rotors, Morse, a teleprinter, a Bombe's drums, a rubber
 * stamp, a clock striking and aircraft overhead.
 * Every one plays only in answer to something the reader did, and none plays
 * once they have turned sound off.
 */
import { timeline } from "./morse";

let context: AudioContext | null = null;

const muted = () => typeof document !== "undefined" && document.documentElement.getAttribute("data-sound") === "off";

function audio() {
  if (typeof window === "undefined" || typeof AudioContext === "undefined" || muted()) return null;
  context ??= new AudioContext();
  // Browsers start the context suspended until the page has been interacted with
  if (context.state === "suspended") void context.resume();
  return context;
}

function burst(
  ctx: AudioContext,
  { at, length, frequency, gain, q = 1.4 }: { at: number; length: number; frequency: number; gain: number; q?: number },
  to: AudioNode = ctx.destination,
) {
  const samples = Math.ceil(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < samples; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / samples) ** 3;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = q;
  const volume = ctx.createGain();
  volume.gain.value = gain;
  source.connect(filter).connect(volume).connect(to);
  source.start(at);
}

/**
 * A key going down, which on an Enigma struck like a typewriter's: the click of
 * the key, the clack of the bar hitting home and the rotor ratchet under it.
 * Each strike varies a little, so a run of them doesn't sound like a loop.
 */
export function playKey() {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const vary = (n: number) => n * (0.9 + Math.random() * 0.2);
  burst(ctx, { at: t, length: 0.012, frequency: vary(4200), gain: 0.45, q: 3 });
  burst(ctx, { at: t + vary(0.022), length: 0.05, frequency: vary(1500), gain: 0.9, q: 2.2 });
  burst(ctx, { at: t + 0.026, length: 0.09, frequency: vary(220), gain: 1.1, q: 0.9 });
  burst(ctx, { at: t + 0.06, length: 0.015, frequency: vary(3400), gain: 0.25, q: 4 });
}

export function playRotor() {
  const ctx = audio();
  if (!ctx) return;
  burst(ctx, { at: ctx.currentTime, length: 0.02, frequency: 3800, gain: 0.35 });
}

/** A rubber stamp coming down: a dull thump with a slap on top. */
export function playStamp() {
  const ctx = audio();
  if (!ctx) return;
  burst(ctx, { at: ctx.currentTime, length: 0.12, frequency: 160, gain: 1.4, q: 0.8 });
  burst(ctx, { at: ctx.currentTime + 0.005, length: 0.04, frequency: 1800, gain: 0.4 });
}

/**
 * A Bombe running: a low motor hum under the rattle of drums stepping, until
 * stopped. Returns the function that stops it.
 */
export function startBombe(): () => void {
  const ctx = audio();
  if (!ctx) return () => {};
  const hum = ctx.createOscillator();
  hum.type = "sawtooth";
  hum.frequency.value = 52;
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 180;
  const level = ctx.createGain();
  level.gain.setValueAtTime(0, ctx.currentTime);
  level.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.3);
  hum.connect(low).connect(level).connect(ctx.destination);
  hum.start();
  // The drums clicking round, scheduled a little ahead on the audio clock
  let next = ctx.currentTime;
  const rattle = setInterval(() => {
    while (next < ctx.currentTime + 0.2) {
      burst(ctx, { at: next, length: 0.012, frequency: 2400 + Math.random() * 800, gain: 0.12 });
      next += 0.045;
    }
  }, 100);
  return () => {
    clearInterval(rattle);
    level.gain.cancelScheduledValues(ctx.currentTime);
    level.gain.setValueAtTime(level.gain.value, ctx.currentTime);
    level.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
    hum.stop(ctx.currentTime + 0.3);
  };
}

/** A tone keyed on and off in Morse on the shared clock, the same note everywhere. Returns its length and how to cut it short. */
export function playMorse(text: string, wpm: number): { duration: number; stop: () => void } {
  const { tones, duration } = timeline(text, wpm);
  const ctx = audio();
  if (!ctx || tones.length === 0) return { duration, stop: () => {} };
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 650;
  gain.gain.value = 0;
  osc.connect(gain).connect(ctx.destination);
  const t0 = ctx.currentTime + 0.05;
  // Short ramps at each edge, or every tone clicks
  for (const tone of tones) {
    const a = t0 + tone.start / 1000;
    const b = a + tone.duration / 1000;
    gain.gain.setValueAtTime(0, a);
    gain.gain.linearRampToValueAtTime(0.25, a + 0.005);
    gain.gain.setValueAtTime(0.25, b - 0.005);
    gain.gain.linearRampToValueAtTime(0, b);
  }
  osc.start(t0);
  osc.stop(t0 + duration / 1000 + 0.1);
  return {
    duration,
    stop: () => {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      // It may already have finished, and stopping a finished note throws
      try {
        osc.stop();
      } catch {}
    },
  };
}

/** A teleprinter hammering out a message, a little irregular, as the real ones were. Returns how to cut it short. */
export function playTeleprinter(letters: number): () => void {
  const ctx = audio();
  if (!ctx) return () => {};
  const out = ctx.createGain();
  out.connect(ctx.destination);
  let at = ctx.currentTime;
  for (let i = 0; i < letters; i++) {
    burst(ctx, { at, length: 0.025, frequency: 1900 + Math.random() * 600, gain: 0.3 }, out);
    burst(ctx, { at: at + 0.01, length: 0.03, frequency: 300, gain: 0.45 }, out);
    at += 0.06 + Math.random() * 0.025;
  }
  return () => out.disconnect();
}

/** A wall clock striking the hour: a bell note with its overtones, dying away under the next. Returns how to cut it short. */
export function playStrikes(count: number): () => void {
  const ctx = audio();
  if (!ctx) return () => {};
  const out = ctx.createGain();
  out.gain.value = 0.22;
  out.connect(ctx.destination);
  for (let n = 0; n < count; n++) {
    const at = ctx.currentTime + n * 1.1;
    // A bell's partials are not whole multiples of the note, which is what makes it a bell
    for (const [ratio, level] of [[1, 1], [2.76, 0.45], [5.4, 0.2], [0.5, 0.35]]) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.frequency.value = 330 * ratio;
      env.gain.setValueAtTime(0, at);
      env.gain.linearRampToValueAtTime(level, at + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, at + 2.4 / Math.sqrt(ratio));
      osc.connect(env).connect(out);
      osc.start(at);
      osc.stop(at + 2.5);
    }
  }
  return () => out.disconnect();
}

/**
 * Bombers passing overhead: unsynchronised engines beating against each other,
 * growing out of the distance and dropping in pitch as they go over. Returns
 * how to cut it short.
 */
export function playAircraft(seconds = 9): () => void {
  const ctx = audio();
  if (!ctx) return () => {};
  const t = ctx.currentTime;
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.setValueAtTime(300, t);
  low.frequency.linearRampToValueAtTime(900, t + seconds * 0.5);
  low.frequency.linearRampToValueAtTime(250, t + seconds);
  const level = ctx.createGain();
  level.gain.setValueAtTime(0.0001, t);
  level.gain.exponentialRampToValueAtTime(0.16, t + seconds * 0.5);
  level.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  low.connect(level).connect(ctx.destination);
  const engines = [86, 88.5, 91, 129].map((hz) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(hz * 1.04, t);
    osc.frequency.linearRampToValueAtTime(hz * 0.96, t + seconds);
    osc.connect(low);
    osc.start(t);
    osc.stop(t + seconds);
    return osc;
  });
  return () => {
    level.gain.cancelScheduledValues(ctx.currentTime);
    level.gain.setValueAtTime(level.gain.value, ctx.currentTime);
    level.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    for (const e of engines) e.stop(ctx.currentTime + 0.35);
  };
}

/** A guess being checked: a quick run of relay clicks, the checking machine working through the menu. */
export function playChecking(clicks = 6) {
  const ctx = audio();
  if (!ctx) return;
  for (let i = 0; i < clicks; i++) {
    burst(ctx, { at: ctx.currentTime + i * 0.11 + Math.random() * 0.02, length: 0.015, frequency: 3000 + Math.random() * 800, gain: 0.35, q: 3 });
  }
}

/** A check that fails: a short, dull buzz. */
export function playReject() {
  const ctx = audio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const level = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 110;
  level.gain.setValueAtTime(0.0001, ctx.currentTime);
  level.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
  level.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
  osc.connect(level).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}
