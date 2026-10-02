import { cn } from "@/lib/cn";

/**
 * Rises gently into place as it scrolls into view. Done in CSS with a
 * scroll-driven animation, so nothing waits on JavaScript; browsers without
 * support, and anyone who prefers reduced motion, just see it in place.
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
