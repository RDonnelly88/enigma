import { expect, test } from "@playwright/test";

const PAGES = ["/", "/day", "/machine", "/machine?lesson=plug", "/machine?cipher=ABCDE", "/crib", "/codebreaker", "/codebreaker?cipher=ABCDE"];

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
