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

  test("the Bombe walkthrough goes from crib to a read message", async ({ page }) => {
    test.setTimeout(90_000);
    const walk = page.getByTestId("bombe-step");
    const next = page.getByRole("button", { name: "Next", exact: true });
    await expect(walk).toContainText("The Bombe did not decode messages");
    await next.click();
    await expect(walk).toContainText("Five of those columns");
    await next.click();
    await next.click();

    // A guess round the loop: the true plug survives at the right setting, and fails at a wrong one
    await slideTo(page.getByLabel("Guess: E is plugged to"), 0);
    for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "Follow the next link" }).click();
    await expect(page.getByTestId("loop-result")).toContainText("They agree");
    await page.getByRole("radio", { name: "A wrong setting" }).click();
    for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "Follow the next link" }).click();
    await expect(page.getByTestId("loop-result")).toContainText("contradiction");

    // The machine: run it, test stops until one reads
    await next.click();
    const status = page.getByTestId("bombe-status");
    await page.getByRole("button", { name: "Run the Bombe" }).click();
    let read = false;
    for (let i = 0; i < 26 && !read; i++) {
      await expect(status).toContainText("Stop at", { timeout: 15_000 });
      await page.getByRole("button", { name: "Test this stop" }).click();
      const result = (await page.getByTestId("stop-test").textContent()) ?? "";
      read = result.includes("This is the setting");
      if (!read) {
        expect(result).toContain("A false stop");
        await page.getByRole("button", { name: "Carry on" }).click();
      }
    }
    expect(read).toBe(true);

    // The checking machine finishes the plugboard and the message reads
    await next.click();
    await page.getByLabel("Plugboard pairs found").focus();
    await page.getByLabel("Plugboard pairs found").press("End");
    await expect(page.getByTestId("message-read")).toContainText("WETTERVORHERSAGE BISKAYA");
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

test("being the Bombe: guesses die at a wrong position, one survives at the right one, and the wires agree", async ({ page }) => {
  await page.goto("/crib");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Guess E is plugged to C" }).click();
  await expect(page.getByTestId("bombe-trace")).toContainText("this guess is wrong");
  await page.getByRole("button", { name: "Try every guess" }).click();
  await expect(page.getByTestId("bombe-verdict")).toContainText("Every guess contradicts itself");
  await page.getByRole("button", { name: /Switch on/ }).click();
  await expect(page.getByTestId("wires-verdict")).toContainText("All 26 lit");

  await page.getByRole("radio", { name: "A A C" }).click();
  await page.getByRole("button", { name: "Try every guess" }).click();
  await expect(page.getByTestId("bombe-verdict")).toContainText("E = A");
  await page.getByRole("button", { name: /Switch on/ }).click();
  await expect(page.getByTestId("wires-verdict")).toContainText("of 26 lit");
  await page.getByRole("button", { name: "Feed wire A" }).click();
  await expect(page.getByTestId("wires-verdict")).toContainText("Only A lights");
});
