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
  globalIgnores(['dist/**', 'coverage/**', 'public/**', 'backend/**']),

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
