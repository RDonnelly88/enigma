import { expect, test } from "@playwright/test";

// A full search takes a few seconds of real computation in the browser
const BREAK_TIMEOUT = 120_000;

test.beforeEach(async ({ page }) => {
  await page.goto("/codebreaker");
  // Wait for the page to hydrate, or typing lands before React is listening
  await page.waitForLoadState("networkidle");
});

test("is reachable from the header", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "By computer" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "By computer" })).toBeVisible();
});

test("needs enough ciphertext to try", async ({ page }) => {
  await page.getByRole("textbox", { name: /Ciphertext/ }).fill("QWERTYUIOP");
  await expect(page.getByRole("button", { name: "Break it" })).toBeDisabled();
  await expect(page.getByText("Needs at least 100 letters")).toBeVisible();
});

test.describe("full searches", () => {
  test.skip(({ isMobile }) => isMobile, "The same search; once is enough");
  test.setTimeout(BREAK_TIMEOUT * 2);

  test("breaks the six-cable intercept and checks it on the machine", async ({ page }) => {
    await page.getByRole("button", { name: /Six cables/ }).click();
    await page.getByRole("button", { name: "Break it" }).click();
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
    const verdict = page.getByTestId("verdict");
    await expect(verdict).toHaveAttribute("data-broken", "true", { timeout: BREAK_TIMEOUT });
    await expect(verdict).toContainText("AN DAS OBERKOMMANDO DER WEHRMACHT");

    await verdict.getByRole("link", { name: "Check it on the machine" }).click();
    await expect(page).toHaveURL("/machine");
    await expect(page.getByTestId("tape-output")).toContainText("ANXDA SXOBE RKOMM ANDOX");
  });

  test("admits it can't break the ten-cable intercept", async ({ page }) => {
    await page.getByRole("button", { name: /Ten cables/ }).click();
    await page.getByRole("button", { name: "Break it" }).click();
    const verdict = page.getByTestId("verdict");
    await expect(verdict).toContainText("Not broken", { timeout: BREAK_TIMEOUT });
    await expect(verdict.getByRole("link", { name: "crib dragger" })).toBeVisible();
  });

  test("can be stopped", async ({ page }) => {
    await page.getByRole("button", { name: "Break it" }).click();
    await page.getByRole("button", { name: "Stop" }).click();
    await expect(page.getByText(/^Stopped/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
  });
});

test("a long result never widens the page", async ({ page }) => {
  test.setTimeout(BREAK_TIMEOUT * 2);
  await page.getByRole("button", { name: /English/ }).click();
  await page.getByRole("button", { name: "Break it" }).click();
  await page.getByTestId("verdict").waitFor({ timeout: BREAK_TIMEOUT });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
