// @ts-check
const nextConfig = require('eslint-config-next');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Next.js flat config (includes React, react-hooks, @next/next rules)
  ...nextConfig,

  // Project-wide overrides
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // App Router — no pages/ directory
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  // Ignore build artifacts and config files
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
    ],
  },
];
