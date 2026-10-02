import { test } from "@playwright/test";

// The visual record. Look at these after any visual change.
test("machine", async ({ page }, { project }) => {
  await page.goto("/machine");
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
  await page.getByRole("button", { name: /Rotor .+, on the way in/ }).first().click();
  await page.getByText("Notches and stepping").click();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-explained.png`, fullPage: true });
});

test("crib", async ({ page }, { project }) => {
  await page.goto("/crib");
  await page.getByRole("button", { name: "Position 24, possible" }).click();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-crib.png`, fullPage: true });
  await page.getByRole("button", { name: /ruled out$/ }).first().click();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-crib-clash.png` });
});

test("codebreaker", async ({ page }, { project }) => {
  test.setTimeout(240_000);
  await page.goto("/codebreaker");
  await page.getByRole("button", { name: /English/ }).click();
  await page.getByRole("button", { name: "Break it" }).click();
  await page.getByTestId("verdict").waitFor({ timeout: 200_000 });
  await page.screenshot({ path: `e2e/screenshots/${project.name}-codebreaker.png`, fullPage: true });
});

test("story", async ({ page }, { project }) => {
  await page.goto("/");
  await page.screenshot({ path: `e2e/screenshots/${project.name}-story.png`, fullPage: true });
});
