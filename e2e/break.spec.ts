import { expect, test } from "@playwright/test";
import { testLetter } from "../lib/story/bombe-run";
import { CHALLENGE, cribPlacements, menuAt } from "../lib/story/challenge";

const free = cribPlacements().filter((p) => p.clashes.length === 0).map((p) => p.offset);
const decoy = free.find((f) => f !== CHALLENGE.cribAt)!;

async function placeCrib(page: import("@playwright/test").Page, at: number) {
  const now = Number((await page.getByTestId("crib-offset").textContent())!.match(/\d+/)![0]) - 1;
  const button = page.getByRole("button", { name: at > now ? "Move the crib right" : "Move the crib left" });
  for (let i = 0; i < Math.abs(at - now); i++) await button.click();
  await page.getByRole("button", { name: "Lock it in" }).click();
}

async function runToMenu(page: import("@playwright/test").Page, at: number) {
  await placeCrib(page, at);
  await page.getByRole("button", { name: `Letter ${testLetter(menuAt(at))}` }).click();
  await page.getByRole("button", { name: "Start the Bombes" }).click();
}

test("breaking the intercept: a decoy crib position, the stop, the last cables, the order", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/certificate");
  await page.waitForLoadState("networkidle");
  await page.getByRole("tab", { name: /Break an intercept/ }).click();
  await page.getByRole("button", { name: "Start the clock" }).click();

  // A clash is refused
  const clashing = cribPlacements().findIndex((p) => p.clashes.length > 0);
  await placeCrib(page, clashing);
  await expect(page.getByTestId("break-say")).toContainText("Clash");

  // A place that doesn't clash but is wrong: the Bombes find nothing
  await runToMenu(page, decoy);
  await expect(page.getByText("Not one stop on any wheel order")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Back to the crib" }).click();

  // The right place stops on the key
  await runToMenu(page, CHALLENGE.cribAt);
  await expect(page.getByTestId("bombe-stop")).toContainText(CHALLENGE.key.rotors.join(" "), { timeout: 60_000 });
  await page.getByRole("button", { name: "Take it to the checking machine" }).click();

  // A hint, then the three cables the menu couldn't reach
  await page.getByRole("button", { name: /A hint/ }).click();
  await expect(page.getByTestId("break-say")).toContainText("should say");
  for (const pair of ["VB", "RU", "TY"]) {
    await page.getByRole("button", { name: `Plug ${pair[0]}`, exact: true }).click();
    await page.getByRole("button", { name: `Plug ${pair[1]}`, exact: true }).click();
  }
  await expect(page.getByTestId("check-text")).toContainText("ANGRIFF AUF GELEITZUG");
  await page.getByRole("button", { name: "Read the order" }).click();
  await page.getByRole("radio", { name: "The convoy in square 83, at 17:00" }).click();
  await expect(page.getByTestId("break-result")).toContainText(/1\s*hint/);
  await expect(page.getByTestId("break-result")).toContainText("mistake");

  // The certificate carries it once the quiz is passed
  await page.reload();
  await expect(page.getByRole("tab", { name: /Broken in/ })).toBeVisible();
});
