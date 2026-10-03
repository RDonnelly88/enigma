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
  await expect(page.getByTestId("in-short").first()).toBeVisible();
  await page.getByRole("radio", { name: "The detail" }).click();
  await expect(page.getByTestId("in-short").first()).toBeHidden();
});
