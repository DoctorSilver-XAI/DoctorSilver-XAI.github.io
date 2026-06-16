/**
 * Génère public/og.png (1200×630) en capturant public/og-template.html.
 * Nécessite le navigateur Chromium de Playwright : `pnpm exec playwright install chromium`.
 * Usage : `pnpm og`
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const template = fileURLToPath(new URL('../public/og-template.html', import.meta.url));
const output = fileURLToPath(new URL('../public/og.png', import.meta.url));

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(`file://${template}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500); // laisser les polices Google se charger
  await page.locator('#card').screenshot({ path: output });
  console.log(`✓ Image Open Graph générée : ${output}`);
} finally {
  await browser.close();
}
