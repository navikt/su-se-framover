// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:jsx-a11y/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    settings: {
        react: {
            version: '16.0',
        },
        'import/resolver': { typescript: {} },
        'import/internal-regex': '^~',
    },
    plugins: ['react', '@typescript-eslint', 'jsx-a11y'],
    rules: {
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'react/prop-types': 'off',
        'import/order': [
            1,
            {
                alphabetize: { order: 'asc', caseInsensitive: true },
                'newlines-between': 'always',
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                pathGroups: [
                    {
                        pattern: '~*/**',
                        group: 'internal',
                    },
                ],
                pathGroupsExcludedImportTypes: [],
            },
        ],
        // TypeScript passer på at vi ikke driter oss ut, så vi trenger ikke disse
        'import/no-named-as-default-member': 0,
        'import/no-named-as-default': 0,
    },
    overrides: [
        {
            files: ['**/*.test.js', '**/*.test.jsx'],
            env: {
                jest: true,
            },
        },
    ],
};
