import { expect, takeSnapshot, test } from '@chromatic-com/playwright';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }, testInfo) => {
      await page.goto('/');

      await expect(page.getByText('Una compañera de Inteligencia Artificial sin prejuicios')).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('should take screenshot of the English homepage', async ({ page }, testInfo) => {
      await page.goto('/en');

      await expect(page.getByText('A judgment-free, unfiltered and 100% confidential AI companion')).toBeVisible();

      await takeSnapshot(page, testInfo);
    });
  });
});
