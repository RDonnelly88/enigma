/** The site's pages, in the order the story reads. The header and each page's closing link both follow it. */
export const PAGES = [
  { href: "/", label: "The story", lead: "" },
  {
    href: "/machine",
    label: "The machine",
    lead: "Try the machine yourself: every key press traced through every part, with lessons from the signals school.",
  },
  {
    href: "/day",
    label: "A day in 1941",
    lead: "See it in use: one day of messages, from a German signals post at midnight to Bletchley Park reading its orders.",
  },
  {
    href: "/crib",
    label: "Cribs & the Bombe",
    lead: "How did Bletchley do it? Guess a word, build a menu and run the Bombe until a message reads.",
  },
  {
    href: "/codebreaker",
    label: "Codebreaker",
    lead: "Break a message with no key and no crib at all, the way a computer does it today.",
  },
  {
    href: "/certificate",
    label: "Certificate",
    lead: "Two tests: a quiz on everything you’ve seen, and an intercept to break yourself with a crib and a Bombe, against the clock.",
  },
] as const;
