import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

/** A chapter for a reader in a hurry, or a younger one: what happened, and the one idea to take away. */
export type Short = { says: string; bigIdea: string };

/** One chapter of a story page: a number, a title, an opening paragraph and its content. */
export function Chapter({
  id,
  number,
  eyebrow,
  title,
  intro,
  short,
  children,
  className,
}: {
  id: string;
  number: number;
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  short?: Short;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} data-chapter className={cn("scroll-mt-24 py-16 sm:py-24", className)}>
      <Reveal>
        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-brass uppercase">
          <span className="font-stencil text-base">{String(number).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-brass" aria-hidden />
          {eyebrow}
        </p>
        <h2 id={`${id}-title`} className="mt-3 max-w-3xl font-stencil text-4xl leading-none font-bold tracking-wide text-balance sm:text-6xl">
          {title}
        </h2>
        <div className={cn("mt-6 max-w-2xl font-serif text-lg leading-relaxed text-room-ink/90 sm:text-xl", short && "detail-only")}>
          {intro}
        </div>
        {short && (
          <div className="short-only mt-6 max-w-2xl rounded-xl border border-brass/40 bg-panel p-5 sm:p-6" data-testid="in-short">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-brass uppercase">In short</p>
            <p className="mt-2 text-lg leading-relaxed sm:text-xl">{short.says}</p>
            <p className="mt-4 flex items-start gap-2.5 rounded-lg bg-brass-soft px-3 py-2.5 font-semibold">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-brass" aria-hidden />
              <span>
                <span className="sr-only">The big idea: </span>
                {short.bigIdea}
              </span>
            </p>
          </div>
        )}
      </Reveal>
      {children && <div className="mt-12 flex flex-col gap-12">{children}</div>}
    </section>
  );
}

/** Long-form reading inside a chapter. */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Reveal className={cn("detail-only max-w-2xl space-y-4 font-serif text-[1.075rem] leading-relaxed text-room-ink/90", className)}>
      {children}
    </Reveal>
  );
}

/** A pulled-out fact or quotation set large in the margin of the story. */
export function Aside({ children, source }: { children: React.ReactNode; source?: string }) {
  return (
    <Reveal className="detail-only">
      <blockquote className="max-w-2xl border-l-2 border-brass pl-5">
        <p className="font-serif text-2xl leading-snug text-room-ink italic sm:text-3xl">{children}</p>
        {source && <footer className="mt-2 text-sm text-room-muted">{source}</footer>}
      </blockquote>
    </Reveal>
  );
}
