import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    // ES6 modules (utils.js)
    files: ['docs/assets/js/utils.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }]
    }
  },
  {
    // IIFE scripts (app.js, questionData.js)
    files: ['docs/assets/js/app.js', 'docs/assets/js/questionData.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.serviceworker
      }
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^QUESTION_SETS$' // Allow QUESTION_SETS (used globally)
      }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'indent': ['warn', 2, { SwitchCase: 1 }],
      'no-inner-declarations': 'off'
    }
  },
  {
    // questionsPage.js references QUESTION_SETS global
    files: ['docs/assets/js/questionsPage.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        QUESTION_SETS: 'readonly' // Global from questionData.js
      }
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'no-inner-declarations': 'off'
    }
  },
  {
    files: ['scripts/**/*.js', '**/*.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },
  {
    ignores: [
      'node_modules/**',
      'docs/assets/question_banks/**',
      'question_banks/**',
      'coverage/**'
    ]
  }
];
