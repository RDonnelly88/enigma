import { ImageResponse } from "next/og";

export const alt = "ENIGMA, with three rotor windows and a lit lamp: the machine Germany trusted, and how it was broken.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The share image is drawn outside the page, so its colours are the theme's values written out: the case, brass and paper
const CASE = "#1d1c1a";
const BRASS = "#c9a240";
const PAPER = "#efe6d4";
const RED = "#b0362c";

/** The card a shared link shows: the machine's name, its windows and a lamp, stamped like a file. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: CASE, color: PAPER, position: "relative" }}>
        <div style={{ fontSize: 28, letterSpacing: 12, color: BRASS }}>1918 – 1945</div>
        <div style={{ fontSize: 190, fontWeight: 700, letterSpacing: 30, lineHeight: 1, marginTop: 10 }}>ENIGMA</div>
        <div style={{ fontSize: 40, marginTop: 24, maxWidth: 820, lineHeight: 1.3, color: "#d9d2c3" }}>
          The machine Germany trusted with its secrets, how it worked, and how it was broken.
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 44, alignItems: "center" }}>
          {["B", "L", "Q"].map((l) => (
            <div key={l} style={{ width: 74, height: 96, borderRadius: 10, background: PAPER, color: CASE, fontSize: 60, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `5px solid ${BRASS}` }}>
              {l}
            </div>
          ))}
          <div style={{ width: 70, height: 70, borderRadius: 35, marginLeft: 30, background: "#ffd36b", boxShadow: "0 0 50px 18px rgba(255, 211, 107, 0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: CASE, fontSize: 40, fontWeight: 700 }}>
            X
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 80, right: 80, transform: "rotate(-10deg)", border: `6px solid ${RED}`, color: RED, fontSize: 40, fontWeight: 700, letterSpacing: 8, padding: "6px 20px", opacity: 0.85 }}>
          MOST SECRET
        </div>
      </div>
    ),
    size,
  );
}
