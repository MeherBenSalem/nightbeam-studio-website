import { expect, test } from "@playwright/test";

const email = `e2e-${Date.now()}@nightbeam.studio`;
const password = "PlaywrightPass1";

test("register, sign in, and sign out", async ({ page }) => {
  await page.goto("/auth/register");
  await page.getByLabel("Display name").fill("E2E Player");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Account created")).toBeVisible();

  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Dashboard/i);

  await page.getByRole("button", { name: /E2E Player/ }).click();
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/");
});

test("admin panel is gated and reachable for the admin", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth\/login/);

  await page.getByLabel("Email").fill("admin@nightbeam.studio");
  await page.getByLabel("Password", { exact: true }).fill("NightBeamAdmin123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
  await expect(page.getByText("Users & roles")).toBeVisible();
});

test("invalid credentials show an error", async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill("nobody@nightbeam.studio");
  await page.getByLabel("Password", { exact: true }).fill("WrongPass123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText(/Invalid email or password/)).toBeVisible();
});
