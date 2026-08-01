import { expect, test } from "@playwright/test";

test("homepage renders hero, stats, featured project, and footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("THE BIRTH OF");
  await expect(page.getByText("Featured Projects", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /The Birth of Steve/ }).first()).toBeVisible();
  await expect(page.getByText("Downloads", { exact: true })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("NightBeam Studio");
});

test("cookie consent banner can be accepted", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("region", { name: "Cookie consent" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Essential only" }).click();
  await expect(banner).toBeHidden();
});

test("project card links to the project page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /The Birth of Steve/ }).first().click();
  await expect(page).toHaveURL(/\/projects\/the-birth-of-steve/, { timeout: 20_000 });
});
