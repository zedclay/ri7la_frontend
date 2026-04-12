import { test, expect } from "@playwright/test";

test.describe("Public shell (smoke)", () => {
  test("French home loads with metadata title", async ({ page }) => {
    await page.goto("/fr");
    await expect(page).toHaveTitle(/Ri7la/i);
  });
});
