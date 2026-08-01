import { expect, test } from "@playwright/test";

test("skip link is reachable and navigates to main content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "THE BIRTH OF STEVE", exact: true })).toBeVisible({ timeout: 20_000 });
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("keyboard navigation reaches every primary nav item", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible({ timeout: 20_000 });
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Projects" }).focus();
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "Docs" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "About" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "Membership" })).toBeFocused();
});
