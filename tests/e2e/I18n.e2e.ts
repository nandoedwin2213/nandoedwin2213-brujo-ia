import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test.describe('Language Switching', () => {
    test('should switch language from Spanish to English using dropdown and verify text on the homepage', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByText('Una compañera de Inteligencia Artificial sin prejuicios')).toBeVisible();

      await page.getByRole('button', { name: 'Cambiar idioma' }).click();
      await page.getByText('English').click();

      await expect(page.getByText('A judgment-free, unfiltered and 100% confidential AI companion')).toBeVisible();
    });

    test('should switch language from Spanish to English using URL and verify text on the sign-in page', async ({ page }) => {
      await page.goto('/sign-in');

      await expect(page.getByText('Correo electrónico')).toBeVisible();

      await page.goto('/en/sign-in');

      await expect(page.getByText('Email address')).toBeVisible();
    });
  });
});
