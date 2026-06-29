import { test, expect } from '@playwright/test';

test('accueil FR : hero et section sensibilisation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ouvrir la boîte noire.');

  // La section sensibilisation est présente sur l'accueil.
  await expect(page.locator('#insights')).toBeVisible();
});

test('bascule de langue FR vers EN', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await page.waitForURL(/\/en\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Opening the black box.');
});

test('parcours sensibilisation : commencer puis révélation au 1er module', async ({ page }) => {
  await page.goto('/');
  const insights = page.locator('#insights');
  await insights.scrollIntoViewIfNeeded();
  // L'îlot React est hydraté en client:visible : attendre le raccord client.
  await page.waitForTimeout(1000);

  // Écran d'identité : rester anonyme et commencer le parcours.
  await insights.getByRole('button', { name: 'Commencer' }).click();

  // Premier module (concept-map) : assigner une catégorie à chaque item.
  // Chaque item est un groupe de boutons de catégorie ; on clique le premier de chaque groupe.
  const groups = insights.locator('fieldset [role="group"]');
  const groupCount = await groups.count();
  expect(groupCount).toBeGreaterThan(0);
  for (let i = 0; i < groupCount; i++) {
    await groups.nth(i).locator('button').first().click();
  }

  // Valider : la révélation à trois couches s'affiche.
  await insights.getByTestId('insight-submit').click();
  await expect(insights.getByTestId('insight-reveal')).toBeVisible();
});

test('jury redirige vers accueil', async ({ page }) => {
  await page.goto('/jury');
  await page.waitForURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
