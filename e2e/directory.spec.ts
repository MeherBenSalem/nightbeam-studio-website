import { expect, test } from "@playwright/test";

test("directory lists the seeded project", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Projects/i);
  await expect(page.getByRole("link", { name: /The Birth of Steve/ }).first()).toBeVisible();
});

test("loader filter updates the URL and stays shareable", async ({ page }) => {
  await page.goto("/projects");
  await page.getByLabel("Filter by loader").selectOption("FABRIC");
  await expect(page).toHaveURL(/loader=FABRIC/);
  await page.getByLabel("Filter by Minecraft version").selectOption("26.2");
  await expect(page).toHaveURL(/version=26\.2/);
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
