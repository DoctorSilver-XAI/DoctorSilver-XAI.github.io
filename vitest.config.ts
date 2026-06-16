import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Alias scopé sur "@/" (ne touche pas aux paquets @scope/...).
  resolve: {
    alias: [{ find: /^@\//, replacement: fileURLToPath(new URL('./src/', import.meta.url)) }],
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});
