import { expect, test } from "@playwright/test";
import { hunt, sector } from "../lib/story/asdic";

test.beforeEach(async ({ page }) => {
  await page.goto("/atlantic");
  await page.waitForLoadState("networkidle");
});

test("tells the story chapter by chapter", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "The U-boat war" })).toBeVisible();
  for (const title of ["The lifeline", "The navy’s Enigma", "Pinches", "The blackout", "U-559", "The fourth wheel", "The tide turns"]) {
    await expect(page.getByRole("heading", { level: 2, name: title })).toBeAttached();
  }
});

test("the four-rotor machine matches the three-rotor one only with its fourth wheel at A", async ({ page }) => {
  const wheel = page.getByLabel("Fourth wheel at");
  const verdict = page.getByTestId("twin-verdict");
  await expect(verdict).toContainText("agree, by chance");
  await wheel.focus();
  await wheel.press("Home");
  await expect(verdict).toContainText("Identical, letter for letter");
  await expect(page.getByTestId("m4-out")).toHaveText((await page.getByTestId("m3-out").textContent())!);
  await wheel.press("ArrowRight");
  await expect(verdict).toContainText("agree, by chance");
});

test("Ultra shows the packs in 1941 and hides them in 1942", async ({ page }) => {
  const router = page.getByRole("figure").filter({ hasText: "Route the convoy" });
  await expect(router.getByTestId("ultra-state")).toContainText("the packs can be seen");
  await expect(router.locator('[data-testid^="pack-"]')).toHaveCount(1);

  // Steer round the pack Ultra shows, and the convoy gets through
  const pack = (await router.locator('[data-testid^="pack-"]').getAttribute("data-testid"))!.replace("pack-", "");
  const clear = { north: "Central route", centre: "Southern route", south: "Northern route" }[pack]!;
  await router.getByRole("button", { name: clear }).click();
  await expect(router.getByTestId("convoy-outcome")).toContainText("Through unseen");
  await expect(router.getByTestId("convoy-tally")).toContainText("1 of 1 convoy through unseen");

  await router.getByRole("radio", { name: "1942" }).click();
  await expect(router.getByTestId("ultra-state")).toContainText("hidden");
  await expect(router.locator('[data-testid^="pack-"]')).toHaveCount(0);
  await router.getByRole("button", { name: "Northern route" }).click();
  // Once the convoy has sailed, the packs show where they were
  await expect(router.locator('[data-testid^="pack-"]')).toHaveCount(2);
  await expect(router.getByTestId("convoy-outcome")).toBeVisible();
});

test("ASDIC finds the U-boat only on its bearing, and the depth charges need a contact", async ({ page }) => {
  const game = page.getByRole("figure").filter({ hasText: "Hunt the U-boat" });
  const { bearing } = hunt(1);
  await expect(game.getByTestId("asdic-hint")).toContainText(`a U-boat to the ${sector(bearing)}`);
  const beam = game.getByLabel("Beam bearing");
  const says = game.getByTestId("asdic-says");

  await beam.fill(String((bearing + 180) % 360));
  await game.getByRole("button", { name: "Ping" }).click();
  await expect(says).toContainText("No echo");
  await expect(game.getByTestId("asdic-contact")).toHaveCount(0);

  await beam.fill(String(bearing));
  await game.getByRole("button", { name: "Ping" }).click();
  await expect(says).toContainText("Echo!");
  await expect(game.getByTestId("asdic-contact")).toBeVisible();
  await game.getByRole("button", { name: "Drop depth charges" }).click();
  await expect(says).toContainText("the U-boat is sunk, found in 2 pings");
  await expect(game.getByRole("button", { name: "Ping" })).toBeDisabled();
});
