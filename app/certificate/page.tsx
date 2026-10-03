import type { Metadata } from "next";
import { Tests } from "@/components/certificate/tests";
import { PageHero } from "@/components/ui/page-hero";
import { PASS_MARK } from "@/lib/quiz";

export const metadata: Metadata = { title: "Codebreaker’s certificate" };

export default function CertificatePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <div className="no-print">
        <PageHero eyebrow="The final test" title="Codebreaker’s certificate">
          <p>
            Two tests. A quiz on everything from the lamps to the Bombe: get {PASS_MARK} or more right and earn a certificate with
            your name enciphered on it. Then break a wartime-style intercept yourself, with a crib and a Bombe, against the clock.
          </p>
        </PageHero>
      </div>
      <Tests />
    </main>
  );
}
