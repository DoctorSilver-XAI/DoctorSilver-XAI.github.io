import { test, expect } from '@playwright/test';

test('accueil FR : hero, date confirmée, section insights', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ouvrir la boîte noire.');

  // La date confirmée apparaît dans la section JourJ (#soutenance).
  const jourj = page.locator('#soutenance');
  await expect(jourj).toBeVisible();
  await expect(jourj.getByText('Mercredi 22 juillet 2026', { exact: true })).toBeVisible();
  await expect(jourj.getByText('Salle des thèses', { exact: true })).toBeVisible();

  // La section insights publique est présente.
  await expect(page.locator('#insights')).toBeVisible();
});

test('bascule de langue FR → EN', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await page.waitForURL(/\/en\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Opening the black box.');
});

test('module insight public : répondre révèle le fait', async ({ page }) => {
  await page.goto('/');
  const insights = page.locator('#insights');
  await insights.scrollIntoViewIfNeeded();
  // L'îlot React est hydraté en client:visible : attendre le raccord client.
  await page.waitForTimeout(1000);

  // Répondre au 1er module à choix (estimate) : sélectionner une option…
  const firstOption = insights.locator('fieldset button').first();
  await expect(firstOption).toBeVisible();
  await firstOption.click();

  // …puis valider ; la révélation pédagogique s'affiche.
  const submit = insights.getByTestId('insight-submit');
  await submit.click();
  await expect(insights.getByTestId('insight-reveal')).toBeVisible();
});
