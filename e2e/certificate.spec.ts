import { expect, test } from "@playwright/test";
import { QUESTIONS } from "../lib/quiz";

async function answer(page: import("@playwright/test").Page, pick: (i: number) => number) {
  for (let i = 0; i < QUESTIONS.length; i++) {
    await page.getByTestId("quiz").getByRole("radio", { name: QUESTIONS[i].options[pick(i)], exact: true }).click();
    await page.getByRole("button", { name: /Next question|See my score/ }).click();
  }
}

test("a full marks run earns a certificate with the name on, which stays after a reload", async ({ page }) => {
  await page.goto("/certificate");
  await page.waitForLoadState("networkidle");
  await answer(page, (i) => QUESTIONS[i].answer);
  await expect(page.getByTestId("quiz-result")).toContainText(`${QUESTIONS.length}/${QUESTIONS.length}`);
  await page.getByLabel("Your name").fill("Ada Lovelace");
  await page.getByRole("button", { name: "Make my certificate" }).click();
  await expect(page.getByTestId("certificate-name")).toHaveText("Ada Lovelace");
  await expect(page.getByTestId("certificate")).toContainText("Head of Hut");
  await page.reload();
  await expect(page.getByTestId("certificate-name")).toHaveText("Ada Lovelace");
});

test("the enciphered name reads back on the machine", async ({ page }) => {
  await page.goto("/certificate");
  await page.waitForLoadState("networkidle");
  await answer(page, (i) => QUESTIONS[i].answer);
  await page.getByLabel("Your name").fill("Alan");
  await page.getByRole("button", { name: "Make my certificate" }).click();
  await page.getByRole("link", { name: "Decipher it on the machine" }).click();
  await expect(page.getByTestId("tape-output")).toHaveText(/^ALAN$/);
});

test("too many wrong answers means no certificate, and a pointer to what to read", async ({ page }) => {
  await page.goto("/certificate");
  await page.waitForLoadState("networkidle");
  await answer(page, (i) => (QUESTIONS[i].answer + 1) % QUESTIONS[i].options.length);
  await expect(page.getByTestId("quiz-result")).toContainText(`0/${QUESTIONS.length}`);
  await expect(page.getByRole("button", { name: "Make my certificate" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: QUESTIONS[0].learnMore.label }).first()).toBeVisible();
});
