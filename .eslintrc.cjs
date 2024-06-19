/* eslint-disable no-undef */
module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:tailwindcss/recommended',
        'plugin:import/typescript',
        'plugin:promise/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:prettier/recommended',
        'plugin:react-hooks/recommended',
        ''
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint',
        'import',
        'jsx-a11y',
        'prettier',
        'promise',
        'react-hooks',
        'react',
        'tailwindcss',
        'unused-imports'
    ],
    rules: {
        'prettier/prettier': [
            'error',
            {
                arrowParens: 'avoid',
                bracketSameLine: true,
                bracketSpacing: true,
                embeddedLanguageFormatting: 'auto',
                endOfLine: 'lf',
                htmlWhitespaceSensitivity: 'css',
                insertPragma: false,
                jsxSingleQuote: true,
                printWidth: 88,
                proseWrap: 'preserve',
                quoteProps: 'as-needed',
                requirePragma: false,
                semi: true,
                singleQuote: true,
                tabWidth: 4,
                trailingComma: 'none',
                useTabs: false
            },
            {
                usePrettierrc: false
            }
        ],
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'react/prop-types': 'off',
        'lines-between-class-members': ['error', 'always'],
        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: 'var', next: 'return' }
        ],
        'newline-before-return': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'warn',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_'
            }
        ],
        'no-var': 'error',
        'no-console': 'warn',
        'promise/prefer-await-to-then': 'error',
        'promise/prefer-await-to-callbacks': 'error',
        'object-shorthand': 'error',
        'prefer-const': 'error',
        'prefer-template': 'error',
        'prefer-destructuring': 'warn',
        'prefer-rest-params': 'warn',
        'prefer-spread': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'off',
        yoda: 'error',
        'tailwindcss/classnames-order': 'off',
        'tailwindcss/no-custom-classname': 'warn',
        'tailwindcss/no-contradicting-classname': 'error',
        'import/order': [
            'error',
            {
                groups: [
                    'type',
                    'builtin',
                    'object',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index'
                ],
                pathGroups: [
                    {
                        pattern: '~/**',
                        group: 'external',
                        position: 'after'
                    }
                ],
                'newlines-between': 'always'
            }
        ]
    },
    globals: {
        chrome: 'readonly'
    },
    ignorePatterns: ['watch.js', 'dist/**']
};
