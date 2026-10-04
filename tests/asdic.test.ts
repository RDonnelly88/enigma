import { describe, expect, it } from "vitest";
import { BEAM, apart, hunt, move, ping, sector } from "@/lib/story/asdic";

describe("ASDIC", () => {
  it("hears an echo only from within the beam", () => {
    const h = hunt(3);
    expect(ping(h, h.bearing)).not.toBeNull();
    expect(ping(h, (h.bearing + BEAM) % 360)).not.toBeNull();
    expect(ping(h, (h.bearing + BEAM + 5) % 360)).toBeNull();
    expect(ping(h, (h.bearing + 180) % 360)).toBeNull();
  });

  it("times the echo by the speed of sound in seawater, there and back", () => {
    const echo = ping({ bearing: 0, range: 2000, closing: true }, 0)!;
    expect(echo.after).toBeCloseTo(2.44, 1);
    expect(echo.shift).toBeGreaterThan(0);
    expect(ping({ bearing: 0, range: 2000, closing: false }, 0)!.shift).toBeLessThan(0);
  });

  it("measures bearings either way round the compass", () => {
    expect(apart(355, 5)).toBe(10);
    expect(apart(90, 270)).toBe(180);
  });

  it("loses the U-boat once it is too close, as the beam passes over it", () => {
    let h = { bearing: 40, range: 500, closing: true };
    for (let i = 0; i < 5; i++) h = move(h, i);
    expect(ping(h, h.bearing)).toBeNull();
  });

  it("hides the U-boat in a different place each hunt, within the plot", () => {
    const hunts = Array.from({ length: 20 }, (_, i) => hunt(i));
    expect(new Set(hunts.map((h) => h.bearing)).size).toBeGreaterThan(10);
    for (const h of hunts) {
      expect(h.range).toBeGreaterThanOrEqual(700);
      expect(h.range).toBeLessThanOrEqual(2500);
    }
  });
});

describe("the Ultra hint", () => {
  it("names the compass point nearest the U-boat", () => {
    expect(sector(0)).toBe("north");
    expect(sector(350)).toBe("north");
    expect(sector(130)).toBe("south-east");
    expect(sector(270)).toBe("west");
  });
});
