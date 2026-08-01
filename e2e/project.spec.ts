import { expect, test } from "@playwright/test";

test("project page shows tabs and version data", async ({ page }) => {
  await page.goto("/projects/the-birth-of-steve");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("THE BIRTH OF STEVE");
  await expect(page.getByRole("tab", { name: "Downloads" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("the-birth-of-steve-0.4.0-neoforge.jar")).toBeVisible();
  await page.getByRole("tab", { name: "Versions" }).click();
  await expect(page.getByRole("cell", { name: /0\.4\.0/ })).toBeVisible();
  await page.getByRole("tab", { name: "Gallery" }).click();
  await expect(page.getByRole("tab", { name: "Gallery" })).toHaveAttribute("aria-selected", "true");
});

test("download button degrades gracefully without CurseForge", async ({ page }) => {
  await page.goto("/projects/the-birth-of-steve");
  await page.getByRole("button", { name: /Download/ }).first().click();
  await expect(page.getByText(/CurseForge sync is configured/)).toBeVisible();
});

test("favorite requires sign-in", async ({ page }) => {
  await page.goto("/projects/the-birth-of-steve");
  await page.getByRole("button", { name: "Favorite" }).click();
  await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=/);
});
