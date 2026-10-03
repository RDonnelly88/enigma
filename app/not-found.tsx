import Link from "next/link";
import { Stamp } from "@/components/ui/stamp";
import { DEFAULT_SETTINGS, encipher, lettersToPositions } from "@/lib/enigma";

const GARBLED = encipher({ ...DEFAULT_SETTINGS, positions: lettersToPositions("XYZ") }, "THISPAGEDOESNOTEXIST").text;

/** A page that isn't there, as an intercept that wouldn't break. */
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-4 py-24 text-center">
      <div className="relative w-full rounded-sm bg-paper p-8 text-paper-ink shadow-lg">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-paper-muted uppercase">Intercept · page not found</p>
        <p className="mt-4 font-type text-2xl tracking-[0.25em] break-all">{GARBLED.match(/.{1,5}/g)!.join(" ")}</p>
        <Stamp tilt={-9} className="mt-6 text-2xl">
          No stop
        </Stamp>
      </div>
      <div>
        <h1 className="font-stencil text-4xl font-bold tracking-wide">This page wouldn&rsquo;t decipher</h1>
        <p className="mt-3 font-serif text-lg leading-relaxed text-room-ink/85">
          Every setting was tried and none of them reads. Perhaps the address was garbled on the way.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-room-ink px-5 py-2.5 text-sm font-semibold text-room">
          Back to the story
        </Link>
        <Link href="/machine" className="rounded-full border border-panel-edge px-5 py-2.5 text-sm font-semibold hover:border-brass">
          Try the machine
        </Link>
      </div>
    </main>
  );
}
