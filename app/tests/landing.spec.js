import { test, expect } from '@playwright/test';



test.describe('Landing Page', () => {

  test('should display landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Faux\'s Combat Tracker/);
    //await expect(page.locator('p')).toContainText('GitHub Repository: https://github.com/shanep/fullstack-starter');

  });



});
