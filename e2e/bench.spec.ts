import { expect, test } from "@playwright/test";

const open = async (page: import("@playwright/test").Page, path = "/machine") => {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
};
const tab = (page: import("@playwright/test").Page, name: string) => page.getByRole("tab", { name: new RegExp(`^${name}`) }).click();
const typeAll = async (page: import("@playwright/test").Page, text: string) => {
  await page.getByLabel("Type or paste a message").fill(text);
  await page.getByRole("button", { name: "Type it" }).click();
};

test("a lesson completes as you do it, and stays done after a reload", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("lesson-progress")).toHaveText(/^0 of/);
  await typeAll(page, "Q");
  await expect(page.getByTestId("lesson-learnt")).toContainText("Q lit");
  await expect(page.getByTestId("lesson-progress")).toHaveText(/^1 of/);
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("lesson-progress")).toHaveText(/^1 of/);
});

test("a link from the story opens its lesson, and sets the machine up", async ({ page }) => {
  await open(page, "/machine?lesson=double-step");
  const lesson = page.locator('[data-lesson="double-step"]');
  await expect(lesson.getByText("With the rotors set to A D U")).toBeVisible();
  await lesson.getByRole("button", { name: "Set it up for me" }).click();
  await expect(page.getByLabel("II at D")).toBeVisible();
  await typeAll(page, "AAA");
  await expect(lesson.getByTestId("lesson-learnt")).toContainText("two key presses running");
});

test("the story links into the machine's lessons", async ({ page }) => {
  await open(page, "/");
  await page.getByRole("link", { name: "Catch the double step on the machine" }).click();
  await expect(page).toHaveURL(/lesson=double-step/);
  await expect(page.locator('[data-lesson="double-step"]').getByText("With the rotors set to A D U")).toBeVisible();
});

test("a message can be transmitted in Morse", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Mute" }).click();
  await typeAll(page, "SOS");
  await tab(page, "Messages");
  await page.getByRole("button", { name: "Transmit" }).click();
  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
  await expect(page.getByTestId("morse-ticker")).toBeVisible();
  await tab(page, "Lessons");
  await page.locator('[data-lesson="transmit"]').getByRole("button").first().click();
  await expect(page.locator('[data-lesson="transmit"]').getByTestId("lesson-learnt")).toBeVisible();
});

test("a secret travels by link and key, and reads back at the other end", async ({ page, context }) => {
  await open(page);
  await typeAll(page, "MEET AT DAWN");
  const sent = (await page.getByTestId("tape-output").textContent())!.replace(/\s/g, "");
  await tab(page, "Messages");
  const link = await page.getByLabel("1. Link to the ciphertext").inputValue();
  const key = await page.getByLabel("2. The key, to send another way").inputValue();
  expect(link).toContain(`cipher=${sent}`);
  expect(link).not.toContain("key=");

  const friend = await context.newPage();
  await friend.goto(link);
  await friend.waitForLoadState("networkidle");
  await expect(friend.getByRole("heading", { name: "A secret message has arrived" })).toBeVisible();
  await friend.getByLabel("Key code").fill("not a key");
  await friend.getByRole("button", { name: "Set the machine and read it" }).click();
  await expect(friend.getByText("That isn’t a key the machine can use")).toBeVisible();
  await friend.getByLabel("Key code").fill(key);
  await friend.getByRole("button", { name: "Set the machine and read it" }).click();
  // The tape drops spaces, as an operator would have
  await expect(friend.getByTestId("tape-output")).toHaveText("MEETA TDAWN");
});

test("a secret without its key can be taken to the codebreaker", async ({ page }) => {
  await open(page, "/machine?cipher=QWERTYUIOPASDFGHJKLZXCVBNM");
  await page.getByRole("link", { name: "Try to break it" }).click();
  await expect(page).toHaveURL(/codebreaker\?cipher=/);
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("textbox", { name: /Ciphertext/ })).toHaveValue("QWERTYUIOPASDFGHJKLZXCVBNM");
});

test("on a phone, the lesson to do sits above the machine", async ({ page }, { project }) => {
  test.skip(project.name !== "mobile", "the lessons sit beside the machine on a wide screen");
  await page.goto("/machine");
  const strip = page.getByTestId("lesson-strip");
  await expect(strip).toContainText("Press a key");
  await page.getByRole("button", { name: "Q", exact: true }).click();
  await expect(strip).toContainText("Done");
  await strip.click();
  await expect(page.getByTestId("lesson-learnt")).toBeInViewport();
});
