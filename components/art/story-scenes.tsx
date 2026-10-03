"use client";

import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { cn } from "@/lib/cn";
import { Plate, Stars, Waves } from "./plate";
import { FieldEnigma, ListeningHut, Mast, Seated, SignalsTruck, Standing } from "./silhouettes";

const unit = (v: number) => Math.min(1, Math.max(0, v));
const along = (p: number, a: number, b: number) => unit((p - a) / (b - a));


/** Night in the field: a signals truck under the trees, its back open on an operator at the machine. */
export function FieldStation() {
  return (
    <Plate figure="Fig. 1" caption="A signals unit in the field. In the back of the truck, an operator at an Enigma; outside, the aerial that will carry what he types." viewBox="0 0 900 260">
      <rect x={0} y={0} width={900} height={260} className="fill-case" />
      <rect x={0} y={0} width={900} height={200} className="fill-case-muted/25" />
      <Stars count={46} width={900} height={150} />
      <circle cx={760} cy={56} r={22} className="fill-case-ink/80" />
      {/* Pines along the ridge */}
      {Array.from({ length: 16 }, (_, i) => {
        const x = i * 60 + (i % 3) * 12;
        const h = 60 + ((i * 37) % 50);
        return <path key={i} d={`M${x} 200 L${x + 22} ${200 - h} L${x + 44} 200 Z`} className="fill-case/55" />;
      })}
      {/* The ground a shade lighter than the truck, so the truck stands out against it */}
      <rect x={0} y={198} width={900} height={62} className="fill-case-muted/15" />
      <g transform="translate(330 0)">
        <SignalsTruck className="text-case" transform="translate(40 226) scale(1.3)" />
        {/* The open back of the truck, lit, with the operator at work */}
        <rect x={6} y={164} width={52} height={40} className="fill-lamp-on/25" />
        <Seated className="text-case" transform="translate(16 206) scale(0.5)" cap />
        <FieldEnigma className="text-case" transform="translate(30 192) scale(0.5)" />
      </g>
      <circle cx={428} cy={62} r={10} className="art-pulse fill-none stroke-lamp-on" strokeWidth={1.5} />
    </Plate>
  );
}

const STEPS = ["Encipher", "Write down", "Send in Morse", "Heard in England"];

/**
 * The life of one message, scrolled through: typed on the machine, the lamps
 * written down, the result sent in Morse, and taken down by a listening
 * station across the sea. The message moves along as the reader scrolls.
 */
export function JourneyStrip() {
  const [ref, p] = useScrollProgress<HTMLDivElement>();
  const step = Math.min(3, Math.floor(p * 4.2));
  const typing = along(p, 0.02, 0.25);
  const writing = along(p, 0.18, 0.45);
  const morse = along(p, 0.5, 0.85);
  const heard = p > 0.82;
  const letters = "XQTVA RMOPL";
  return (
    <div ref={ref}>
      <Plate
        figure="Fig. 2"
        caption="One message, start to finish. Scroll and follow it: typed on the machine, each lamp written down, sent in Morse, heard across the sea."
        viewBox="0 0 1000 240"
      >
        <rect x={0} y={0} width={1000} height={240} className="fill-brass-soft" />
        {/* The sea between the two shores */}
        <rect x={600} y={150} width={220} height={90} className="fill-panel" />
        <Waves rows={[170, 192, 216]} from={600} to={820} />
        <rect x={0} y={150} width={600} height={90} className="fill-panel/60" />
        <rect x={820} y={150} width={180} height={90} className="fill-panel/60" />

        {/* 1. The cipher clerk at the machine, a lamp lighting for each key */}
        <g transform="translate(40 150)">
          <rect x={30} y={-34} width={90} height={4} className="fill-room-ink" />
          <rect x={110} y={-30} width={4} height={30} className="fill-room-ink" />
          <Seated transform="scale(0.9)" cap />
          <FieldEnigma transform="translate(34 -34) scale(1.1)" lit={typing > 0 && typing < 1 && Math.floor(typing * 20) % 2 === 0} />
        </g>
        {/* 2. His partner writing each lamp on a pad */}
        <g transform="translate(200 150)">
          <rect x={30} y={-34} width={90} height={4} className="fill-room-ink" />
          <rect x={110} y={-30} width={4} height={30} className="fill-room-ink" />
          <Seated transform="scale(0.9)" />
          <rect x={40} y={-46} width={40} height={12} className="fill-paper stroke-room-ink/40" />
          <text x={44} y={-37} className="fill-room-ink font-type text-[8px]">
            {letters.slice(0, Math.round(writing * letters.length))}
          </text>
        </g>
        {/* 3. The radio operator at his set and key, the mast outside */}
        <g transform="translate(380 150)">
          <rect x={30} y={-34} width={90} height={4} className="fill-room-ink" />
          <rect x={110} y={-30} width={4} height={30} className="fill-room-ink" />
          <Seated transform="scale(0.9)" cap />
          <rect x={56} y={-62} width={44} height={28} rx={2} className="fill-room-ink" />
          <circle cx={66} cy={-48} r={4} className="fill-brass" />
          <circle cx={84} cy={-48} r={4} className="fill-brass" />
          <rect x={36} y={-38} width={12} height={4} className={cn(morse > 0 && morse < 1 ? "fill-cable" : "fill-room-ink")} />
        </g>
        <Mast transform="translate(560 150) scale(1.1)" />
        {morse > 0 && morse < 1 && <circle cx={560} cy={84} r={14} className="art-pulse fill-none stroke-cable" strokeWidth={2} />}
        {/* The Morse in flight over the sea */}
        {morse > 0 &&
          ".-.--.-".split("").map((s, i) => {
            const t = morse * 1.3 - i * 0.05;
            if (t < 0 || t > 1) return null;
            const x = 560 + t * 300;
            const y = 84 - Math.sin(t * Math.PI) * 50;
            return s === "." ? <circle key={i} cx={x} cy={y} r={4} className="fill-cable" /> : <rect key={i} x={x - 7} y={y - 3} width={14} height={6} rx={3} className="fill-cable" />;
          })}
        {/* 4. The listening station on the English shore, an operator in headphones */}
        <ListeningHut transform="translate(880 150) scale(1.3)" />
        <g transform="translate(930 150)">
          <Standing transform="scale(0.9)" />
          <path d="M-8 -68 Q0 -80 8 -68" className="fill-none stroke-room-ink" strokeWidth={2.5} />
          {heard && <circle cx={0} cy={-90} r={6} className="fill-lamp-on" />}
        </g>
        {STEPS.map((label, i) => (
          <text
            key={label}
            x={[110, 270, 470, 900][i]}
            y={226}
            textAnchor="middle"
            className={cn("font-stencil text-[15px] font-bold tracking-wider", i === step ? "fill-brass" : "fill-room-ink/45")}
          >
            {i + 1}. {label}
          </text>
        ))}
      </Plate>
    </div>
  );
}
