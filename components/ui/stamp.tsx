import { cn } from "@/lib/cn";

const INK = {
  red: "border-cable text-cable",
  green: "border-signal-in text-signal-in",
  ink: "border-room-ink text-room-ink",
};

/**
 * A rubber stamp, the way paperwork was marked in the 1940s: a ruled box of
 * stencilled capitals at a slant, the ink worn in places. Decoration only, so
 * whatever it says must also be said in the text around it.
 */
export function Stamp({
  children,
  ink = "red",
  tilt = -8,
  className,
}: {
  children: React.ReactNode;
  ink?: keyof typeof INK;
  tilt?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "stamp inline-block rounded-sm border-[3px] px-2 py-0.5 font-stencil font-bold tracking-[0.2em] uppercase opacity-85 select-none",
        INK[ink],
        className,
      )}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {children}
    </span>
  );
}
