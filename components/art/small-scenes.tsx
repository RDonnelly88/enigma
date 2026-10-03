import { Plate } from "./plate";
import { BombeCabinet, DispatchRider, Seated } from "./silhouettes";

/** Then and now: a hut full of people and Bombes beside one laptop doing the same job by statistics. */
export function ThenAndNow() {
  return (
    <Plate
      figure="Then & now"
      caption="1941: a hut, a crib, Bombes and hundreds of people. Today: one laptop, no crib, a few minutes of statistics."
      viewBox="0 0 800 200"
    >
      <rect x={0} y={0} width={400} height={200} className="fill-brass-soft" />
      <rect x={400} y={0} width={400} height={200} className="fill-panel" />
      <line x1={400} x2={400} y1={0} y2={200} className="stroke-room-ink/30" strokeDasharray="4 4" />
      <g className="fill-room-ink" transform="translate(30 170)">
        <path d="M0 0 L0 -50 L90 -76 L180 -50 L180 0 Z" />
        {[18, 58, 98, 138].map((x) => (
          <rect key={x} x={x} y={-38} width={14} height={14} className="fill-brass" />
        ))}
      </g>
      <BombeCabinet transform="translate(240 170) scale(0.9)" />
      <text x={200} y={192} textAnchor="middle" className="fill-room-ink/60 font-stencil text-[13px] tracking-[0.3em]">
        1941
      </text>
      {/* The laptop: a hinged screen showing the search climbing */}
      <g transform="translate(540 160)">
        <rect x={0} y={-80} width={120} height={76} rx={4} className="fill-room-ink" />
        <rect x={6} y={-74} width={108} height={64} className="fill-signal-in/30" />
        <path d="M14 -20 L30 -30 L44 -26 L58 -48 L74 -44 L90 -64 L106 -62" className="fill-none stroke-signal-in" strokeWidth={2.5} />
        <path d="M-14 0 L134 0 L120 -4 L0 -4 Z" className="fill-room-ink" />
      </g>
      <Seated transform="translate(500 170) scale(0.85)" />
      <text x={600} y={192} textAnchor="middle" className="fill-room-ink/60 font-stencil text-[13px] tracking-[0.3em]">
        TODAY
      </text>
    </Plate>
  );
}

/** For the page that wasn't there: a dispatch rider stopped at a crossroads, the signpost no help at all. */
export function LostRider() {
  return (
    <svg viewBox="0 0 400 180" className="w-full max-w-md" aria-hidden>
      <rect x={0} y={150} width={400} height={30} className="fill-panel" />
      <path d="M0 150 L400 150" className="stroke-room-ink/40" strokeWidth={2} />
      {/* Signs were taken down in 1940 so invaders couldn't find their way, which left everyone else lost too */}
      <g className="fill-room-ink">
        <rect x={258} y={40} width={6} height={110} />
        <path d="M264 50 L340 50 L352 58 L340 66 L264 66 Z" />
        <path d="M258 78 L186 78 L174 86 L186 94 L258 94 Z" />
        <path d="M264 104 L330 104 L342 112 L330 120 L264 120 Z" />
      </g>
      <text x={302} y={62} textAnchor="middle" className="fill-paper font-stencil text-[11px] font-bold tracking-[0.25em]">
        ? ? ?
      </text>
      <text x={216} y={90} textAnchor="middle" className="fill-paper font-stencil text-[11px] font-bold tracking-[0.25em]">
        X Y Z
      </text>
      <text x={298} y={116} textAnchor="middle" className="fill-paper font-stencil text-[11px] font-bold tracking-[0.25em]">
        4 0 4
      </text>
      <g className="art-bob">
        <DispatchRider transform="translate(70 150) scale(1.4)" />
      </g>
    </svg>
  );
}

/** A crest for the certificate: crossed keys over a rotor, in a laurel, with a ribbon beneath. */
export function Crest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden>
      {/* Laurel, a leaf at a time down each side */}
      {Array.from({ length: 8 }, (_, i) => {
        // Left branch from top to bottom, and its mirror on the right
        const leaf = (deg: number, flip: number) => {
          const r = (deg * Math.PI) / 180;
          const x = 60 + 42 * Math.cos(r);
          const y = 50 - 42 * Math.sin(r);
          return <ellipse cx={x} cy={y} rx={7.5} ry={3.2} transform={`rotate(${-deg + 90 * flip} ${x} ${y})`} />;
        };
        return (
          <g key={i} className="fill-signal-in/70">
            {leaf(115 + i * 18, 1)}
            {leaf(65 - i * 18, -1)}
          </g>
        );
      })}
      <circle cx={60} cy={50} r={26} className="fill-paper-ink" />
      <circle cx={60} cy={50} r={17} className="fill-brass" />
      <circle cx={60} cy={50} r={6} className="fill-paper-ink" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={59} y={21} width={2} height={4} className="fill-paper-ink" transform={`rotate(${i * 22.5} 60 50)`} />
      ))}
      {/* Crossed keys over the rotor */}
      <g className="fill-none stroke-paper" strokeWidth={2.6} strokeLinecap="round">
        <path d="M47 37 L74 64 M73 37 L46 64" />
        <circle cx={44} cy={34} r={4} />
        <circle cx={76} cy={34} r={4} />
        <path d="M74 64 L70 68 M70 60 L66 64 M46 64 L50 68 M50 60 L54 64" />
      </g>
      <path d="M22 92 L40 86 L80 86 L98 92 L80 98 L40 98 Z" className="fill-cable" />
      <text x={60} y={95} textAnchor="middle" className="fill-paper font-stencil text-[7px] font-bold tracking-[0.25em]">
        SIGNALS SCHOOL
      </text>
    </svg>
  );
}
