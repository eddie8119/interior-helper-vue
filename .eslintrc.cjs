module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended', //自動關閉衝突 Integrates Prettier, must be last
  ],
  parser: 'vue-eslint-parser', // Main parser for .vue files
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser', // Parser for <script> blocks
    sourceType: 'module',
  },
  plugins: ['vue', '@typescript-eslint', 'import'],

  rules: {
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto',
      },
    ],
    'vue/valid-template-root': 'error',
    'vue/no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-alert': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',

    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
      },
    ],
    'vue/html-indent': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/component-name-in-template-casing': [
      'warn',
      'PascalCase',
      {
        registeredComponentsOnly: false,
        ignores: ['router-link', 'router-view'],
      },
    ],
    'vue/block-order': [
      'error',
      {
        order: ['template', 'script', 'style'],
      },
    ],
    'vue/define-macros-order': [
      'error',
      {
        order: ['defineProps', 'defineEmits'],
      },
    ],
    'vue/no-unused-refs': 'warn',
    'vue/no-template-shadow': 'error',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'sort-imports': [
      'warn',
      {
        // 忽略 import 語句的順序（由 import/order 處理）
        ignoreDeclarationSort: true,
        // 只排序具名引入內部的成員
        ignoreMemberSort: false,
        // 成員排序方式
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        // 忽略大小寫
        ignoreCase: true,
      },
    ],
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      rules: {
        'func-style': ['error', 'expression', { allowArrowFunctions: true }],
        'vue/composition-api-order': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      rules: {
        'func-style': 'off',
      },
    },
  ],
};
