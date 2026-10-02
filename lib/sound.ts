/**
 * The machine's noises, synthesised so there are no audio files to load: a
 * short filtered noise burst for a key or a rotor click, and a lower thunk
 * for the key bottoming out.
 */
let context: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  context ??= new AudioContext();
  // Browsers start the context suspended until the page has been interacted with
  if (context.state === "suspended") void context.resume();
  return context;
}

function burst(ctx: AudioContext, { at, length, frequency, gain }: { at: number; length: number; frequency: number; gain: number }) {
  const samples = Math.ceil(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < samples; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / samples) ** 3;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = 1.4;
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
