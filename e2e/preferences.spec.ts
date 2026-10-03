import { expect, test } from "@playwright/test";

test("the theme toggle flips the room and remembers it", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
  const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(after).not.toBe(before);
  await page.reload();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(after);
});

test("in short swaps the long reading for summaries, and stays chosen across pages", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const summary = page.getByTestId("in-short").first();
  await expect(summary).toBeHidden();
  await page.getByRole("radio", { name: "In short" }).click();
  await expect(summary).toBeVisible();
  await expect(page.getByText("Radio changed war.")).toBeHidden();
  await page.goto("/crib");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("in-short").first()).toBeVisible();
  await page.getByRole("radio", { name: "The detail" }).click();
  await expect(page.getByTestId("in-short").first()).toBeHidden();
});

test("the sound switch is remembered across pages and reloads", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-sound", "off");
  await page.goto("/machine");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: "Turn sound on" })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-sound", "off");
  await page.getByRole("button", { name: "Turn sound on" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-sound", "on");
});

test("an intercept can be played in Morse, with the lamp for when the sound is off", async ({ page }) => {
  await page.goto("/crib");
  await page.waitForLoadState("networkidle");
  const listen = page.getByRole("button", { name: "Listen to it in Morse" }).first();
  await listen.click();
  await expect(page.getByTestId("listen-now").first()).toBeVisible();
  // Turning sound off mid-message silences it but leaves the lamp to read by
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(page.getByTestId("listen-now").first()).toBeVisible();
  await page.getByRole("button", { name: "Stop the Morse" }).first().click();
  await expect(page.getByTestId("listen-now")).toHaveCount(0);
});
