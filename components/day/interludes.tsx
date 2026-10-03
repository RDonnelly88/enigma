import { Plate, Waves } from "@/components/art/plate";
import { Bomber, BomberSide, Bowser, DispatchRider, Fighter, ListeningHut, Mast, Merchant, Seated, Standing } from "@/components/art/silhouettes";

/** Clamped to 0..1. */
const unit = (v: number) => Math.min(1, Math.max(0, v));
/** Where a value falls between `a` and `b`, from 0 to 1. */
const along = (p: number, a: number, b: number) => unit((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
type Point = [number, number];
const mix = (a: Point, b: Point, t: number): Point => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
/** A point on a cubic Bézier curve. */
function bezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]) as Point;
}
const heading = (from: Point, to: Point) => (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;

/** The Channel as a wartime chart draws it: England above, France below, the sea hatched between. */
function Channel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <rect x={0} y={0} width={600} height={260} className="fill-panel" />
      <Waves rows={[100, 124, 148, 172]} to={640} className="stroke-room-ink/15" />
      <path
        d="M0 0 L600 0 L600 70 Q560 84 520 76 Q470 66 430 82 Q390 96 340 86 Q300 78 260 92 Q220 102 170 90 Q120 80 80 92 Q40 100 0 94 Z"
        className="fill-brass-soft stroke-room-ink/40"
        strokeWidth={1.5}
      />
      <path
        d="M0 260 L600 260 L600 196 Q560 186 520 194 Q480 202 450 190 Q430 170 410 172 Q390 176 384 196 Q370 210 330 204 Q280 196 240 206 Q190 214 140 200 Q90 188 40 196 Q20 200 0 198 Z"
        className="fill-brass-soft stroke-room-ink/40"
        strokeWidth={1.5}
      />
      <text x={24} y={30} className="fill-room-ink/60 font-stencil text-[15px] font-bold tracking-[0.4em]">
        ENGLAND
      </text>
      <text x={24} y={246} className="fill-room-ink/60 font-stencil text-[15px] font-bold tracking-[0.4em]">
        FRANCE
      </text>
      {children}
    </>
  );
}

/** 06:00 to 06:01: the weather report crosses the Channel in Morse, from the German transmitter to the listening station. */
function MorseAcross({ p }: { p: number }) {
  const from: Point = [470, 210];
  const to: Point = [160, 38];
  const c1: Point = [440, 110];
  const c2: Point = [260, 30];
  // A train of dots and dashes strung along the radio path, travelling as the clock runs
  const symbols = ".-- . - - . .-.".replace(/ /g, "").split("");
  return (
    <Plate viewBox="0 0 600 260" figure="06:00" caption="The report goes out in Morse. At RAF Chicksands an operator in headphones takes it down, letter by letter.">
      <Channel>
        <path d={`M${from} C${c1} ${c2} ${to}`} fill="none" className="stroke-room-ink/25" strokeDasharray="3 5" />
        <Mast transform={`translate(${from[0]} ${from[1] + 26}) scale(0.7)`} />
        <circle cx={from[0]} cy={from[1] - 18} r={16} className="art-pulse fill-none stroke-cable" strokeWidth={2} />
        <circle cx={from[0]} cy={from[1] - 18} r={16} className="art-pulse fill-none stroke-cable" strokeWidth={2} style={{ animationDelay: "1.2s" }} />
        <ListeningHut transform={`translate(${to[0]} ${to[1] + 20}) scale(0.9)`} />
        {symbols.map((s, i) => {
          const t = p * 1.15 - i * 0.05;
          if (t < 0 || t > 1) return null;
          const [x, y] = bezier(from, c1, c2, to, t);
          return s === "." ? (
            <circle key={i} cx={x} cy={y} r={4} className="fill-cable" />
          ) : (
            <rect key={i} x={x - 7} y={y - 3} width={14} height={6} rx={3} className="fill-cable" transform={`rotate(${heading(from, to)} ${x} ${y})`} />
          );
        })}
      </Channel>
    </Plate>
  );
}

/** 06:01 to 06:40: a dispatch rider takes the message forms from Chicksands to Bletchley Park. */
function DispatchRun({ p }: { p: number }) {
  const road: [Point, Point, Point, Point] = [
    [60, 150],
    [220, 60],
    [360, 230],
    [540, 120],
  ];
  const t = along(p, 0.05, 0.9);
  const [x, y] = bezier(...road, t);
  const [nx, ny] = bezier(...road, Math.min(1, t + 0.02));
  const tilt = (Math.atan2(ny - y, nx - x) * 180) / Math.PI;
  return (
    <Plate viewBox="0 0 600 260" figure="06:01" caption="The forms go by motorcycle along the country roads to Bletchley Park; the most urgent go ahead by teleprinter.">
      <rect x={0} y={0} width={600} height={260} className="fill-brass-soft" />
      {/* Fields either side of the road, ploughed in rows, with a few trees on the hedges */}
      {[
        [30, 24, 150, 64],
        [280, 14, 150, 60],
        [110, 196, 170, 50],
        [400, 186, 170, 56],
      ].map(([fx, fy, w, h], i) => (
        <g key={i}>
          <rect x={fx} y={fy} width={w} height={h} className="fill-signal-in/10 stroke-room-ink/25" strokeDasharray="2 3" />
          {Array.from({ length: Math.floor(h / 10) }, (_, r) => (
            <line key={r} x1={fx + 6} x2={fx + w - 6} y1={fy + 8 + r * 10} y2={fy + 8 + r * 10} className="stroke-room-ink/10" />
          ))}
          <circle cx={fx + w} cy={fy} r={7} className="fill-room-ink/60" />
          <circle cx={fx} cy={fy + h} r={5} className="fill-room-ink/50" />
        </g>
      ))}
      <path d={`M${road[0]} C${road[1]} ${road[2]} ${road[3]}`} fill="none" className="stroke-room-ink/70" strokeWidth={14} strokeLinecap="round" />
      <path d={`M${road[0]} C${road[1]} ${road[2]} ${road[3]}`} fill="none" className="stroke-paper" strokeWidth={1.5} strokeDasharray="8 8" />
      <g transform={`translate(${road[0][0]} ${road[0][1] - 10})`}>
        <ListeningHut transform="scale(0.8)" />
      </g>
      <text x={road[0][0] - 30} y={road[0][1] + 30} className="fill-room-ink font-stencil text-[13px] font-bold tracking-[0.2em]">
        CHICKSANDS
      </text>
      {/* Bletchley Park: the mansion, its roofline as everyone remembers it */}
      <g transform={`translate(${road[3][0]} ${road[3][1] - 12})`} className="fill-room-ink">
        <path d="M-34 0 L-34 -22 L-26 -30 L-18 -22 L-18 -26 L-4 -40 L10 -26 L22 -26 L22 -34 L30 -34 L30 -26 L34 -22 L34 0 Z" />
        {[-26, -10, 4, 22].map((wx) => (
          <rect key={wx} x={wx} y={-16} width={6} height={8} className="fill-brass" />
        ))}
      </g>
      <text x={road[3][0]} y={road[3][1] - 62} textAnchor="middle" className="fill-room-ink font-stencil text-[13px] font-bold tracking-[0.2em]">
        BLETCHLEY PARK
      </text>
      <DispatchRider transform={`translate(${x - 20} ${y + 6}) rotate(${tilt * 0.6} 20 -10) scale(0.7)`} />
    </Plate>
  );
}

/** 11:45 to 12:30: the decrypt goes from Hut 6 to Hut 3 through the little wooden tunnel between them. */
function HutToHut({ p }: { p: number }) {
  const t = along(p, 0.1, 0.8);
  const x = lerp(196, 384, t);
  return (
    <Plate viewBox="0 0 600 200" figure="11:45" caption="From Hut 6 to Hut 3, decrypts were pushed on a tray through a small wooden tunnel between the two huts.">
      <rect x={0} y={0} width={600} height={200} className="fill-brass-soft" />
      <rect x={0} y={160} width={600} height={40} className="fill-panel" />
      {[
        [40, "HUT 6"],
        [400, "HUT 3"],
      ].map(([hx, name]) => (
        <g key={name as string} transform={`translate(${hx} 160)`} className="fill-room-ink">
          <path d="M0 0 L0 -70 L80 -96 L160 -70 L160 0 Z" />
          {[16, 56, 96, 128].map((wx) => (
            <rect key={wx} x={wx} y={-52} width={16} height={18} className="fill-brass" />
          ))}
          <text x={80} y={-14} textAnchor="middle" className="fill-paper font-stencil text-[16px] font-bold tracking-[0.3em]">
            {name}
          </text>
        </g>
      ))}
      <rect x={196} y={104} width={208} height={22} className="fill-room-ink/80" />
      <rect x={200} y={108} width={200} height={14} className="fill-room-ink" />
      {/* The tray, with the decrypt on it */}
      <g transform={`translate(${x} 108)`}>
        <rect x={0} y={4} width={22} height={10} className="fill-brass" />
        <rect x={3} y={-2} width={16} height={9} className="fill-paper" />
      </g>
    </Plate>
  );
}

/**
 * 14:50 to 16:00: warned by Ultra, the fighters are over the convoy before the
 * bombers arrive, and meet them before they reach it.
 */
function Interception({ p }: { p: number }) {
  const convoy: Point = [300, 118];
  const airfield: Point = [130, 40];
  const base: Point = [470, 236];
  // The bombers come up from France; the fighters climb out early and wait, then go to meet them
  const run = along(p, 0, 0.8);
  const bombersAt = mix(base, [350, 150], run);
  const turned = p > 0.88;
  const retreat = mix(bombersAt, [520, 250], along(p, 0.88, 1));
  const bombers = turned ? retreat : bombersAt;
  const climb = along(p, 0, 0.35);
  const meet = along(p, 0.65, 0.82);
  const fightersAt = p < 0.65 ? mix(airfield, [convoy[0] - 10, convoy[1] - 30], climb) : mix([convoy[0] - 10, convoy[1] - 30], [bombersAt[0] - 30, bombersAt[1] - 20], meet);
  const fighting = p > 0.72 && p < 0.95;
  const bomberHeading = turned ? heading(bombersAt, [520, 250]) : heading(base, [350, 150]);
  const fighterHeading = p < 0.65 ? heading(airfield, convoy) : heading([convoy[0], convoy[1]], bombersAt);
  return (
    <Plate viewBox="0 0 600 260" figure="16:00" caption="Warned by Ultra, the fighters are already over the convoy when the bombers arrive, and turn them back.">
      <Channel>
        {[0, 18, 36].map((dx, i) => (
          <Merchant key={i} transform={`translate(${convoy[0] - 30 + dx} ${convoy[1] + (i % 2) * 10}) scale(0.16)`} />
        ))}
        {/* An airfield on the English coast */}
        <rect x={airfield[0] - 20} y={airfield[1] - 4} width={40} height={6} rx={2} className="fill-room-ink/50" />
        <g transform={`translate(${bombers[0]} ${bombers[1]}) rotate(${bomberHeading})`}>
          {[
            [0, 0],
            [-22, -18],
            [-22, 18],
          ].map(([bx, by], i) => (
            <Bomber key={i} transform={`translate(${bx} ${by}) scale(0.38)`} />
          ))}
        </g>
        <g transform={`translate(${fightersAt[0]} ${fightersAt[1]})`}>
          <g className={p > 0.35 && p < 0.65 ? "art-circle" : undefined}>
            {[
              [0, 0],
              [-14, -12],
              [-14, 12],
            ].map(([fx, fy], i) => (
              <Fighter key={i} className="text-signal-in" transform={`translate(${fx} ${fy}) rotate(${fighterHeading}) scale(0.42)`} />
            ))}
          </g>
        </g>
        {fighting &&
          [0, 0.5, 1].map((d, i) => (
            <circle
              key={i}
              cx={bombersAt[0] - 18 + i * 10}
              cy={bombersAt[1] - 12 + (i % 2) * 14}
              r={7}
              className="art-pulse fill-room-ink/40"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
      </Channel>
    </Plate>
  );
}

/** The airfield in France: a hangar, a windsock and a line of parked bombers, for the German side of the day. */
function Airfield({ children, sky, sun }: { children?: React.ReactNode; sky: string; sun?: { x: number; y: number } }) {
  return (
    <>
      <rect x={0} y={0} width={600} height={200} className={sky} />
      {sun && <circle cx={sun.x} cy={sun.y} r={26} className="fill-lamp-on/80" />}
      <rect x={0} y={196} width={600} height={64} className="fill-panel" />
      <line x1={0} x2={600} y1={196} y2={196} className="stroke-room-ink/40" />
      <path d="M440 196 L440 146 Q505 108 570 146 L570 196 Z" className="fill-room-ink" />
      <rect x={485} y={160} width={40} height={36} className="fill-room-ink/40" />
      {/* The windsock on its pole */}
      <rect x={576} y={140} width={2} height={56} className="fill-room-ink" />
      <path d="M578 142 L598 146 L598 152 L578 156 Z" className="fill-cable" />
      {children}
    </>
  );
}

/** Midnight to 05:45: dawn comes up over the airfield, and the weather observer goes out to his instruments. */
function Dawn({ p }: { p: number }) {
  const sun = { x: 120 + p * 60, y: 200 - p * 120 };
  return (
    <Plate viewBox="0 0 600 260" figure="05:30" caption="Dawn over the airfield in France. The weather observer reads his instruments: the morning’s report starts here.">
      <rect x={0} y={0} width={600} height={200} className="fill-case" />
      <rect x={0} y={0} width={600} height={200} className="fill-brass-soft" opacity={p} />
      <Airfield sky="fill-none" sun={sun}>
        <BomberSide transform="translate(120 196) scale(0.75)" className="text-room-ink/80" />
        <BomberSide transform="translate(270 196) scale(0.75)" className="text-room-ink/80" />
        {/* The Stevenson screen and the observer walking out to it */}
        <rect x={350} y={170} width={22} height={18} className="fill-paper stroke-room-ink" />
        <rect x={360} y={188} width={2} height={8} className="fill-room-ink" />
        <Standing transform={`translate(${lerp(425, 384, along(p, 0.3, 0.8))} 196) scale(0.55)`} cap />
      </Airfield>
    </Plate>
  );
}

/** 06:40 to 08:30: in Hut 6 the day's messages are sorted, and the crib room looks for a familiar opening. */
function CribRoom({ p }: { p: number }) {
  const slips = 6;
  return (
    <Plate viewBox="0 0 600 220" figure="07:00" caption="In Hut 6 the night’s messages are sorted by network, and the crib room hunts for one that opens the way it always does.">
      <rect x={0} y={0} width={600} height={220} className="fill-brass-soft" />
      <rect x={0} y={190} width={600} height={30} className="fill-panel" />
      {/* Blackout blinds and a lamp over the table */}
      {[60, 240, 420].map((x) => (
        <rect key={x} x={x} y={30} width={110} height={60} className="fill-case" />
      ))}
      <path d="M300 0 L300 40 M280 56 L300 40 L320 56 Z" className="fill-room-ink stroke-room-ink" strokeWidth={2} />
      <path d="M260 56 L340 56 L380 150 L220 150 Z" className="fill-lamp-on/15" />
      <rect x={80} y={160} width={440} height={6} className="fill-room-ink" />
      <rect x={100} y={166} width={6} height={24} className="fill-room-ink" />
      <rect x={494} y={166} width={6} height={24} className="fill-room-ink" />
      {[120, 230, 340, 450].map((x, i) => (
        <Seated key={x} transform={`translate(${x} 190) scale(0.85)`} className={i === 3 ? "text-brass" : "text-room-ink"} />
      ))}
      {/* Message slips passed along the table, from one desk to the next */}
      {Array.from({ length: slips }, (_, i) => {
        const t = unit(p * 1.4 - i * 0.12);
        const x = lerp(110, 470, t);
        return <rect key={i} x={x} y={150 - (i % 2) * 4} width={22} height={10} className="fill-paper stroke-room-ink/40" transform={`rotate(${(i % 3) - 1} ${x} 150)`} />;
      })}
      {p > 0.75 && (
        <text x={470} y={124} textAnchor="middle" className="fill-cable font-stencil text-[13px] font-bold tracking-[0.2em]">
          WETTER…
        </text>
      )}
    </Plate>
  );
}

/** 09:15 to 10:00: the menu goes across to the Bombe hut, where Wrens plug it up. */
function MenuToBombe({ p }: { p: number }) {
  const walk = along(p, 0, 0.6);
  const x = lerp(170, 420, walk);
  const cables = Math.round(along(p, 0.6, 1) * 5);
  return (
    <Plate viewBox="0 0 600 220" figure="09:30" caption="The menu goes across to the Bombe hut. The Wrens plug it up at the back of the machine, a cable for every link, and start the run.">
      <rect x={0} y={0} width={600} height={170} className="fill-brass-soft" />
      <rect x={0} y={168} width={600} height={52} className="fill-signal-in/15" />
      <path d="M0 196 Q300 176 600 196" className="fill-none stroke-paper" strokeWidth={10} />
      {[
        [20, "HUT 6"],
        [440, "BOMBES"],
      ].map(([hx, name]) => (
        <g key={name as string} transform={`translate(${hx} 170)`} className="fill-room-ink">
          <path d="M0 0 L0 -60 L70 -84 L140 -60 L140 0 Z" />
          <rect x={56} y={-30} width={26} height={30} className="fill-room-ink/60" />
          <text x={70} y={-38} textAnchor="middle" className="fill-paper font-stencil text-[13px] font-bold tracking-[0.25em]">
            {name}
          </text>
        </g>
      ))}
      <g transform={`translate(${x} 188)`}>
        <Standing transform="scale(0.7)" cap />
        <rect x={6} y={-44} width={12} height={15} className="fill-paper stroke-room-ink/50" />
      </g>
      {/* The plugged cables, filling in at the back of the Bombe */}
      {Array.from({ length: cables }, (_, i) => (
        <path key={i} d={`M${454 + i * 14} 162 q7 -22 14 0`} className="fill-none stroke-cable" strokeWidth={3} />
      ))}
    </Plate>
  );
}

/** 12:30 to 14:00, the German side: the bomber wing is fuelled and armed for the afternoon. */
function Fuelling({ p }: { p: number }) {
  const bowser = lerp(-60, 210, along(p, 0, 0.5));
  return (
    <Plate viewBox="0 0 600 260" figure="13:00" caption="At the airfield in France the bomber wing is fuelled and armed, waiting for the order that will send it out.">
      <Airfield sky="fill-brass-soft" sun={{ x: 300, y: 50 }}>
        <BomberSide transform="translate(170 196)" />
        <BomberSide transform="translate(320 196) scale(0.8)" className="text-room-ink/80" />
        <Bowser transform={`translate(${bowser} 196) scale(0.9)`} />
        {p > 0.5 && <path d={`M${bowser + 50} 182 Q${bowser + 80} 150 172 166`} className="fill-none stroke-room-ink" strokeWidth={2} />}
        {/* Bombs on a trolley, wheeled in as the afternoon goes on */}
        <g transform={`translate(${lerp(-80, 120, along(p, 0.4, 0.9))} 196)`}>
          <rect x={0} y={-8} width={40} height={4} className="fill-room-ink" />
          <circle cx={6} cy={-2} r={3} className="fill-room-ink" />
          <circle cx={34} cy={-2} r={3} className="fill-room-ink" />
          {[4, 18].map((bx) => (
            <path key={bx} d={`M${bx} -14 L${bx + 12} -14 Q${bx + 18} -11 ${bx + 12} -8 L${bx} -8 Z`} className="fill-room-ink" />
          ))}
        </g>
      </Airfield>
    </Plate>
  );
}

/** 16:00 to midnight: the bombers come home at sunset, convinced a spotter plane gave them away. */
function Homecoming({ p }: { p: number }) {
  const t = along(p, 0, 0.8);
  const x = lerp(-40, 250, t);
  const y = lerp(80, 196, t * t);
  return (
    <Plate viewBox="0 0 600 260" figure="18:30" caption="The bombers come home at sunset. The unit blames the spotter plane seen over the convoy that morning. The secret holds.">
      <rect x={0} y={0} width={600} height={200} className="fill-brass-soft" />
      <rect x={0} y={0} width={600} height={200} className="fill-cable/20" opacity={p} />
      <Airfield sky="fill-none" sun={{ x: 470, y: 120 + p * 80 }}>
        <g transform={`translate(${x} ${y}) rotate(${lerp(8, 0, t)})`}>
          <BomberSide transform="scale(0.8)" wheels={t > 0.6} />
        </g>
        <BomberSide transform="translate(330 196) scale(0.7)" className="text-room-ink/70" />
      </Airfield>
    </Plate>
  );
}

/** The moments between two events that get a picture, keyed by the event they follow; each moves from 0 to 1 as it is scrolled past. */
export const INTERLUDES: Record<string, { Scene: (props: { p: number }) => React.ReactNode }> = {
  midnight: { Scene: Dawn },
  registry: { Scene: CribRoom },
  menu: { Scene: MenuToBombe },
  hut3: { Scene: Fuelling },
  attack: { Scene: Homecoming },
  transmit: { Scene: MorseAcross },
  intercept: { Scene: DispatchRun },
  broken: { Scene: HutToHut },
  ultra: { Scene: Interception },
};

