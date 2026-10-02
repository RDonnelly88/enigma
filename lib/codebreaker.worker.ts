import { breakCipher, type Options, type Progress } from "./codebreaker";

// The search runs for several seconds of solid arithmetic; in a worker the page
// keeps animating and the Stop button keeps working.
self.onmessage = (event: MessageEvent<{ ciphertext: string; options: Options }>) => {
  breakCipher(event.data.ciphertext, event.data.options, (progress: Progress) => self.postMessage(progress));
};
