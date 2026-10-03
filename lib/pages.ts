/** The site's pages, in the order the story reads. The header and each page's closing link both follow it. */
export const PAGES = [
  { href: "/", label: "How it worked", lead: "" },
  {
    href: "/machine",
    label: "Try the machine",
    lead: "Try the machine yourself: every key press traced through every part, with lessons from the signals school.",
  },
  {
    href: "/crib",
    label: "Breaking Enigma",
    lead: "How was it broken? From Warsaw to Bletchley Park: guess a word, build a menu and run the Bombe until a message reads.",
  },
  {
    href: "/day",
    label: "A day in 1941",
    lead: "Now watch both sides at once: one day of messages, from a German signals post at midnight to Bletchley Park reading its orders.",
  },
  {
    href: "/atlantic",
    label: "The U-boat war",
    lead: "Where it mattered most: the Battle of the Atlantic, the codebooks taken at sea, and the four-rotor machine that went dark for ten months.",
  },
  {
    href: "/codebreaker",
    label: "By computer",
    lead: "Break a message with no key and no crib at all, the way a computer does it today.",
  },
  {
    href: "/certificate",
    label: "Test yourself",
    lead: "Two tests: a quiz on everything you’ve seen, and an intercept to break yourself with a crib and a Bombe, against the clock.",
  },
] as const;
