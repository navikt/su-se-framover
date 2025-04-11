// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    ignorePatterns: ['**/dist', '**/node_modules', '.idea'],
    parser: '@typescript-eslint/parser',
    env: { browser: true, es6: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        //nye prettier versjon kommer i konflikt med denne
        //'plugin:prettier/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:react/jsx-runtime',
    ],
    globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' },
    parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' },
    settings: { react: { version: 'detect' }, 'import/resolver': { typescript: {} }, 'import/internal-regex': '^~' },
    plugins: ['react', '@typescript-eslint', 'jsx-a11y'],
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'react/prop-types': 'off',
        'react/no-unused-prop-types': 'error',
        'import/order': [
            1,
            {
                alphabetize: { order: 'asc', caseInsensitive: true },
                'newlines-between': 'always',
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                pathGroups: [{ pattern: '~*/**', group: 'internal' }],
                pathGroupsExcludedImportTypes: [],
            },
        ],
        // TypeScript passer på at vi ikke driter oss ut, så vi trenger ikke disse
        'import/no-named-as-default-member': 0,
        'import/no-named-as-default': 0,
    },
    overrides: [{ files: ['**/*.test.js', '**/*.test.jsx'], env: { jest: true } }],
};
