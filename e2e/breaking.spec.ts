import { expect, test, type Locator } from "@playwright/test";

async function slideTo(slider: Locator, value: number) {
  await slider.focus();
  await slider.press("Home");
  for (let i = 0; i < value - Number(await slider.getAttribute("min")); i++) await slider.press("ArrowRight");
}

test.describe("cribs and the Bombe", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/crib");
    await page.waitForLoadState("networkidle");
  });

  test("the plugboard can't change Rejewski's fingerprint", async ({ page }) => {
    const fingerprint = page.getByTestId("fingerprint-0");
    await expect(fingerprint).toContainText("same with no cables at all");
    const before = (await fingerprint.textContent())!.match(/Fingerprint ([\d ]+)/)![1];
    await slideTo(page.getByLabel("Cables plugged"), 3);
    await expect(fingerprint).toContainText(`Fingerprint ${before}`);
  });

  test("too few messages leave the fingerprint unfinished", async ({ page }) => {
    await slideTo(page.getByLabel("Messages intercepted"), 5);
    await expect(page.getByTestId("fingerprint-0")).toHaveCount(0);
    await expect(page.getByTestId("pairing-0")).toContainText(/\d+ of 26 letters known/);
  });

  test("Turing's loop holds at the true setting and breaks at a wrong one", async ({ page }) => {
    const verdict = page.getByTestId("loop-verdict");
    // The practice key has the right rotor at Z, and E plugged to A
    await slideTo(page.getByLabel("Right rotor starts at"), 25);
    await slideTo(page.getByLabel("Guess: E is plugged to"), 0);
    await expect(verdict).toContainText("the guess holds");
    await slideTo(page.getByLabel("Right rotor starts at"), 5);
    await expect(verdict).toContainText("a contradiction");
  });
});

test.describe("codebreaker explanations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/codebreaker");
    await page.waitForLoadState("networkidle");
  });

  test("the index of coincidence rises as more of the text is right", async ({ page }) => {
    const value = async () => Number(await page.getByTestId("ioc-value").textContent());
    const slider = page.getByLabel("Letters that are right");
    await slideTo(slider, 0);
    const random = await value();
    await slider.press("End");
    await expect.poll(value).toBeGreaterThan(random + 0.02);
  });

  test("stepping through the climb ends in the plaintext", async ({ page }) => {
    const slider = page.getByLabel("Step");
    await slider.focus();
    await slider.press("End");
    await expect(page.getByTestId("climb-text")).toContainText("AN DAS OBERKOMMANDO DER WEHRMACHT");
    await expect(page.getByRole("list", { name: "Cables so far" }).getByRole("listitem")).toHaveCount(6);
  });
});
