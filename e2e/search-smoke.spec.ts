import { test, expect } from "@playwright/test";

test.describe("Search (smoke)", () => {
  test("French search page loads and shows filters", async ({ page }) => {
    await page.goto("/fr/search?from=Algiers&to=Oran");
    await expect(page.getByRole("heading", { name: /filters/i })).toBeVisible();
  });
});
