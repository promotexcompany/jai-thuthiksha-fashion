import { test, expect } from '@playwright/test';

test.describe('Jai Thuthiksha Fashion - E2E Smoke Tests', () => {

  test('1. Public website loads and displays catalogue dresses', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Confirm page title / brand heading is visible
    await expect(page).toHaveTitle(/Jai Thuthiksha/i);

    // Wait for dress images to be visible after API load finishes
    const firstImg = page.locator('.grid img').first();
    await firstImg.waitFor({ state: 'visible', timeout: 20000 });
    await expect(firstImg).toBeVisible();

    const count = await page.locator('.grid img').count();
    expect(count).toBeGreaterThan(0);
  });

  test('2. Admin Login page loads correctly', async ({ page }) => {
    await page.goto('/admin/login');

    // Verify Admin Portal Heading
    await expect(page.locator('h1')).toContainText(/Admin Management Login/i);

    // Verify Email and Password input fields exist
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('3. Admin Login & Dashboard Navigation (if credentials provided)', async ({ page }) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@JTF2026';
    const adminEmail = process.env.ADMIN_USERNAME || 'admin@jaithuthikshafashion.online';

    await page.goto('/admin/login');

    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);

    await page.click('button[type="submit"]');

    // Verify navigation to Admin Dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText(/Dress Management/i);

    // Verify Categories Tab
    await page.click('button:has-text("Categories")');
    await expect(page.locator('h1')).toContainText(/Category Management/i);
  });

});
