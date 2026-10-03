import { test, expect } from '@playwright/test';

const viewports = [
  { width: 320, height: 568, name: '320px (Tiny Mobile)' },
  { width: 360, height: 640, name: '360px (Small Mobile)' },
  { width: 375, height: 667, name: '375px (iPhone SE)' },
  { width: 390, height: 844, name: '390px (iPhone 12/13/14)' },
  { width: 430, height: 932, name: '430px (iPhone Pro Max)' },
  { width: 768, height: 1024, name: '768px (Tablet Portrait)' },
  { width: 1024, height: 768, name: '1024px (Tablet Landscape)' },
  { width: 1366, height: 768, name: '1366px (Desktop Laptop)' }
];

test.describe('Jai Thuthiksha Fashion - Viewport Responsive Tests', () => {

  for (const vp of viewports) {
    test(`Responsive layout check at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // 1. Verify No Horizontal Overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(overflow, `Horizontal overflow detected at ${vp.width}px`).toBe(false);

      // 2. Verify Logo is Visible
      const logo = page.locator('header img').first();
      await expect(logo).toBeVisible();

      // 3. Verify Header fits correctly
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // 4. Test Mobile Menu Toggle if mobile viewport (< 768px)
      if (vp.width < 768) {
        const menuBtn = page.locator('button[aria-label="Toggle navigation menu"]');
        await expect(menuBtn).toBeVisible();
        await menuBtn.click();
        
        // Drawer should open and fit viewport
        const drawer = page.locator('header div.md\\:hidden');
        await expect(drawer).toBeVisible();
        
        // Close menu
        await menuBtn.click();
      }

      // 5. Verify Catalogue grid cards render without clipping
      const firstCard = page.locator('.grid > div').first();
      await expect(firstCard).toBeVisible();
    });
  }

});
