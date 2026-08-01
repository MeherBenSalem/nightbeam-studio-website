import { expect, test } from "@playwright/test";

test("directory lists the seeded project", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Projects/i);
  await expect(page.getByRole("link", { name: /The Birth of Steve/ }).first()).toBeVisible();
});

test("loader and version chips update the URL and stay shareable", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: "Fabric", exact: true }).click();
  await expect(page).toHaveURL(/loaders=FABRIC/);
  await page.getByRole("button", { name: "26.2", exact: true }).click();
  await expect(page).toHaveURL(/versions=26\.2/);
  await expect(page.getByRole("link", { name: /The Birth of Steve/ }).first()).toBeVisible();
});

test("search input filters the list", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("textbox", { name: "Search projects" }).fill("birth");
  await expect(page).toHaveURL(/search=birth/);
  await expect(page.getByRole("link", { name: /The Birth of Steve/ }).first()).toBeVisible();
});

test("grid and list view toggle", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page).toHaveURL(/view=list/);
});
