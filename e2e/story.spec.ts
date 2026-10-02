import { expect, test, type Locator } from "@playwright/test";

/** Moves a slider with the keyboard, the way a keyboard user would. */
async function slideTo(slider: Locator, value: number) {
  await slider.focus();
  await slider.press("Home");
  for (let i = 0; i < value - Number(await slider.getAttribute("min")); i++) await slider.press("ArrowRight");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("opens with the hero and every chapter", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "ENIGMA" })).toBeVisible();
  for (const name of ["A typewriter that lied", "Built up, one part at a time", "Midnight, a key sheet, and two operators", "Numbers too big to search", "Cracks in the system"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
  }
});

test("a simple swap keeps the letter counts; Enigma flattens them", async ({ page }) => {
  const plain = page.getByRole("group", { name: "Letter counts in the plaintext" }).getByRole("button").first();
  const cipher = page.getByRole("group", { name: "Letter counts in the ciphertext" }).getByRole("button").first();
  const count = async (button: typeof plain) => Number((await button.getAttribute("aria-label"))!.split(": ")[1]);
  expect(await count(cipher)).toBe(await count(plain));
  await page.getByRole("radio", { name: "Enigma" }).click();
  await expect.poll(() => count(cipher)).toBeLessThan(await count(plain));
});

test("one rotor sends A to E, and pressing A gives a new letter each time", async ({ page }) => {
  await expect(page.getByText("With the rotor at A, A goes in and E comes out.")).toBeVisible();
  const press = page.getByRole("button", { name: "Press A" });
  for (let i = 0; i < 3; i++) await press.click();
  await expect(page.getByTestId("rotor-typed")).toHaveText(/^[A-Z] [A-Z] [A-Z]$/);
  await expect(page.getByLabel("Rotor turned to")).toHaveValue("3");
});

test("the stepping slider shows the double step", async ({ page }) => {
  const slider = page.getByLabel("Key presses");
  await slideTo(slider, 101);
  await expect(page.getByTestId("stepping-now")).toContainText("Double step");
  await slideTo(slider, 22);
  await expect(page.getByTestId("stepping-now")).toContainText("carried the middle rotor");
});

test("the reflector pairs letters both ways", async ({ page }) => {
  const demo = page.getByRole("figure").filter({ hasText: "The reflector" });
  await demo.getByRole("button", { name: "A", exact: true }).click();
  await expect(page.getByTestId("reflector-pair")).toHaveText("A ⟷ Y");
  await demo.getByRole("button", { name: "Y", exact: true }).click();
  await expect(page.getByTestId("reflector-pair")).toHaveText("Y ⟷ A");
});

test("the plugboard peaks at eleven cables", async ({ page }) => {
  await expect(page.getByTestId("plug-ways")).toHaveText("150,738,274,937,250");
  await page.getByRole("group", { name: /Plugboard arrangements/ }).getByRole("button", { name: /^11:/ }).click();
  await expect(page.getByTestId("plug-ways")).toHaveText("205,552,193,096,250");
});

test("a day on the key sheet sets up the procedure and opens on the machine", async ({ page }) => {
  await page.getByRole("button", { name: "Day 3", exact: true }).click();
  await expect(page.getByText("day 3 from the sheet")).toBeVisible();
  await expect(page.getByTestId("indicator")).toHaveText(/^[A-Z]{6}$/);
  await page.getByRole("link", { name: "Set the machine to day 3" }).click();
  await expect(page).toHaveURL("/machine");
  await expect(page.getByRole("heading", { name: "The machine" })).toBeAttached();
});

test("the key-space calculator multiplies its parts", async ({ page }) => {
  await expect(page.getByTestId("keyspace-total")).toHaveText("158,962,555,217,826,360,000");
  await expect(page.getByTestId("keyspace-time")).toHaveText("about 5 million years");
  await slideTo(page.getByLabel("Plugboard cables"), 0);
  await expect(page.getByTestId("keyspace-total")).toHaveText("1,054,560");
  await expect(page.getByTestId("keyspace-time")).toHaveText("1 second");
});
