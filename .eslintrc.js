module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    env: {
        browser: true,
        es6: true
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint'
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    settings: {
        react: {
            version: '16.0'
        }
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        'react/prop-types': ['warn'],
        '@typescript-eslint/no-unused-vars': ['error', { "argsIgnorePattern": "^_"}],
        '@typescript-eslint/explicit-module-boundary-types': "off"
    },
    overrides: [
        {
            files: ['**/*.test.js', '**/*.test.jsx'],
            env: {
                jest: true
            }
        }
    ]
};
