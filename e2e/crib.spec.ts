import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/crib");
  await page.waitForLoadState("networkidle");
});

test("is reachable from the machine", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Cribs & the Bombe" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cribs & the Bombe" })).toBeVisible();
});

test("the true position of the practice crib survives and gives a menu", async ({ page }) => {
  // The practice message hides WETTERVORHERSAGE after 23 letters
  await page.getByRole("button", { name: "Position 24, possible" }).click();
  await expect(page.getByTestId("verdict")).toHaveText("possible");
  await expect(page.locator("#cribs").getByRole("img", { name: /^Menu of \d+ letters and 16 links/ })).toBeVisible();
});

test("a clash rules a position out and is shown in red", async ({ page }) => {
  const ruledOut = page.getByRole("button", { name: /ruled out$/ }).first();
  await ruledOut.click();
  await expect(page.getByTestId("verdict")).toContainText("would be enciphered as itself");
  await expect(page.locator("[data-clash]").first()).toBeVisible();
  await expect(page.getByText("no point building its menu")).toBeVisible();
});

test("the arrow keys slide the crib", async ({ page }) => {
  const strip = page.getByRole("slider", { name: "Crib position" });
  await strip.focus();
  await page.keyboard.press("End");
  const last = Number(await strip.getAttribute("aria-valuemax"));
  await expect(strip).toHaveAttribute("aria-valuenow", String(last));
  await page.keyboard.press("ArrowLeft");
  await expect(strip).toHaveAttribute("aria-valuenow", String(last - 1));
});

test("next possible skips to a surviving position", async ({ page }) => {
  await page.getByRole("button", { name: "Next possible" }).click();
  await expect(page.getByTestId("verdict")).toHaveText("possible");
});

test("a shorter crib leaves more positions standing", async ({ page }) => {
  const survivors = async () => Number((await page.getByTestId("survivors").textContent())!.split(" of ")[0]);
  const long = await survivors();
  const total = Number((await page.getByTestId("survivors").textContent())!.split(" of ")[1]);
  await page.getByRole("textbox", { name: "Crib" }).fill("WETTER");
  await expect(page.getByTestId("survivors")).not.toHaveText(`${long} of ${total}`);
  expect((await survivors()) / Number((await page.getByTestId("survivors").textContent())!.split(" of ")[1])).toBeGreaterThan(long / total);
});
