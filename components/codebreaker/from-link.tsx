"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { readSecret } from "@/lib/share";
import { CodebreakerTool } from "./codebreaker-tool";

function WithCipher() {
  return <CodebreakerTool initialCiphertext={readSecret(useSearchParams().toString())} />;
}

/** The codebreaker, starting on a message passed in the link if there is one, such as a secret with no key. */
export function CodebreakerFromLink() {
  return (
    <Suspense fallback={<CodebreakerTool />}>
      <WithCipher />
    </Suspense>
  );
}
