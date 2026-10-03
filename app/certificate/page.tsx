import type { Metadata } from "next";
import { Quiz } from "@/components/certificate/quiz";
import { PageHero } from "@/components/ui/page-hero";
import { PASS_MARK, QUESTIONS } from "@/lib/quiz";

export const metadata: Metadata = { title: "Codebreaker’s certificate" };

export default function CertificatePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <div className="no-print">
        <PageHero eyebrow="The final test" title="Codebreaker’s certificate">
          <p>
            {QUESTIONS.length} questions on everything from the lamps to the Bombe. Get {PASS_MARK} or more right and earn a certificate with your
            name on it, enciphered on Enigma.
          </p>
        </PageHero>
      </div>
      <Quiz />
    </main>
  );
}
