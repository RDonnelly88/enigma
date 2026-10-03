import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** A way from a story diagram to the same idea on the real machine, as a signals school lesson. */
export function TryIt({ lesson, children }: { lesson: string; children: React.ReactNode }) {
  return (
    <Link
      href={`/machine?lesson=${lesson}`}
      className="mt-6 inline-flex items-center gap-2 rounded-full border border-brass px-4 py-2 text-sm font-semibold text-brass transition-colors hover:bg-brass hover:text-brass-ink"
    >
      {children} <ArrowRight className="size-4" />
    </Link>
  );
}
