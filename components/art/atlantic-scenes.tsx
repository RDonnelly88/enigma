import { Plate, Waves } from "./plate";
import { Destroyer, Merchant, PatrolPlane, UBoat } from "./silhouettes";

/** Rays of a low sun behind the horizon, the way a poster lit its sea. */
function Sunburst({ cx, cy, rays = 18, radius = 700 }: { cx: number; cy: number; rays?: number; radius?: number }) {
  return (
    <g className="fill-brass/10">
      {Array.from({ length: rays }, (_, i) => {
        const a = Math.PI + (i / rays) * Math.PI;
        const b = a + Math.PI / rays / 1.6;
        const p = (t: number) => `${Math.round(cx + radius * Math.cos(t))} ${Math.round(cy + radius * Math.sin(t))}`;
        return <path key={i} d={`M${cx} ${cy} L${p(a)} L${p(b)} Z`} />;
      })}
    </g>
  );
}

/** The page's opening: a convoy steaming across a hatched sea, and a periscope watching it. */
export function AtlanticHero() {
  return (
    <Plate figure="Fig. 1" caption="A convoy and its escort, and a U-boat’s periscope keeping pace." viewBox="0 0 1200 330">
      <rect x={0} y={0} width={1200} height={210} className="fill-brass-soft" />
      <Sunburst cx={760} cy={210} />
      <circle cx={760} cy={210} r={46} className="fill-brass/40" />
      <rect x={0} y={208} width={1200} height={122} className="fill-panel" />
      <line x1={0} x2={1200} y1={208} y2={208} className="stroke-room-ink/50" strokeWidth={1.5} />
      <Waves rows={[226, 246, 270, 298, 322]} />
      {/* The convoy in columns, an escort ahead of it, crossing the whole horizon */}
      {/* Started part-way across, so the convoy is in sight from the first moment */}
      <g className="art-steam" style={{ animationDelay: "-32s" }}>
        <g className="art-bob">
          <Destroyer transform="translate(420 208) scale(0.62)" />
        </g>
        <Merchant transform="translate(240 206) scale(0.55)" />
        <Merchant transform="translate(130 210) scale(0.6)" />
        <Merchant transform="translate(10 206) scale(0.52)" />
        <Merchant transform="translate(300 214) scale(0.66)" />
        <Merchant transform="translate(-110 213) scale(0.62)" />
      </g>
      {/* Below the surface, a shadow; above it, the periscope and its feather of wake */}
      <g className="art-periscope">
        <UBoat className="text-room-ink/[0.08]" transform="translate(330 300) scale(1.1)" periscope={false} />
        <rect x={447} y={256} width={3} height={22} className="fill-room-ink" />
        <rect x={444} y={254} width={8} height={3} className="fill-room-ink" />
        <path d="M448 279 L410 286 M448 279 L414 292" className="stroke-paper" strokeWidth={2} strokeLinecap="round" />
      </g>
    </Plate>
  );
}

/** U-110 on the surface, the boarding party's boat pulling across to her, HMS Bulldog standing off. */
export function BoardingScene() {
  return (
    <Plate figure="Fig. 2" caption="9 May 1941: U-110 on the surface, abandoned, and the boarding party’s boat pulling across from HMS Bulldog." viewBox="0 0 600 200">
      <rect x={0} y={0} width={600} height={120} className="fill-brass-soft" />
      <rect x={0} y={118} width={600} height={82} className="fill-panel" />
      <Destroyer transform="translate(380 120) scale(0.75)" className="text-room-ink/55" />
      <Waves rows={[134, 152, 174, 194]} to={640} />
      <g className="art-bob">
        <UBoat transform="translate(40 152) scale(1.25)" />
      </g>
      {/* The whaler: a hull and four heads, oars out */}
      <g className="art-bob fill-room-ink">
        <path d="M300 168 L360 168 L352 178 L306 178 Z" />
        {[312, 324, 336, 348].map((x) => (
          <circle key={x} cx={x} cy={163} r={3.5} />
        ))}
        <path d="M310 172 L296 184 M334 172 L322 186 M346 172 L360 186" className="stroke-room-ink" strokeWidth={1.5} />
      </g>
    </Plate>
  );
}

/** U-559 going down by the stern, with bubbles, and the boat alongside taking the books. */
export function SinkingScene() {
  return (
    <Plate figure="Fig. 3" caption="30 October 1942: U-559, holed and flooding, moments before she went down with Fasson and Grazier aboard." viewBox="0 0 600 220">
      <rect x={0} y={0} width={600} height={120} className="fill-brass-soft" />
      {/* A searchlight from the destroyer out of the picture */}
      <path d="M600 40 L250 108 L260 124 Z" className="fill-paper/60" />
      <rect x={0} y={118} width={600} height={102} className="fill-panel" />
      <g transform="rotate(-9 260 120)">
        <UBoat transform="translate(150 132) scale(1.3)" />
      </g>
      <Waves rows={[130, 150, 172, 196, 214]} to={640} />
      {[200, 236, 270, 300].map((x, i) => (
        <circle key={x} cx={x} cy={150 + (i % 2) * 14} r={3 + (i % 3)} className="art-rise fill-none stroke-room-ink/45" strokeWidth={1.2} style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      <g className="art-bob fill-room-ink">
        <path d="M410 136 L466 136 L458 146 L416 146 Z" />
        <circle cx={426} cy={131} r={3.5} />
        <circle cx={446} cy={131} r={3.5} />
      </g>
    </Plate>
  );
}

/** 1943: a long-range aircraft over a convoy, and a U-boat crash-diving ahead of it. */
export function AirCoverScene() {
  return (
    <Plate figure="Fig. 4" caption="1943: long-range aircraft close the gap in mid-ocean, and a U-boat on the surface has seconds to dive." viewBox="0 0 600 220">
      <rect x={0} y={0} width={600} height={140} className="fill-brass-soft" />
      <Sunburst cx={120} cy={140} rays={12} radius={400} />
      <g className="art-bob">
        <PatrolPlane transform="translate(330 46) scale(1.5)" />
      </g>
      <rect x={0} y={138} width={600} height={82} className="fill-panel" />
      <Merchant transform="translate(20 140) scale(0.45)" className="text-room-ink/55" />
      <Merchant transform="translate(110 143) scale(0.5)" className="text-room-ink/55" />
      <g transform="rotate(8 470 160)">
        <UBoat transform="translate(380 168) scale(0.9)" />
      </g>
      <path d="M548 150 q8 -14 16 0 M532 156 q6 -10 12 0" className="fill-none stroke-paper" strokeWidth={2} />
      <Waves rows={[152, 170, 192, 212]} to={640} />
    </Plate>
  );
}
