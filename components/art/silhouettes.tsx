import { cn } from "@/lib/cn";

/**
 * Silhouettes in the manner of a 1940s recognition chart or poster: flat
 * shapes in one ink, a highlight where the light catches, no outlines. Each is
 * an SVG group drawn about its own origin, to be placed with `transform`, and
 * inked in the current text colour, so a faint one is faint all over.
 */

type Art = { className?: string; transform?: string };

/** A Type VII U-boat on the surface, bow to the right; the origin is the waterline at the stern. */
export function UBoat({ className = "text-room-ink", transform, periscope = true }: Art & { periscope?: boolean }) {
  return (
    <g className={cn("fill-current", className)} transform={transform}>
      <path d="M0 0 L8 -7 L150 -9 Q178 -8 196 -2 L200 0 L188 4 L16 5 Z" />
      <path d="M78 -8 L83 -24 L114 -24 L120 -8 Z" />
      <rect x={86} y={-28} width={22} height={4} rx={1} />
      {periscope && <rect x={100} y={-44} width={2.2} height={18} />}
      <rect x={93} y={-38} width={1.6} height={11} />
      {/* The deck gun forward of the tower */}
      <path d="M140 -9 L141 -14 L146 -14 L158 -17 L158 -15.5 L147 -12 L147 -9 Z" />
      {/* Jumping wire, bow to tower to stern */}
      <path d="M196 -2 L112 -28 M86 -28 L4 -5" fill="none" className="stroke-current" strokeWidth={0.7} />
    </g>
  );
}

/** A destroyer or escort, bow to the right; origin at the waterline at the stern. */
export function Destroyer({ className = "text-room-ink", transform }: Art) {
  return (
    <g className={cn("fill-current", className)} transform={transform}>
      <path d="M0 -9 L194 -9 L206 -17 L198 0 L8 1 Z" />
      <path d="M118 -9 L120 -22 L142 -22 L146 -9 Z" />
      <rect x={124} y={-30} width={12} height={8} />
      <path d="M92 -9 L95 -26 L105 -26 L104 -9 Z" />
      <rect x={138} y={-52} width={1.6} height={30} />
      <rect x={132} y={-46} width={14} height={1.4} />
      <rect x={160} y={-14} width={14} height={5} rx={1.5} />
      <rect x={174} y={-12.5} width={14} height={1.6} />
      <rect x={30} y={-14} width={14} height={5} rx={1.5} />
      <rect x={18} y={-12.5} width={14} height={1.6} />
    </g>
  );
}

/** A merchant ship of a convoy, bow to the right; origin at the waterline at the stern. */
export function Merchant({ className = "text-room-ink", transform }: Art) {
  return (
    <g className={cn("fill-current", className)} transform={transform}>
      <path d="M0 -14 L4 -16 L150 -14 L162 -22 L156 0 L10 1 Z" />
      <path d="M66 -14 L68 -30 L96 -30 L98 -14 Z" />
      <path d="M100 -14 L102 -40 L112 -40 L112 -14 Z" />
      <rect x={28} y={-46} width={2} height={32} />
      <rect x={136} y={-44} width={2} height={30} />
      <path d="M29 -44 L52 -16 M137 -42 L120 -16" fill="none" className="stroke-current" strokeWidth={0.8} />
      <rect x={16} y={-20} width={26} height={6} />
      <rect x={118} y={-20} width={22} height={6} />
    </g>
  );
}

/** A twin-engined bomber seen from above, nose to the right; origin at its centre. */
export function Bomber({ className = "text-room-ink", transform }: Art) {
  return (
    <g className={cn("fill-current", className)} transform={transform}>
      <path d="M-26 -2.5 L22 -3 Q30 0 22 3 L-26 2.5 Z" />
      <path d="M2 -32 L10 -32 L12 32 L4 32 Z" />
      <path d="M-26 -11 L-21 -11 L-20 11 L-25 11 Z" />
      <rect x={6} y={-19} width={12} height={5} rx={2.5} />
      <rect x={6} y={14} width={12} height={5} rx={2.5} />
    </g>
  );
}

/** A single-engined fighter seen from above, nose to the right; origin at its centre. */
export function Fighter({ className = "text-room-ink", transform }: Art) {
  return (
    <g className={cn("fill-current", className)} transform={transform}>
      <path d="M-16 -1.8 L14 -2.2 Q20 0 14 2.2 L-16 1.8 Z" />
      <path d="M0 -20 Q6 -20 7 -6 L7 6 Q6 20 0 20 Q-2 0 0 -20 Z" />
      <path d="M-16 -7 L-12 -7 L-12 7 L-16 7 Z" />
    </g>
  );
}

/** A four-engined patrol aircraft seen from the side, nose to the right; origin at its centre. */
export function PatrolPlane({ className = "text-room-ink", transform }: Art) {
  return (
    <g className={cn("fill-current", className)} transform={transform}>
      <path d="M-46 -2 L-40 -5 L34 -6 Q46 -4 48 0 Q44 4 30 4 L-40 3 Z" />
      <path d="M-46 -2 L-50 -16 L-44 -16 L-38 -4 Z" />
      <path d="M-6 -6 L4 -6 L6 -4 L-8 -4 Z" />
      <rect x={-14} y={-8} width={34} height={2} rx={1} />
    </g>
  );
}

/** A dispatch rider on a motorcycle, heading right; origin on the road under the back wheel. */
export function DispatchRider({ className = "text-room-ink", transform }: Art) {
  return (
    <g className={cn("fill-current", className)} transform={transform}>
      <circle cx={0} cy={-9} r={9} fill="none" className="stroke-current" strokeWidth={3} />
      <circle cx={38} cy={-9} r={9} fill="none" className="stroke-current" strokeWidth={3} />
      <path d="M0 -9 L14 -20 L30 -20 L38 -9 M30 -20 L34 -30 L40 -30" fill="none" className="stroke-current" strokeWidth={3} strokeLinecap="round" />
      <path d="M10 -22 L28 -22 L26 -16 L12 -16 Z" />
      {/* The rider: helmet, coat, and the despatch bag on his hip */}
      <path d="M14 -22 L18 -42 Q22 -46 28 -42 L34 -30 L30 -28 L24 -38 L22 -22 Z" />
      <circle cx={22} cy={-50} r={5.5} />
      <path d="M15.5 -50 L28.5 -50 L27 -53 L17 -53 Z" />
      <rect x={8} y={-34} width={9} height={8} rx={1.5} className="fill-brass" />
    </g>
  );
}

/** A lattice radio mast; origin at its foot. */
export function Mast({ className = "text-room-ink", transform }: Art) {
  return (
    <g className={cn("fill-current", className)} transform={transform}>
      <path d="M-9 0 L0 -60 L9 0 Z M-6 -1 L0 -50 L6 -1 Z" fillRule="evenodd" />
      <path d="M-7 -12 L5 -24 M7 -12 L-5 -24 M-5 -28 L3 -38 M5 -28 L-3 -38" fill="none" className="stroke-current" strokeWidth={1} />
      <circle cx={0} cy={-62} r={2.5} className="fill-cable" />
    </g>
  );
}

/** A listening station's hut with its aerials; origin at its foot. */
export function ListeningHut({ className = "text-room-ink", transform }: Art) {
  return (
    <g className={cn("fill-current", className)} transform={transform}>
      <path d="M-18 0 L-18 -14 L0 -24 L18 -14 L18 0 Z" />
      <rect x={-6} y={-8} width={5} height={8} className="fill-brass" />
      <rect x={4} y={-11} width={7} height={5} className="fill-brass" />
      <rect x={24} y={-44} width={1.6} height={44} />
      <rect x={-30} y={-38} width={1.6} height={38} />
      <path d="M-29 -37 L25 -43" fill="none" className="stroke-current" strokeWidth={0.8} />
    </g>
  );
}
