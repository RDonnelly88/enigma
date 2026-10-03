/**
 * Two choices a reader makes once and keeps: light or dark, and reading in
 * short or in detail. Each lives as an attribute on <html>, which the CSS
 * reads, and in localStorage, which the inline script reads back before the
 * first paint so a returning reader never sees the other version flash past.
 */
export const PREFERENCES = {
  theme: { attribute: "data-theme", store: "enigma.theme", values: ["light", "dark"] },
  read: { attribute: "data-read", store: "enigma.read", values: ["short", "detail"] },
} as const;

export type Preference = keyof typeof PREFERENCES;
export type Theme = (typeof PREFERENCES.theme.values)[number];
export type Reading = (typeof PREFERENCES.read.values)[number];

/** Runs in <head> before anything is drawn; only accepts values it knows, so a stale store can't break the page. */
export const PREPAINT = `(function(){var p=${JSON.stringify(PREFERENCES)};for(var k in p){try{var v=localStorage.getItem(p[k].store);if(p[k].values.indexOf(v)>=0)document.documentElement.setAttribute(p[k].attribute,v)}catch(e){}}})()`;

export function choose(preference: Preference, value: string) {
  const { attribute, store } = PREFERENCES[preference];
  document.documentElement.setAttribute(attribute, value);
  try {
    window.localStorage.setItem(store, value);
  } catch {}
}
