import { test } from "@playwright/test";

// The visual record. Look at these after any visual change.
test("machine", async ({ page }, { project }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Plug A" }).click();
  await page.getByRole("button", { name: "Plug M" }).click();
  await page.getByRole("button", { name: "Plug Q" }).click();
  await page.getByRole("button", { name: "Plug L" }).click();
  await page.getByLabel("Type or paste a message").fill("Hello Bletchley");
  await page.getByRole("button", { name: "Type it" }).click();
  const key = page.getByRole("button", { name: "E", exact: true });
  await key.hover();
  await page.mouse.down();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-machine.png`, fullPage: true });
  await page.mouse.up();
});
