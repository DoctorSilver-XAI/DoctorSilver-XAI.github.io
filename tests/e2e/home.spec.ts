import { test, expect } from '@playwright/test';

test('accueil FR : hero, créneau privilégié, sélection et récapitulatif', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ouvrir la boîte noire.');

  // Le créneau recommandé (mardi 7 juillet 9 h–11 h) porte la classe unique .slot--reco.
  const slot = page.locator('.slot--reco');
  await slot.scrollIntoViewIfNeeded();
  await expect(slot).toBeVisible();
  await expect(page.getByText('Créneau privilégié')).toBeVisible();

  await expect(slot).toHaveAttribute('aria-pressed', 'false');
  await slot.click();
  // Attend l'hydratation + le toggle avant de vérifier le récapitulatif.
  await expect(slot).toHaveAttribute('aria-pressed', 'true');
  // Le récapitulatif liste le créneau choisi (date complète, unique au résumé).
  await expect(page.getByText(/Mardi 7 juillet 2026/).first()).toBeVisible();
});

test('bascule de langue FR → EN', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await page.waitForURL(/\/en\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Opening the black box.');
});
