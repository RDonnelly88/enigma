import { cn } from "@/lib/cn";

/**
 * An illustration set as a plate in a wartime book: ruled border, a figure
 * number in stencil and a caption beneath. The picture is decoration; the
 * caption says what it shows, so the figure is labelled by it.
 */
export function Plate({
  figure,
  caption,
  viewBox,
  children,
  className,
}: {
  figure?: string;
  caption: React.ReactNode;
  viewBox: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-sm border border-panel-edge bg-panel shadow-sm", className)}>
      <svg viewBox={viewBox} className="block w-full" aria-hidden>
        {children}
      </svg>
      <figcaption className="flex items-baseline gap-3 border-t border-panel-edge px-4 py-2 text-sm text-room-muted">
        {figure && <span className="shrink-0 font-stencil text-xs font-bold tracking-[0.2em] text-brass uppercase">{figure}</span>}
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

/** Rows of little wave strokes, drifting, for any sea. */
export function Waves({ rows, from = -40, to = 1280, className = "stroke-room-ink/25" }: { rows: number[]; from?: number; to?: number; className?: string }) {
  const xs = Array.from({ length: Math.ceil((to - from) / 40) + 1 }, (_, i) => from + i * 40);
  return (
    <g className="art-waves">
      {rows.map((y, r) => (
        <path
          key={y}
          d={xs.map((x) => `M${x + (r % 2) * 20} ${y} q10 -4 20 0`).join(" ")}
          fill="none"
          strokeWidth={1.4}
          strokeLinecap="round"
          className={className}
        />
      ))}
    </g>
  );
}

/** A fixed scatter: the same stars in the same places on every visit, with no pattern to the eye. */
const scatter = (i: number, salt: number) => {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** Stars in a night sky. */
export function Stars({ count, width, height }: { count: number; width: number; height: number }) {
  return (
    <g className="fill-case-ink/70">
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={Math.round(scatter(i, 1) * width)} cy={Math.round(scatter(i, 2) * height) + 4} r={scatter(i, 3) > 0.7 ? 1.4 : 0.9} />
      ))}
    </g>
  );
}
