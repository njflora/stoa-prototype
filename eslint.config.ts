// Lint rules for the site (src) and the data scripts (scripts).
// ESLint finds likely bugs; Prettier owns layout, so the formatting rules
// are switched off last (skip-formatting) and the two never disagree.
import js from '@eslint/js'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores(['dist/**', 'coverage/**', 'public/**', 'backend/**', 'test-results/**', 'playwright-report/**']),

  js.configs.recommended,
  // Rules that use type information, such as unhandled promises.
  tseslint.configs.recommendedTypeChecked,
  pluginVue.configs['flat/recommended'],

  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
  },
  {
    rules: {
      // A leading underscore marks a value left out on purpose, as in
      // `const { id: _, ...rest } = item`. So do the other names in a rest pattern.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    // Single-file components: the template uses vue-eslint-parser, and
    // the script inside it uses TypeScript's parser.
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    // The data scripts are plain JavaScript run by Node, with no tsconfig.
    files: ['scripts/**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },

  skipFormatting,
)
