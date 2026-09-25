import { expect, takeSnapshot, test } from '@chromatic-com/playwright';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }, testInfo) => {
      await page.goto('/');

      await expect(page.getByText('Sin filtros, sin censura, sin excusas')).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('should take screenshot of the English homepage', async ({ page }, testInfo) => {
      await page.goto('/en');

      await expect(page.getByText('No filters, no censorship, no excuses')).toBeVisible();

      await takeSnapshot(page, testInfo);
    });
  });
});
