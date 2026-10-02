# Enigma

A working Enigma machine in the browser. Set the rotors, plug the cables and
press a key: the rotors turn, the current runs through the machine and a lamp
lights. Open the wiring view to watch the current's path through every part.

It models the army's three-rotor M3 and the navy's four-rotor M4, with
rotors I to VIII, reflectors A, B and C, the thin reflectors and the Beta and
Gamma wheels. Two real intercepted messages are included to decrypt.

Two more pages are about breaking it. The crib dragger slides a guessed word
along an intercept and rules out every position where a letter would encrypt
as itself, then draws the menu Turing's Bombe was wired from. The codebreaker
recovers a key from the ciphertext alone with Gillogly's statistical attack,
running in a Web Worker: it succeeds on long messages with a light plugboard
and, like the method itself, fails on the ten-cable traffic of 1939 onwards.

## Running it

```bash
npm install
npm run dev       # http://localhost:3000
npm run check     # typecheck, lint, dead code, unit tests
npm run e2e       # Playwright, desktop and phone
```

## Where things live

| | |
|---|---|
| `lib/enigma.ts` | The machine itself: pure functions, no UI |
| `lib/messages.ts` | The historical intercepts and the practice messages |
| `lib/crib.ts` | Crib positions and the Bombe's menu |
| `lib/codebreaker.ts` | The ciphertext-only attack; `lib/corpus.ts` is the text it learns letter pairs from |
| `hooks/use-machine.ts` | Machine state for the page: settings, tape, held key |
| `components/machine/` | Keyboard, lampboard, rotors, plugboard, the lid and the wiring view |
| `tests/` | The machine checked against known historical settings and messages |
| `e2e/` | Playwright; `screenshots.spec.ts` is the visual record |

The unit tests are the proof the machine is right: the `AAAAA` → `BDZGO`
check value, the middle rotor's double step, the two-notch naval rotors, and
full decrypts of an Operation Barbarossa message and an M4 message to U-534.

## Deploying

Vercel, with no environment variables: there's no backend. Merging to `main`
deploys production, and every branch gets a preview.
