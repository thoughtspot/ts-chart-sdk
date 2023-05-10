/**
 * Copyright (c) 2023
 *
 * ESLint configuration for linting ThoughtSpot Chart SDK
 * source code.
 *
 * @summary ESLint config
 * @author Chetan Agrawal (chetan.agrawal@thoughtspot.com)
 */

module.exports = {
    env: {
        browser: true,
        es6: true,
        'jest/globals': true,
    },
    ignorePatterns: ['*.scss', '*.md'],
    extends: [
        'airbnb-base',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
        'plugin:jest/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:comment-length/recommended',
        'plugin:security/recommended',
        'plugin:anti-trojan-source/recommended',
        'plugin:compat/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'jest',
        'jsdoc',
        'simple-import-sort',
        'jest-dom',
        'testing-library',
        'ban',
        'promise',
        'prototype-pollution-security-rules',
        'no-unsanitized',
    ],
    settings: {
        'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', 'tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
    rules: {
        indent: 0, // Conflict with Prettier
        'no-shadow': 'off',
        'import/no-cycle': 'warn',
        'no-use-before-define': 'off',
        camelcase: 'off',
        quotes: [1, 'single', { avoidEscape: true }],
        'react/jsx-wrap-multilines': [
            'error',
            { declaration: false, assignment: false },
        ], // Conflict with Prettier
        'no-console': ['warn'],
        'react/jsx-curly-newline': [0],
        'react/jsx-indent': 0, // Conflict with Prettier
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-props-no-spreading': [0],
        'react/jsx-one-expression-per-line': 0, // Conflict with Prettier
        // Restrict file extensions that may contain JSX
        'react/jsx-filename-extension': [
            'error',
            {
                extensions: ['.jsx', '.tsx'],
            },
        ],
        'react/prop-types': [0],
        'react/require-default-props': 'off',
        'react/no-danger': 'error', // Use <SafeHTML /> wrapper instead of dangerouslySetInnerHTML
        '@typescript-eslint/explicit-function-return-type': [0],
        '@typescript-eslint/no-use-before-define': ['error'],
        '@typescript-eslint/no-explicit-any': [0],
        '@typescript-eslint/no-unused-vars': [0],
        'simple-import-sort/imports': [
            'error',
            {
                // This ensures there are no blank lines in between imports
                groups: [['^\\u0000', '^@?\\w', '^', '^\\.']],
            },
        ],
        'import/first': 'error',
        'import/no-duplicates': 'error',
        'import/newline-after-import': 'error',
        'import/prefer-default-export': 0,
        'jest-dom/prefer-checked': 'error',
        'jest-dom/prefer-enabled-disabled': 'error',
        'jest-dom/prefer-required': 'error',
        'jest-dom/prefer-to-have-class': 'error',
        'jest-dom/prefer-to-have-attribute': 'error',
        'testing-library/await-async-utils': 'error',
        'testing-library/await-async-query': 'error',
        'testing-library/no-await-sync-query': 'error',
        // 'testing-library/no-debug': 'warn', this is not working in latest
        'testing-library/no-dom-import': 'off',
        'prototype-pollution-security-rules/detect-merge': 1,
        'no-unsanitized/property': [
            'error',
            { escape: { methods: ['DOMPurify.sanitize'] } },
        ],
        'no-unsanitized/method': [
            'error',
            { escape: { methods: ['DOMPurify.sanitize'] } },
        ],
        // do not complain when importing js related files without extension,
        // Typescript should handle this.
        'import/extensions': [0],
        'no-restricted-imports': [
            'error',
            {
                paths: []
            }
        ],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    '**/*.spec.ts',
                    '**/*.spec.tsx',
                    '**/*.spec.util.tsx',
                    'jest/**/*.js',
                ],
            },
        ],
        'import/no-absolute-path': [0],
        'import/no-unresolved': 0,
        'no-plusplus': 0,
        'prefer-destructuring': 0,
        'react/destructuring-assignment': 0,
        'no-continue': 0,
        'prettier/prettier': [
            'error',
            {
                bracketSpacing: true,
                htmlWhitespaceSensitivity: 'css',
                jsxBracketSameLine: false,
                semi: true,
                singleQuote: true,
                tabWidth: 4,
                trailingComma: 'all',
            },
        ],
        'promise/always-return': 'error',
        'promise/no-return-wrap': 'error',
        'promise/param-names': 'error',
        'promise/catch-or-return': 'error',
        'promise/no-native': 'off',
        'promise/no-nesting': 'warn',
        'promise/no-promise-in-callback': 'warn',
        'promise/no-callback-in-promise': 'warn',
        'promise/no-new-statics': 'error',
        'promise/no-return-in-finally': 'warn',
        'promise/valid-params': 'warn',
        'security/detect-object-injection': 'off',
        "comment-length/limit-multi-line-comments": [
            "warn",
            {
              "maxLength": 100,
              "ignoreUrls": true
            }
          ]
    },
};
