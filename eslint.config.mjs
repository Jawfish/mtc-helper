import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import _import from 'eslint-plugin-import';
import promise from 'eslint-plugin-promise';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import tailwindcss from 'eslint-plugin-tailwindcss';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    {
        ignores: ['**/watch.js', 'dist/**/*']
    },
    ...fixupConfigRules(
        compat.extends(
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:tailwindcss/recommended',
            'plugin:import/typescript',
            'plugin:promise/recommended',
            'plugin:react/jsx-runtime',
            'plugin:react-hooks/recommended',
            ''
        )
    ),
    {
        plugins: {
            '@typescript-eslint': fixupPluginRules(typescriptEslint),
            import: fixupPluginRules(_import),
            promise: fixupPluginRules(promise),
            'react-hooks': fixupPluginRules(reactHooks),
            react: fixupPluginRules(react),
            tailwindcss: fixupPluginRules(tailwindcss),
            'unused-imports': unusedImports
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                chrome: 'readonly'
            },

            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',

            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },

        rules: {
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            'react/prop-types': 'off',
            'lines-between-class-members': ['error', 'always'],
            'padding-line-between-statements': [
                'error',
                {
                    blankLine: 'always',
                    prev: 'var',
                    next: 'return'
                }
            ],
            'newline-before-return': 'error',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'warn',
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
            // Allow namespaces for component props pattern to allow for not needing to
            // import separate interfaces:
            // namespace Component {
            //     export interface Props {
            //         prop: string;
            //     }
            // }
            //
            // export function Component({ prop }: Component.Props) {
            //     return <div>{prop}</div>;
            // }
            // ...
            // const Wrapper = (props: Component.Props) => <Component {...props} />;

            '@typescript-eslint/no-namespace': 'off',
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
        }
    }
];
