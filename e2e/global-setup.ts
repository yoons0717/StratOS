import { chromium } from "@playwright/test";
import { mkdirSync } from "fs";
import { config } from "dotenv";

config({ path: ".env.local" });

export default async function globalSetup() {
  mkdirSync("e2e/.auth", { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://localhost:3000/e2e-login");

  // "done" testid는 sign-in 성공 후에만 렌더됨
  await page.getByTestId("e2e-auth-done").waitFor({ timeout: 15_000 });

  await context.storageState({ path: "e2e/.auth/user.json" });
  await browser.close();
}
