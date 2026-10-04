import { test } from "@playwright/test";

// The visual record. Look at these after any visual change.
test("machine", async ({ page }, { project }) => {
  await page.goto("/machine");
  await page.waitForLoadState("networkidle");
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
  await page.getByRole("tab", { name: "Trace" }).click();
  await page.getByRole("button", { name: /Rotor .+, on the way in/ }).first().click();
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

test("breaking pages", async ({ page }, { project }) => {
  await page.goto("/crib");
  await page.screenshot({ path: `e2e/screenshots/${project.name}-crib-story.png`, fullPage: true });
  await page.goto("/codebreaker");
  await page.screenshot({ path: `e2e/screenshots/${project.name}-codebreaker-story.png`, fullPage: true });
});

test("the U-boat war", async ({ page }, { project }) => {
  await page.goto("/atlantic");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `e2e/screenshots/${project.name}-atlantic.png`, fullPage: true });
  const router = page.getByRole("figure").filter({ hasText: "Route the convoy" });
  await router.getByRole("radio", { name: "1942" }).click();
  await router.getByRole("button", { name: "Central route" }).click();
  await router.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-atlantic-convoy.png` });
  const wheel = page.getByLabel("Fourth wheel at");
  await wheel.focus();
  await wheel.press("Home");
  await page.getByRole("figure").filter({ hasText: "The fourth wheel" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-atlantic-wheel.png` });
  const game = page.getByRole("figure").filter({ hasText: "Hunt the U-boat" });
  await game.getByLabel("Beam bearing").fill("190");
  await game.getByRole("button", { name: "Ping" }).click();
  await game.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-atlantic-asdic.png` });
});

test("day", async ({ page }, { project }) => {
  await page.goto("/day");
  await page.waitForLoadState("networkidle");
  for (let i = 0; i < 9; i++) await page.getByRole("button", { name: "Next event" }).click();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-day.png`, fullPage: true });
});

test("certificate", async ({ page }, { project }) => {
  const { QUESTIONS } = await import("../lib/quiz");
  await page.goto("/certificate");
  await page.waitForLoadState("networkidle");
  await page.getByTestId("quiz").getByRole("radio", { name: QUESTIONS[0].options[0], exact: true }).click();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-quiz.png`, fullPage: true });
  await page.getByRole("button", { name: "Next question" }).click();
  for (let i = 1; i < QUESTIONS.length; i++) {
    await page.getByTestId("quiz").getByRole("radio", { name: QUESTIONS[i].options[QUESTIONS[i].answer], exact: true }).click();
    await page.getByRole("button", { name: /Next question|See my score/ }).click();
  }
  await page.getByLabel("Your name").fill("Joan Clarke");
  await page.getByRole("button", { name: "Make my certificate" }).click();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-certificate.png`, fullPage: true });
});

test("in short, in the dark", async ({ page }, { project }) => {
  await page.addInitScript(() => {
    localStorage.setItem("enigma.theme", "dark");
    localStorage.setItem("enigma.read", "short");
  });
  await page.goto("/crib");
  await page.screenshot({ path: `e2e/screenshots/${project.name}-short-dark.png`, fullPage: true });
});

test("break an intercept", async ({ page }, { project }) => {
  test.setTimeout(120_000);
  const { CHALLENGE, menuAt } = await import("../lib/story/challenge");
  const { testLetter } = await import("../lib/story/bombe-run");
  const { QUESTIONS } = await import("../lib/quiz");
  const shot = (name: string) => page.screenshot({ path: `e2e/screenshots/${project.name}-break-${name}.png`, fullPage: true });
  await page.goto("/certificate");
  await page.waitForLoadState("networkidle");
  await page.getByRole("tab", { name: /Break an intercept/ }).click();
  await shot("brief");
  await page.getByRole("button", { name: "Start the clock" }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Move the crib right" }).click();
  await shot("crib");
  for (let i = 3; i < CHALLENGE.cribAt; i++) await page.getByRole("button", { name: "Move the crib right" }).click();
  await page.getByRole("button", { name: "Lock it in" }).click();
  await shot("menu");
  await page.getByRole("button", { name: `Letter ${testLetter(menuAt(CHALLENGE.cribAt))}` }).click();
  await page.getByRole("button", { name: /^Wire the Bombe/ }).click();
  await page.getByRole("button", { name: "Start the Bombes" }).click();
  await page.getByTestId("bombe-stop").waitFor({ timeout: 60_000 });
  await shot("stop");
  await page.getByRole("button", { name: "Take it to the checking machine" }).click();
  await page.getByRole("button", { name: /A hint/ }).click();
  await shot("check");
  for (const pair of ["VB", "RU", "TY"]) {
    await page.getByRole("button", { name: `Plug ${pair[0]}`, exact: true }).click();
    await page.getByRole("button", { name: `Plug ${pair[1]}`, exact: true }).click();
  }
  await page.getByRole("button", { name: "Read the order" }).click();
  await shot("act");
  await page.getByRole("radio", { name: "The convoy in square 83, at 17:00" }).click();
  await shot("result");
  await page.getByRole("button", { name: "See your certificate" }).click();
  for (let i = 0; i < QUESTIONS.length; i++) {
    await page.getByTestId("quiz").getByRole("radio", { name: QUESTIONS[i].options[QUESTIONS[i].answer], exact: true }).click();
    await page.getByRole("button", { name: /Next question|See my score/ }).click();
  }
  await page.getByLabel("Your name").fill("Mavis Batey");
  await page.getByRole("button", { name: "Make my certificate" }).click();
  await shot("certificate");
});

test("glossary", async ({ page }, { project }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "rotors", exact: true }).first().click();
  const open = page.getByTestId("glossary-open");
  for (let i = 0; i < 3; i++) await open.getByRole("button", { name: "Press a key" }).click();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-glossary.png` });
  await page.keyboard.press("Escape");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.getByRole("button", { name: "Open the glossary" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^Plugboard/ }).click();
  await page.getByRole("button", { name: "Socket A" }).click();
  await page.getByRole("button", { name: "Socket E" }).click();
  await page.screenshot({ path: `e2e/screenshots/${project.name}-glossary-dark.png` });
});
