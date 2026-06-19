import { test, expect } from '@playwright/test';

test('accueil FR : hero, créneau privilégié, sélection et récapitulatif', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ouvrir la boîte noire.');

  // Les créneaux privilégiés portent la classe .slot--reco.
  const preferredSlots = page.locator('.slot--reco');
  await expect(preferredSlots).toHaveCount(2);
  const slot = page.getByRole('button', {
    name: 'Lundi 20 juillet 2026, 9 h–11 h, Créneau à privilégier pour réunir tout le monde plus vite.',
  });
  await slot.scrollIntoViewIfNeeded();
  // L'îlot React est hydraté en client:visible : on attend le raccord client avant le clic.
  await page.waitForTimeout(1000);
  await expect(slot).toBeVisible();
  await expect(page.locator('.slot__badge')).toHaveCount(2);

  await expect(slot).toHaveAttribute('aria-pressed', 'false');
  await slot.click();
  // Attend l'hydratation + le toggle avant de vérifier le récapitulatif.
  await expect(slot).toHaveAttribute('aria-pressed', 'true');
  // Le récapitulatif liste le créneau choisi (date complète, unique au résumé).
  await expect(page.locator('[aria-live="polite"]').getByText(/Lundi 20 juillet 2026/)).toBeVisible();
});

test('bascule de langue FR → EN', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await page.waitForURL(/\/en\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Opening the black box.');
});
