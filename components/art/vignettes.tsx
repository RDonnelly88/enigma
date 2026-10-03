import type { VignetteId } from "@/lib/story/history";
import { BombeCabinet, Destroyer, FieldEnigma, Merchant, PatrolPlane, UBoat } from "./silhouettes";

/** A rotor seen face on: a toothed ring round a wired core. */
function Wheel({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} className="fill-room-ink" />
      <circle r={r * 0.62} className="fill-brass" />
      <circle r={r * 0.22} className="fill-room-ink" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-1} y={-r - 2} width={2} height={3} className="fill-room-ink" transform={`rotate(${i * 30})`} />
      ))}
    </g>
  );
}

const ART: Record<VignetteId, React.ReactNode> = {
  patent: (
    <>
      <path d="M38 6 L78 6 L82 10 L82 50 L38 50 Z" className="fill-paper stroke-room-ink/40" />
      {[16, 22, 28, 34].map((y) => (
        <line key={y} x1={44} x2={76} y1={y} y2={y} className="stroke-room-ink/40" />
      ))}
      <circle cx={72} cy={42} r={7} className="fill-cable" />
    </>
  ),
  shop: (
    <>
      <FieldEnigma transform="translate(36 48) scale(1.2)" lit={false} />
      <path d="M86 14 L102 14 L106 22 L102 30 L86 30 Z" className="fill-paper stroke-room-ink/50" />
      <circle cx={89} cy={22} r={1.6} className="fill-room-ink" />
      <line x1={80} x2={88} y1={30} y2={22} className="stroke-room-ink/50" />
    </>
  ),
  anchor: (
    <g className="fill-none stroke-room-ink" strokeWidth={4} strokeLinecap="round">
      <circle cx={60} cy={12} r={4} />
      <line x1={60} x2={60} y1={16} y2={46} />
      <line x1={50} x2={70} y1={22} y2={22} />
      <path d="M44 36 Q46 48 60 48 Q74 48 76 36" />
    </g>
  ),
  reflector: (
    <>
      <Wheel x={44} y={28} />
      <rect x={66} y={14} width={8} height={28} rx={2} className="fill-room-ink" />
      <path d="M30 22 L70 22 M70 34 L30 34" className="stroke-cable" strokeWidth={2} />
      <path d="M70 22 Q80 28 70 34" className="fill-none stroke-cable" strokeWidth={2} />
    </>
  ),
  plugs: (
    <>
      {[30, 50, 70, 90].map((x) => (
        <g key={x}>
          <circle cx={x - 3} cy={14} r={2.5} className="fill-room-ink" />
          <circle cx={x + 3} cy={14} r={2.5} className="fill-room-ink" />
        </g>
      ))}
      <path d="M30 16 Q40 50 70 16 M50 16 Q70 50 90 16" className="fill-none stroke-cable" strokeWidth={3} />
    </>
  ),
  rotors: (
    <>
      <Wheel x={34} y={28} />
      <Wheel x={60} y={28} />
      <Wheel x={86} y={28} />
    </>
  ),
  fourth: (
    <>
      <Wheel x={26} y={28} r={9} />
      <Wheel x={46} y={28} />
      <Wheel x={70} y={28} />
      <Wheel x={94} y={28} />
    </>
  ),
  book: (
    <>
      <path d="M60 14 Q44 8 28 12 L28 48 Q44 44 60 50 Q76 44 92 48 L92 12 Q76 8 60 14 Z" className="fill-paper stroke-room-ink/50" />
      <line x1={60} x2={60} y1={14} y2={50} className="stroke-room-ink/50" />
      <text x={44} y={34} textAnchor="middle" className="fill-cable font-stencil text-[8px] font-bold">
        ULTRA
      </text>
    </>
  ),
  lecture: (
    <>
      <path d="M30 22 L60 8 L90 22 Z" className="fill-room-ink" />
      {[36, 48, 60, 72, 84].map((x) => (
        <rect key={x} x={x - 2} y={24} width={4} height={20} className="fill-room-ink" />
      ))}
      <rect x={28} y={44} width={64} height={5} className="fill-room-ink" />
    </>
  ),
  maths: (
    <text x={60} y={36} textAnchor="middle" className="fill-room-ink font-serif text-[18px] italic">
      AD = (…)(…)
    </text>
  ),
  catalogue: (
    <>
      {[0, 1].map((r) =>
        [0, 1, 2].map((c) => (
          <g key={`${r}${c}`}>
            <rect x={32 + c * 20} y={8 + r * 20} width={18} height={18} className="fill-room-ink" />
            <rect x={38 + c * 20} y={15 + r * 20} width={6} height={3} rx={1} className="fill-brass" />
          </g>
        )),
      )}
    </>
  ),
  bomba: (
    <>
      <rect x={34} y={12} width={52} height={36} rx={2} className="fill-room-ink" />
      {[46, 60, 74].map((x) => (
        <g key={x}>
          <circle cx={x} cy={22} r={5} className="fill-brass" />
          <circle cx={x} cy={36} r={5} className="fill-brass" />
        </g>
      ))}
    </>
  ),
  forest: (
    <>
      {[24, 40, 56, 72, 88].map((x, i) => (
        <path key={x} d={`M${x} ${10 + (i % 2) * 6} L${x + 10} 44 L${x - 10} 44 Z`} className="fill-room-ink" />
      ))}
      <rect x={52} y={38} width={20} height={10} className="fill-case-muted" />
    </>
  ),
  mansion: (
    <g className="fill-room-ink">
      <path d="M22 50 L22 26 L32 18 L42 26 L42 22 L58 8 L74 22 L88 22 L88 14 L96 14 L96 26 L100 30 L100 50 Z" />
      {[30, 50, 66, 88].map((x) => (
        <rect key={x} x={x} y={34} width={6} height={8} className="fill-brass" />
      ))}
    </g>
  ),
  bombe: <BombeCabinet transform="translate(30 52) scale(0.4)" />,
  uboat: <UBoat transform="translate(10 40) scale(0.5)" />,
  convoy: (
    <>
      <Merchant transform="translate(4 36) scale(0.28)" />
      <Merchant transform="translate(46 46) scale(0.28)" />
      <Destroyer transform="translate(70 34) scale(0.22)" />
    </>
  ),
  computer: (
    <>
      <rect x={34} y={8} width={52} height={32} rx={3} className="fill-room-ink" />
      <rect x={38} y={12} width={44} height={24} className="fill-signal-in/60" />
      <path d="M44 30 L50 22 L56 26 L64 16 L76 20" className="fill-none stroke-paper" strokeWidth={1.5} />
      <rect x={52} y={40} width={16} height={6} className="fill-room-ink" />
      <rect x={42} y={46} width={36} height={3} className="fill-room-ink" />
    </>
  ),
  hut: (
    <g className="fill-room-ink">
      <path d="M26 48 L26 26 L60 14 L94 26 L94 48 Z" />
      {[34, 50, 66, 80].map((x) => (
        <rect key={x} x={x} y={30} width={7} height={7} className="fill-brass" />
      ))}
    </g>
  ),
  raid: (
    <>
      <path d="M10 46 L40 22 L60 34 L84 14 L110 46 Z" className="fill-room-ink/40" />
      <Merchant transform="translate(30 50) scale(0.3)" />
    </>
  ),
  plane: <PatrolPlane transform="translate(60 28) scale(0.9)" />,
};

/** The picture at the head of a timeline card. Decoration: the card's text says what it shows. */
export function Vignette({ id }: { id: VignetteId }) {
  return (
    <svg viewBox="0 0 120 56" className="-mx-1 mb-3 block h-14 w-auto rounded-sm bg-brass-soft" aria-hidden>
      {ART[id]}
    </svg>
  );
}
