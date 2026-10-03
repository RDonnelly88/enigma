"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bench } from "@/components/machine/bench";
import { readAddress, readSecret } from "@/lib/share";

/** Reads the link the visitor arrived by: a lesson to open, or a secret message to read. */
function FromLink() {
  const params = useSearchParams();
  const cipher = readSecret(params.toString());
  return <Bench lesson={params.get("lesson")} incoming={cipher ? { cipher, ...readAddress(params.toString()) } : null} />;
}

export default function MachinePage() {
  return (
    // The server renders the plain bench; the browser swaps in the one that knows the link
    <Suspense fallback={<Bench />}>
      <FromLink />
    </Suspense>
  );
}
