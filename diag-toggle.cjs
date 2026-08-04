const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("request", (r) => { if (r.url().includes("_rsc") || r.url().includes("admin/users")) console.log("[req]", r.method(), r.url().slice(0, 90)); });
  const email = `diag3-${Date.now()}@nightbeam.studio`;
  await page.goto("http://localhost:3100/auth/register");
  await page.getByLabel("Display name").fill("Diag3");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("PlaywrightPass1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForTimeout(800);
  await page.goto("http://localhost:3100/admin");
  await page.waitForURL(/login/, { timeout: 10000 });
  await page.getByLabel("Email").fill("admin@nightbeam.studio");
  await page.getByLabel("Password", { exact: true }).fill("NightBeamAdmin123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto("http://localhost:3100/admin/users");
  const row = page.locator("tr", { hasText: email });
  await row.getByRole("button", { name: "Pro", exact: true }).click();
  console.log("clicked");
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(1000);
    const count = await row.getByRole("button", { name: "Pro ✓" }).count();
    console.log(`t+${i + 1}s Pro ✓ buttons: ${count}`);
    if (count > 0) break;
  }
  await browser.close();
})();
