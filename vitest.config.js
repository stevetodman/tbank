import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'docs/assets/js/questionData.js', // Pure data file
        'scripts/**',
        '**/*.config.js',
        '**/test/**',
        '**/__tests__/**'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    },
    include: ['**/__tests__/**/*.test.js', '**/*.test.js'],
    exclude: ['node_modules', 'docs/sw.js'] // SW requires different testing approach
  }
});
