// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
  },
  plugins: ['prettier', 'jest'],
  extends: ['eslint:recommended', 'plugin:jest/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-alert': 1,
    'no-console': 1,
    'no-var': 1,
    'no-param-reassign': [2, { props: false }],
    'no-plusplus': 0,
    'no-iterator': 0,
    'prefer-const': 1,
    'func-style': 0,
    'prettier/prettier': 'error',
  },
};
