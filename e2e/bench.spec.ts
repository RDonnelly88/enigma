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
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await typeAll(page, "SOS");
  await tab(page, "Messages");
  await page.getByRole("button", { name: "Transmit" }).click();
  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
  await expect(page.getByTestId("morse-ticker")).toBeVisible();
  await tab(page, "Lessons");
  await page.locator('[data-lesson="transmit"]').getByRole("button").first().click();
  await expect(page.locator('[data-lesson="transmit"]').getByTestId("lesson-learnt")).toBeVisible();
});

test("a secret travels by link and key card, and reads back at the other end", async ({ page, context }) => {
  await open(page);
  await tab(page, "Messages");
  await page.getByRole("button", { name: "Pick a secret key" }).click();
  await typeAll(page, "MEET AT DAWN");
  const sent = (await page.getByTestId("tape-output").textContent())!.replace(/\s/g, "");
  await page.getByLabel("From", { exact: true }).fill("Ada");
  await page.getByLabel("To", { exact: true }).fill("Alan");
  await expect(page.getByTestId("key-card")).toContainText("For Alan · from Ada");
  const link = await page.getByLabel("Link to send").inputValue();
  const key = (await page.getByTestId("key-code").textContent())!;
  expect(link).toContain(`cipher=${sent}`);
  expect(link).not.toContain("key=");
  const [reflector, rotors, rings, start, cables] = key.split(" · ");

  const friend = await context.newPage();
  await friend.goto(link);
  await friend.waitForLoadState("networkidle");
  await expect(friend.getByRole("heading", { name: "A secret message for Alan" })).toBeVisible();
  await expect(friend.getByText("From Ada")).toBeVisible();
  // Copied off the card a line at a time, the way the operator at the other end did
  const card = friend.getByRole("form", { name: "Key card" });
  await card.getByLabel("Reflector").selectOption(reflector);
  for (const [i, slot] of ["left", "middle", "right"].entries()) await card.getByLabel(`Rotor ${slot}`).selectOption(rotors.split(" ")[i]);
  await card.getByLabel("Rings").fill(rings);
  await card.getByLabel("Start").fill(start);
  await card.getByLabel("Cables").fill("AB AC");
  await card.getByRole("button", { name: "Set the machine and read it" }).click();
  await expect(friend.getByText("That isn’t a key the machine can use")).toBeVisible();
  await card.getByLabel("Cables").fill(cables);
  await card.getByRole("button", { name: "Set the machine and read it" }).click();
  // Spaces go in as X, as an operator would have typed them
  await expect(friend.getByTestId("tape-output")).toHaveText("MEETX ATXDA WN");
  await expect(friend.getByTestId("received")).toContainText("from Ada");
  await expect(friend.getByTestId("received-text")).toHaveText("MEET AT DAWN");
  await friend.getByRole("button", { name: "Reply with the same key" }).click();
  await expect(friend.getByTestId("received")).toHaveCount(0);
  await expect(friend.getByTestId("tape-output")).toHaveText("");
});

test("a key put in the link sets the machine itself, and says what that gives away", async ({ page, context }) => {
  await open(page);
  await typeAll(page, "HELLO");
  await tab(page, "Messages");
  const plain = await page.getByLabel("Link to send").inputValue();
  await page.getByLabel(/Put the key in the link too/).check();
  await expect(page.getByText("anyone who gets hold of the link can read the message")).toBeVisible();
  const link = await page.getByLabel("Link to send").inputValue();
  expect(plain).not.toContain("k=");
  expect(link).toContain("k=");

  const friend = await context.newPage();
  await friend.goto(link);
  await friend.waitForLoadState("networkidle");
  await expect(friend.getByRole("form", { name: "Key card" })).toHaveCount(0);
  await friend.getByRole("button", { name: "Set the machine and read it" }).click();
  await expect(friend.getByTestId("received-text")).toHaveText("HELLO");
});

test("a key code sent as one line works on the key card too", async ({ page }) => {
  await open(page, "/machine?cipher=QWERTY");
  await page.getByText("Sent the key as one line instead?").click();
  await page.getByLabel("Key code").fill("B · I II III · AAA · AAA · no cables");
  await page.getByRole("button", { name: "Set the machine and read it" }).click();
  await expect(page.getByTestId("received")).toBeVisible();
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

test("the machine resets to the default settings, and the lessons can start over", async ({ page }) => {
  await page.goto("/machine");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Plug A" }).click();
  await page.getByRole("button", { name: "Plug M" }).click();
  await page.getByLabel("Type or paste a message").fill("Hello");
  await page.getByRole("button", { name: "Type it" }).click();
  await expect(page.getByTestId("tape-input")).not.toHaveText(/Press a key/);
  await page.getByRole("button", { name: "Reset the machine" }).click();
  await expect(page.getByTestId("tape-input")).toHaveText(/Press a key/);
  await expect(page.getByTestId("lesson-progress")).not.toHaveText(/^0 of/);
  await page.getByRole("button", { name: "Start the lessons again" }).click();
  await expect(page.getByTestId("lesson-progress")).toHaveText(/^0 of/);
  await page.reload();
  await expect(page.getByTestId("lesson-progress")).toHaveText(/^0 of/);
});

test("a whole message types itself in key by key, and can be finished at once", async ({ page }) => {
  // The rest of the run forces reduced motion, which types it all in one go
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page);
  await typeAll(page, "THE WEATHER TODAY IS FINE");
  await expect(page.getByText(/Typing it in… \d+ letters to go/)).toBeVisible();
  await expect.poll(async () => ((await page.getByTestId("tape-input").textContent()) ?? "").replace(/\s/g, "").length).toBeGreaterThan(1);
  expect(((await page.getByTestId("tape-input").textContent()) ?? "").replace(/\s/g, "").length).toBeLessThan(21);
  await page.getByRole("button", { name: "Finish now" }).click();
  await expect(page.getByTestId("tape-input")).toHaveText("THEXW EATHE RXTOD AYXIS XFINE");
  await expect(page.getByLabel("Type or paste a message")).toBeVisible();
});
