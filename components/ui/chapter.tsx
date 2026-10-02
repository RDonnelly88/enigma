import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

/** One chapter of a story page: a number, a title, an opening paragraph and its content. */
export function Chapter({
  id,
  number,
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  id: string;
  number: number;
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
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
        <div className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-room-ink/90 sm:text-xl">{intro}</div>
      </Reveal>
      {children && <div className="mt-12 flex flex-col gap-12">{children}</div>}
    </section>
  );
}

/** Long-form reading inside a chapter. */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Reveal className={cn("max-w-2xl space-y-4 font-serif text-[1.075rem] leading-relaxed text-room-ink/90", className)}>
      {children}
    </Reveal>
  );
}

/** A pulled-out fact or quotation set large in the margin of the story. */
export function Aside({ children, source }: { children: React.ReactNode; source?: string }) {
  return (
    <Reveal>
      <blockquote className="max-w-2xl border-l-2 border-brass pl-5">
        <p className="font-serif text-2xl leading-snug text-room-ink italic sm:text-3xl">{children}</p>
        {source && <footer className="mt-2 text-sm text-room-muted">{source}</footer>}
      </blockquote>
    </Reveal>
  );
}
