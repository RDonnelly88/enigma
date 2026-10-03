import { Plate, Stars } from "./plate";
import { BombeCabinet, Seated, Standing } from "./silhouettes";


/** Warsaw, the 1930s: the Cipher Bureau's mathematicians, and the bomba they built. */
export function WarsawScene() {
  return (
    <Plate figure="Fig. 1" caption="Warsaw in the 1930s: the Cipher Bureau, and one of the bomby its mathematicians built to find each day’s key." viewBox="0 0 800 240">
      <rect x={0} y={0} width={800} height={240} className="fill-brass-soft" />
      {/* A classical façade with a colonnade, as Warsaw's government buildings had */}
      <g className="fill-room-ink">
        <path d="M30 200 L30 90 L190 60 L350 90 L350 200 Z" />
        <rect x={20} y={196} width={340} height={10} />
        {[60, 100, 140, 180, 220, 260, 300].map((x) => (
          <rect key={x} x={x} y={100} width={12} height={96} className="fill-brass-soft/70" />
        ))}
      </g>
      {/* Three at a desk, working with paper: Rejewski, Różycki and Zygalski */}
      <rect x={400} y={176} width={150} height={5} className="fill-room-ink" />
      <rect x={540} y={180} width={5} height={26} className="fill-room-ink" />
      <Seated transform="translate(390 206) scale(0.8)" />
      <Standing transform="translate(470 206) scale(0.85)" />
      <rect x={420} y={168} width={30} height={8} className="fill-paper stroke-room-ink/40" />
      {/* The bomba: six Enigmas' worth of rotors on one cabinet, turning together, three sets above and three below */}
      <g transform="translate(600 206)">
        <rect x={0} y={-120} width={150} height={120} rx={4} className="fill-room-ink" />
        {[0, 1, 2, 3, 4, 5].map((m) => (
          <g key={m} transform={`translate(${28 + (m % 3) * 47} ${m < 3 ? -104 : -58})`}>
            {[0, 1, 2].map((d) => (
              <circle key={d} cy={d * 13} r={6} className={d === 1 ? "fill-cable" : "fill-brass"} />
            ))}
          </g>
        ))}
        <rect x={10} y={-16} width={130} height={6} className="fill-brass/60" />
      </g>
      <text x={675} y={232} textAnchor="middle" className="fill-room-ink font-stencil text-[13px] font-bold tracking-[0.3em]">
        BOMBA
      </text>
    </Plate>
  );
}

/** Bletchley Park at night: the mansion and the huts, blacked out, a sliver of light at a door. */
export function BletchleyNight() {
  return (
    <Plate figure="Fig. 2" caption="Bletchley Park at night: the mansion and the wooden huts in its grounds, blacked out. The work went on round the clock." viewBox="0 0 900 240">
      <rect x={0} y={0} width={900} height={240} className="fill-case" />
      <rect x={0} y={0} width={900} height={190} className="fill-case-muted/25" />
      <Stars count={50} width={900} height={120} />
      <circle cx={120} cy={50} r={18} className="fill-case-ink/80" />
      {/* The mansion, its jumble of roofs and its copper dome */}
      <g className="fill-case" transform="translate(80 190)">
        <path d="M0 0 L0 -70 L20 -90 L40 -70 L40 -80 L70 -110 L100 -80 L130 -80 L130 -100 L146 -100 L146 -80 L170 -80 L170 -96 Q185 -122 200 -96 L200 -60 L240 -60 L240 0 Z" />
        {[16, 58, 104, 150, 210].map((x) => (
          <rect key={x} x={x} y={-44} width={10} height={2} className="fill-lamp-on/70" />
        ))}
      </g>
      <rect x={0} y={190} width={900} height={50} className="fill-case-muted/15" />
      {/* Huts in rows across the lawn */}
      {[
        [380, 186, 150],
        [560, 196, 170],
        [420, 222, 180],
        [640, 230, 200],
      ].map(([x, y, w], i) => (
        <g key={i} transform={`translate(${x} ${y})`} className="fill-case">
          <path d={`M0 0 L0 -26 L${w / 2} -42 L${w} -26 L${w} 0 Z`} />
          <rect x={w * 0.2} y={-12} width={8} height={12} className="fill-lamp-on/80" />
        </g>
      ))}
      <text x={700} y={40} className="fill-case-ink/50 font-stencil text-[13px] tracking-[0.4em]">
        HUT 6 · HUT 8
      </text>
    </Plate>
  );
}

/** A Wren at a Bombe, its drums turning, setting up the next run from a menu. */
export function WrenAtBombe() {
  return (
    <Plate figure="Fig. 3" caption="A Bombe at work. Its drums turn through the settings while a Wren checks the menu for the next run; most Bombes were run by Wrens." viewBox="0 0 800 260">
      <rect x={0} y={0} width={800} height={260} className="fill-brass-soft" />
      <rect x={0} y={226} width={800} height={34} className="fill-panel" />
      <BombeCabinet transform="translate(240 226) scale(1.8)" spin />
      <Standing transform="translate(140 226) scale(1.5)" />
      {/* Her menu sheet */}
      <rect x={150} y={118} width={30} height={40} className="fill-paper stroke-room-ink/40" transform="rotate(-12 165 138)" />
      <text x={540} y={120} className="fill-room-ink/70 font-stencil text-[15px] tracking-[0.25em]">
        36 ENIGMAS,
      </text>
      <text x={540} y={142} className="fill-room-ink/70 font-stencil text-[15px] tracking-[0.25em]">
        WIRED AS ONE
      </text>
    </Plate>
  );
}
