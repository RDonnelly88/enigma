import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/machine");
  // The bench renders in the browser; wait for it before pressing keys
  await page.waitForLoadState("networkidle");
});

const tab = (page: import("@playwright/test").Page, name: string) => page.getByRole("tab", { name: new RegExp(`^${name}`) }).click();

test("typing AAAAA at the start gives the standard check value", async ({ page }, { project }) => {
  test.skip(project.name === "mobile", "Hardware keyboard");
  for (let i = 0; i < 5; i++) await page.keyboard.press("a");
  await expect(page.getByTestId("tape-output")).toHaveText("BDZGO");
});

test("a held key lights its lamp until it is released", async ({ page }) => {
  const key = page.getByRole("button", { name: "A", exact: true });
  await key.hover();
  await page.mouse.down();
  await expect(page.locator('[data-lamp="B"]')).toHaveAttribute("data-lit", "true");
  await page.mouse.up();
  await expect(page.locator("[data-lit]")).toHaveCount(0);
  await expect(page.getByLabel("III at B")).toBeVisible();
});

test("Shift and the arrow keys don't type anything", async ({ page }, { project }) => {
  test.skip(project.name === "mobile", "Hardware keyboard");
  for (const key of ["Shift", "ArrowDown", "Control", "Tab", "1"]) await page.keyboard.press(key);
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await page.keyboard.press("a");
  await expect(page.getByTestId("tape-input")).toHaveText("A");
});

test("rewinding and retyping the ciphertext gives back the message", async ({ page }) => {
  await page.getByLabel("Type or paste a message").fill("Attack at dawn");
  await page.getByRole("button", { name: "Type it" }).click();
  const ciphertext = (await page.getByTestId("tape-output").textContent())!.replace(/\s/g, "");
  expect(ciphertext).toHaveLength(14);
  await page.getByRole("button", { name: "Rewind" }).click();
  await page.getByLabel("Type or paste a message").fill(ciphertext);
  await page.getByRole("button", { name: "Type it" }).click();
  await expect(page.getByTestId("tape-output")).toHaveText("ATTAC KXATX DAWN");
});

test("the plugboard changes the cipher and can be unplugged", async ({ page }) => {
  await page.getByRole("button", { name: "Plug A" }).click();
  await page.getByRole("button", { name: "Plug Q" }).click();
  await expect(page.getByRole("button", { name: "A, plugged to Q. Unplug" })).toBeVisible();
  await page.getByLabel("Type or paste a message").fill("AAAAA");
  await page.getByRole("button", { name: "Type it" }).click();
  await expect(page.getByTestId("tape-output")).not.toHaveText("BDZGO");
  await page.getByRole("button", { name: "Rewind" }).click();
  await page.getByRole("button", { name: "A, plugged to Q. Unplug" }).click();
  await page.getByLabel("Type or paste a message").fill("AAAAA");
  await page.getByRole("button", { name: "Type it" }).click();
  await expect(page.getByTestId("tape-output")).toHaveText("BDZGO");
});

test("decrypts the U-534 intercept", async ({ page }) => {
  await tab(page, "Messages");
  const card = page.getByRole("article").filter({ hasText: "U-534" });
  await card.getByRole("button", { name: "Set the machine" }).click();
  await card.getByRole("button", { name: "Type the message" }).click();
  await expect(page.getByTestId("tape-output")).toContainText("VONVO NJLOO KSJHF FTTTE INSEI NSDRE I");
});

test("explains a key press step by step", async ({ page }) => {
  await page.getByLabel("Type or paste a message").fill("A");
  await page.getByRole("button", { name: "Type it" }).click();
  await tab(page, "Trace");
  const steps = page.getByRole("list", { name: "Step by step" });
  await expect(steps.getByRole("button", { name: /^1 You press A/ })).toBeVisible();
  const rotor = steps.getByRole("button", { name: /Rotor III, on the way in/ });
  await expect(rotor).toContainText("wires B to D");
  await rotor.click();
  await expect(rotor).toHaveAttribute("aria-pressed", "true");
  await expect(steps.getByRole("button", { name: /Lamp B lights/ })).toBeVisible();
});

test("the lid explains the parts", async ({ page }) => {
  await tab(page, "Settings");
  await expect(page.getByText("Notch V")).toBeVisible();
  // With no cables plugged a fast computer could try every key; the army's ten cables changed that
  await page.getByText("How many keys?").click();
  await expect(page.getByText(/would take under a year/)).toBeVisible();
  await page.getByText("Notches and stepping").click();
  await expect(page.getByText(/double step/).first()).toBeVisible();
});

test("the wiring and its explanation never widen the page", async ({ page }) => {
  await page.getByLabel("Type or paste a message").fill("HELLO");
  await page.getByRole("button", { name: "Type it" }).click();
  await tab(page, "Trace");
  await page.getByRole("button", { name: /Rotor III, on the way in/ }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
