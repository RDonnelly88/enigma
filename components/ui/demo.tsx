import { cn } from "@/lib/cn";

/** A frame around an interactive diagram, with a title and a line telling you what to do with it. */
export function Demo({
  title,
  prompt,
  children,
  className,
}: {
  title: string;
  prompt?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("rounded-xl border border-panel-edge bg-panel p-4 shadow-sm sm:p-6", className)}>
      <figcaption className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-stencil text-lg font-bold tracking-wide">{title}</span>
        {prompt && <span className="text-xs font-medium tracking-wide text-brass uppercase">{prompt}</span>}
      </figcaption>
      {children}
    </figure>
  );
}
