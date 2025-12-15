// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginPrettier from 'eslint-plugin-prettier'
import security from 'eslint-plugin-security'

// Minimal Node globals (no 'globals' pkg)
const nodeGlobals = {
  process: true,
  console: true,
  __dirname: true,
  __filename: true,
  module: true,
  require: true,
  exports: true,
  Buffer: true,
  setTimeout: true,
  clearTimeout: true,
  setInterval: true,
  clearInterval: true,
  describe: true,
  it: true,
  expect: true,
  beforeEach: true,
  jest: true,
}

export default [
  // Global ignores (apply to all file types)
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'package-lock.json'],
  },

  // Base JS rules
  js.configs.recommended,

  // Apps (browser, TS/TSX)
  {
    files: ['src/**/*.{ts,tsx}', 'prisma/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tseslint.parser,
      globals: {
        ...nodeGlobals,
        URL: true,
        URLSearchParams: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: pluginPrettier,
      security,
    },
    rules: {
      // Disable core rules that conflict with TypeScript
      'no-undef': 'off',
      'no-unused-vars': 'off',

      // Prefer TS-specific rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Formatting as warnings so lint doesn't fail on style-only issues
      'prettier/prettier': ['warn', { endOfLine: 'auto' }],

      // Security plugin
      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'warn',
    },
  },

  // Services and scripts (Node, TS/JS)
  {
    files: ['src/**/*.{ts,js}', 'prisma/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tseslint.parser,
      globals: {
        ...nodeGlobals,
        URL: true,
        URLSearchParams: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: pluginPrettier,
      security,
    },
    rules: {
      // Disable core rules conflicting with TS
      'no-undef': 'off',
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prettier/prettier': ['warn', { endOfLine: 'auto' }],

      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'warn',
    },
  },
]
