import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import unicorn from 'eslint-plugin-unicorn'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      'create/**',
      'packages/api-client/src/generated/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: '19' } },
    plugins: {
      react,
      unicorn,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // file names are kebab-case.
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      // one component definition per file.
      'react/no-multi-comp': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // shadcn-generated components export variants alongside components.
    files: ['packages/ui/src/components/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // test doubles for components (inside vi.mock factories) are not component definitions.
    files: ['**/tests/**'],
    rules: { 'react/no-multi-comp': 'off' },
  },
  {
    // shadcn's card and select are one file of related components each.
    files: ['packages/ui/src/components/card.tsx', 'packages/ui/src/components/select.tsx'],
    rules: { 'react/no-multi-comp': 'off' },
  },
  {
    files: ['**/*.config.{js,ts}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
)
