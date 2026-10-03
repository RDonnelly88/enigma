/**
 * The site's noises, synthesised so there are no audio files to load: the
 * machine's keys and rotors, a Bombe's drums, a teleprinter, a rubber stamp.
 * Every one plays only in answer to something the reader did, and none plays
 * once they have turned sound off.
 */
let context: AudioContext | null = null;

const muted = () => typeof document !== "undefined" && document.documentElement.getAttribute("data-sound") === "off";

/** Whether a sound may play: in a browser, with sound not turned off. */
export const soundOn = () => typeof window !== "undefined" && !muted();

function audio() {
  if (typeof window === "undefined" || typeof AudioContext === "undefined" || muted()) return null;
  context ??= new AudioContext();
  // Browsers start the context suspended until the page has been interacted with
  if (context.state === "suspended") void context.resume();
  return context;
}

function burst(ctx: AudioContext, { at, length, frequency, gain, q = 1.4 }: { at: number; length: number; frequency: number; gain: number; q?: number }) {
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
  source.connect(filter).connect(volume).connect(ctx.destination);
  source.start(at);
}

export function playKey() {
  const ctx = audio();
  if (!ctx) return;
  burst(ctx, { at: ctx.currentTime, length: 0.03, frequency: 2600, gain: 0.5 });
  burst(ctx, { at: ctx.currentTime + 0.018, length: 0.06, frequency: 420, gain: 0.9 });
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
