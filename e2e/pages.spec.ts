import { expect, test } from "@playwright/test";

const PAGES = ["/", "/certificate", "/day", "/machine", "/machine?lesson=plug", "/machine?cipher=ABCDE", "/crib", "/codebreaker", "/codebreaker?cipher=ABCDE"];

for (const path of PAGES) {
  test(`${path} renders the same on the server and in the browser`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && /hydrat/i.test(m.text())) problems.push(m.text().slice(0, 300));
    });
    page.on("pageerror", (e) => problems.push(e.message.slice(0, 300)));
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });

  test(`${path} never scrolls sideways`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}

// The projects' phone is a Pixel 7; smaller phones are common and once overflowed where it didn't
test("the story never scrolls sideways on a small phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});

test("the chapter rail stays clear of the text on a laptop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const rail = await page.getByRole("navigation", { name: "Chapters" }).boundingBox();
  const text = await page.locator("main h1").first().boundingBox();
  expect(rail!.x + rail!.width).toBeLessThanOrEqual(text!.x);
});

test("each page leads on to the next, and the last back to the machine", async ({ page }) => {
  await page.goto("/machine");
  for (const next of ["A day in 1941", "Cribs & the Bombe", "Codebreaker", "Certificate"]) {
    await page.getByRole("contentinfo").getByRole("link").click();
    await expect(page.getByRole("link", { name: next, exact: true }).first()).toHaveAttribute("aria-current", "page");
  }
  await page.getByRole("contentinfo").getByRole("link", { name: /Send a secret/ }).click();
  await expect(page.locator('[data-lesson="share"] > button')).toHaveAttribute("aria-expanded", "true");
});
