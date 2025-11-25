const eslintPluginMocha = require('eslint-plugin-mocha');
const sortKeysFix = require('eslint-plugin-sort-keys-fix');
const globals = require('globals');

module.exports = [
  {
    ignores: [ 'node_modules/**', 'test/reports/**' ]
  },
  {
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.es2021,
        ...globals.mocha,
        ...globals.node
      },
      sourceType: 'commonjs'
    },
    plugins: {
      mocha: eslintPluginMocha.default || eslintPluginMocha,
      'sort-keys-fix': sortKeysFix.default || sortKeysFix
    },
    rules: {
      'array-bracket-spacing': [ 'error', 'always', {
        arraysInArrays: false,
        objectsInArrays: false
      }],
      'arrow-body-style': [ 'error', 'as-needed' ],
      'arrow-parens': [ 'error', 'always' ],
      'arrow-spacing': 'error',
      'brace-style': [ 'error', '1tbs', { allowSingleLine: true }],
      camelcase: [ 'error', { properties: 'never' }],
      'comma-dangle': [ 'error', 'never' ],
      'comma-style': [ 'error', 'first', { exceptions: { ArrayExpression: true, ObjectExpression: true } }],
      complexity: [ 'error', 5 ],
      'consistent-this': [ 'error', 'self' ],
      curly: [ 'error', 'all' ],
      'dot-notation': [ 'error', { allowPattern: '^[a-z]+(_[a-z]+)+$' }],
      'eol-last': 'error',
      eqeqeq: 'error',
      'id-length': [ 'error', { exceptions: [ '_' ] }],
      indent: [ 'error', 2, { SwitchCase: 1 }],
      'key-spacing': [ 'error', { afterColon: true, beforeColon: false }],
      'keyword-spacing': [ 'error', { after: true, before: true }],
      'linebreak-style': [ 'error', 'unix' ],
      'lines-around-comment': [ 'error', {
        afterLineComment: false,
        beforeBlockComment: true,
        beforeLineComment: true
      }],
      'max-len': [ 'error', {
        code: 120,
        ignoreTrailingComments: true,
        tabWidth: 2
      }],
      'max-params': [ 'error', 3 ],
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-identical-title': 'error',
      'mocha/no-sibling-hooks': 'error',
      'new-cap': 'error',
      'no-caller': 'error',
      'no-cond-assign': [ 'error', 'always' ],
      'no-debugger': 'off',
      'no-dupe-class-members': 'error',
      'no-empty': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'error',
      'no-undef': 'error',
      'no-unused-vars': [ 'error', { ignoreRestSiblings: true }],
      'no-var': 'error',
      'no-with': 'error',
      'object-shorthand': [ 'error', 'always' ],
      'one-var': [ 'error', {
        const: 'never',
        let: 'always',
        var: 'always'
      }],
      'operator-linebreak': [ 'error', 'before', { overrides: { '=': 'none' } }],
      'prefer-arrow-callback': [ 'error', { allowNamedFunctions: true }],
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      quotes: [ 'error', 'single' ],
      semi: [ 'error', 'always' ],
      'space-before-blocks': [ 'error', 'always' ],
      'space-before-function-paren': [ 'error', 'never' ],
      'space-in-parens': [ 'error', 'never' ],
      'space-infix-ops': 'error',
      'spaced-comment': [ 'error', 'always', { block: { exceptions: [ '-', '*' ] } }],
      'template-curly-spacing': [ 'error', 'never' ],
      'vars-on-top': 'error',
      'wrap-iife': [ 'error', 'any' ],
      yoda: [ 'error', 'never' ]
    }
  },
  {
    files: [ 'eslint.config.js' ],
    rules: {
      'sort-keys-fix/sort-keys-fix': [ 'error', 'asc', { caseSensitive: false }]
    }
  }
];
