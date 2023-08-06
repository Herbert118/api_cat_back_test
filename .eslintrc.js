module.exports = {
  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort'],

  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'simple-import-sort/imports': 'error',
  },

  overrides: [
    {
      "files": ["*.ts", "*.tsx"],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      env: {
        node: true,
        jest: true,
      },
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
    }

  ]
};
