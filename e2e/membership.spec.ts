import { expect, test } from "@playwright/test";

test("membership page shows free and Pro tiers", async ({ page }) => {
  await page.goto("/community");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Membership");
  await expect(page.getByText("$0", { exact: true })).toBeVisible();
  await expect(page.getByText("$3/month", { exact: true })).toBeVisible();
  for (const benefit of [
    "Priority Discord support",
    "Dedicated support agent",
    "Early access to upcoming versions and projects",
    "Discord Premium Role",
    "Discord Premium Badge",
  ]) {
    await expect(page.getByText(benefit, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Upgrade to Pro" })).toBeVisible();
  await expect(page.getByText("coming soon", { exact: false })).toHaveCount(0);
  await expect(page.getByText("House rules", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Membership" })).toBeVisible();
});
