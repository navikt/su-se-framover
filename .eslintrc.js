module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:prettier/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "settings": {
        "react": {
           "version": "16.0"
        }
     },
    "plugins": [
        "react"
    ],
    "rules": {
        "react/prop-types" : ["warn"]
    },
    "overrides":[
        {
            "files": ["**/*.test.js"],
            "env": {
                "jest": true
            }
        }
    ]
};
