const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const globals = require("globals");

const {
    fixupConfigRules,
    fixupPluginRules,
} = require("@eslint/compat");

const react = require("eslint-plugin-react");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const jsxA11Y = require("eslint-plugin-jsx-a11y");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,

        globals: {
            ...globals.browser,
            Atomics: "readonly",
            SharedArrayBuffer: "readonly",
        },

        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:react/jsx-runtime",
    )),

    settings: {
        react: {
            version: "detect",
        },

        "import/resolver": {
            typescript: {},
        },

        "import/internal-regex": "^~",
    },

    plugins: {
        react: fixupPluginRules(react),
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        "jsx-a11y": fixupPluginRules(jsxA11Y),
    },

    rules: {
        "no-unused-vars": "off",

        "@typescript-eslint/no-unused-vars": ["error", {
            vars: "all",
            args: "after-used",
            ignoreRestSiblings: false,
        }],

        "@typescript-eslint/array-type": ["error", {
            default: "array-simple",
        }],

        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "react/prop-types": "off",
        "react/no-unused-prop-types": "error",

        "import/order": [1, {
            alphabetize: {
                order: "asc",
                caseInsensitive: true,
            },

            "newlines-between": "always",
            groups: ["builtin", "external", "internal", "parent", "sibling", "index"],

            pathGroups: [{
                pattern: "~*/**",
                group: "internal",
            }],

            pathGroupsExcludedImportTypes: [],
        }],

        "import/no-named-as-default-member": 0,
        "import/no-named-as-default": 0,
    },
}, globalIgnores(["**/dist", "**/node_modules", "**/.idea"]), {
    files: ["**/*.test.js", "**/*.test.jsx"],

    languageOptions: {
        globals: {
            ...globals.jest,
        },
    },
}]);
