import { test, expect } from "@playwright/test";

test("onboarding: complete 4-step flow", async ({ page, request }) => {
  // 이미 온보딩 완료된 경우 skip
  const ctxRes = await request.get("/api/user-context");
  const ctxData = await ctxRes.json();
  if (ctxData) {
    test.skip();
    return;
  }

  await page.goto("/onboarding");

  // Step 1: USER_TYPE
  await page.getByTestId("option-creator").click();
  await page.getByRole("button", { name: /EXECUTE/ }).click();

  // Step 2: AUDIENCE_SIZE
  await page.getByTestId("option-0-1K").click();
  await page.getByRole("button", { name: /EXECUTE/ }).click();

  // Step 3: CURRENT_STAGE
  await page.getByTestId("option-first-customers").click();
  await page.getByRole("button", { name: /EXECUTE/ }).click();

  // Step 4: YOUR_NICHE
  await page.getByTestId("niche-input").fill("디지털 콘텐츠 창작자");
  await page.getByRole("button", { name: /EXECUTE/ }).click();

  await expect(page).toHaveURL("/");
});
