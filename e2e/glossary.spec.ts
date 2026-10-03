import { expect, test } from "@playwright/test";

test("an underlined word opens the glossary at it, and the visual can be played with", async ({ page }) => {
  await page.goto("/crib");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "crib", exact: true }).first().click();
  const drawer = page.getByRole("dialog", { name: "Glossary" });
  await expect(drawer).toBeVisible();
  const open = drawer.getByTestId("glossary-open");
  await expect(open).toContainText("Because no letter can become itself");
  await open.getByRole("button", { name: "Slide the crib right" }).click();
  await expect(open).toContainText("A letter lands on itself");
  await open.getByRole("button", { name: "Bombe", exact: true }).click();
  await expect(drawer.getByTestId("glossary-open")).toContainText("Alan Turing");
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
});

test("the header book opens the glossary, and search narrows it", async ({ page }) => {
  await page.goto("/machine");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Open the glossary" }).click();
  const drawer = page.getByRole("dialog", { name: "Glossary" });
  await drawer.getByLabel("Search the glossary").fill("decipher");
  await drawer.getByRole("button", { name: /^Deciphering/ }).click();
  await expect(drawer.getByTestId("glossary-open")).toContainText("same as enciphering");
  await drawer.getByRole("link", { name: "Receiving a message" }).click();
  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(/\/#used$/);
});
