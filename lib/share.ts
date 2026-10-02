import { validate, type Settings } from "./enigma";

/**
 * A link that opens the machine set to a key with a message ready to type,
 * so a broken key can be checked on the machine itself.
 */
export function machineLink(settings: Settings, text: string) {
  const params = new URLSearchParams({ key: JSON.stringify(settings), text });
  return `/machine?${params}`;
}

export function readMachineLink(search: string): { settings: Settings; text: string } | null {
  const params = new URLSearchParams(search);
  const raw = params.get("key");
  if (!raw) return null;
  try {
    const settings = JSON.parse(raw) as Settings;
    // Anything arriving in a URL could be anything; the machine only takes what it can run
    if (!settings || !Array.isArray(settings.rotors) || validate(settings).length > 0) return null;
    return { settings, text: params.get("text") ?? "" };
  } catch {
    return null;
  }
}
