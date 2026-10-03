import type { Metadata } from "next";
import Link from "next/link";
import { DayView } from "@/components/day/day-view";
import { Prose } from "@/components/ui/chapter";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "A day in 1941",
  description: "One day of Enigma traffic, from the German operator's midnight key change to Bletchley Park reading his orders within the hour.",
};

export default function ADayIn1941() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <PageHero eyebrow="A reconstruction" title="A day in 1941">
        <p>
          One day, two sides. A Luftwaffe signals unit in France sends its morning weather report and an afternoon order,
          sure that no one can read them. Across the Channel, Bletchley Park is already listening. Play the day, or drag the
          clock, and watch both.
        </p>
      </PageHero>
      <Prose className="-mt-8 mb-6">
        <p className="text-base text-room-muted">
          The unit, the people and the messages are invented, and the times are illustrative. The procedures are the real
          ones, and everything on the page, from the key sheet to the Bombe&rsquo;s stops and the decrypts, is computed
          on the machine as you watch. You can try each step yourself on the{" "}
          <Link href="/machine" className="text-brass underline underline-offset-2">machine</Link>,{" "}
          <Link href="/crib" className="text-brass underline underline-offset-2">crib and Bombe</Link> pages.
        </p>
      </Prose>
      <DayView />
    </main>
  );
}
