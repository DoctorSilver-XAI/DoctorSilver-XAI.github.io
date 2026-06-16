import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      '.remember/',
      'scripts/', // scripts de build Node (globals non déclarés ici)
      'src/env.d.ts', // types Astro générés (triple-slash reference)
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  // Accessibilité sur les îlots React (.tsx)
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: { ...jsxA11y.configs.recommended.rules },
  },
  // Tolérances utiles
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
);
