/** The opening of a page: a small brass label, a big stencilled title and a paragraph setting the scene. */
export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <header className="py-16 sm:py-24">
      <p className="text-xs font-semibold tracking-[0.3em] text-brass uppercase">{eyebrow}</p>
      <h1 className="mt-4 font-stencil text-[clamp(3rem,10vw,6.5rem)] leading-[0.9] font-bold tracking-wide">{title}</h1>
      <div className="mt-6 max-w-2xl font-serif text-xl leading-relaxed text-room-ink/90 sm:text-2xl">{children}</div>
    </header>
  );
}
