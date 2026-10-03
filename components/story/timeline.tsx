import { Glossed } from "@/components/glossary/glossary";
import { Vignette } from "@/components/art/vignettes";
import { Rail, RailCard } from "@/components/ui/rail";
import type { Moment } from "@/lib/story/history";

/** History as a rail of cards to swipe through, years in brass along the top. */
export function Timeline({ label, moments }: { label: string; moments: Moment[] }) {
  return (
    <div className="-mx-4">
      <Rail label={label}>
        {moments.map((m) => (
          <RailCard key={m.when + m.title}>
            {m.art && <Vignette id={m.art} />}
            <p className="font-stencil text-3xl font-bold text-brass">{m.when}</p>
            <h3 className="mt-2 font-semibold">{m.title}</h3>
            <p className="mt-2 font-serif text-[0.95rem] leading-relaxed text-room-ink/85"><Glossed text={m.text} /></p>
          </RailCard>
        ))}
      </Rail>
    </div>
  );
}
