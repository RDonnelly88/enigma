import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/day");
  await page.waitForLoadState("networkidle");
});

test("events open as the clock reaches them", async ({ page }) => {
  await expect(page.getByTestId("day-clock")).toHaveText("00:00");
  await expect(page.locator('[data-event="midnight"]')).toHaveAttribute("data-reached", "true");
  await expect(page.locator('[data-event="decrypt"]')).not.toHaveAttribute("data-reached");
  await expect(page.locator('[data-event="decrypt"]')).toContainText("Later today, at 11:20");
});

test("stepping through the day reaches Bletchley's decrypt", async ({ page }) => {
  const next = page.getByRole("button", { name: "Next event" });
  for (let i = 0; i < 9; i++) await next.click();
  await expect(page.getByTestId("day-clock")).toHaveText("11:20");
  await expect(page.getByTestId("day-decrypt")).toContainText("WETTERVORHERSAGE FUER DEN KANAL");
});

test("the Bombe scan stops at the right place", async ({ page }) => {
  const next = page.getByRole("button", { name: "Next event" });
  for (let i = 0; i < 9; i++) await next.click();
  const bombe = page.locator('[data-event="bombe"]');
  await expect(bombe.getByTestId("bombe-at")).toBeVisible();
  const drum = bombe.getByLabel("Right drum at");
  await drum.focus();
  await drum.press("Home");
  let found = false;
  for (let i = 0; i < 26 && !found; i++) {
    found = ((await bombe.getByTestId("bombe-at").textContent()) ?? "").includes("This is the stop that reads");
    if (!found) await drum.press("ArrowRight");
  }
  expect(found).toBe(true);
});

test("playing the day moves the clock", async ({ page }) => {
  await page.getByRole("button", { name: "Play the day" }).click();
  await expect(page.getByTestId("day-clock")).not.toHaveText("00:00");
  await page.getByRole("button", { name: "Pause" }).click();
});

test("scrolling down the page runs the clock and opens the events", async ({ page }) => {
  const clockAt = async () => (await page.getByTestId("day-clock").textContent()) ?? "";
  await expect(page.getByTestId("day-clock")).toHaveText("00:00");
  const cribTop = await page.locator('[data-event="crib"]').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y - window.innerHeight * 0.55 + 4), cribTop);
  await expect(page.locator('[data-event="crib"]')).toHaveAttribute("data-reached", "true");
  await expect(page.locator('[data-event="menu"]')).not.toHaveAttribute("data-reached");
  const atCrib = await clockAt();
  expect(atCrib >= "08:30" && atCrib < "09:15").toBe(true);
  await page.mouse.wheel(0, 1500);
  await expect.poll(async () => (await clockAt()) > atCrib).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByTestId("day-clock")).toHaveText("00:00");
});
