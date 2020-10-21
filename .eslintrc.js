/* eslint sort-keys: [ "error", "asc", { "caseSensitive": false }] */

module.exports = {
  'env': {
    'es6': true,
    'mocha': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 2021,
    'sourceType': 'module'
  },
  'plugins': [
    'mocha'
  ],
  'rules': {
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
    'no-spaced-func': 'error',
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
    'require-jsdoc': [ 'error', { require: {
      ArrowFunctionExpression: true,
      ClassDeclaration: true,
      FunctionDeclaration: true,
      FunctionExpression: true,
      MethodDefinition: true
    }}],
    semi: [ 'error', 'always' ],
    'space-before-blocks': [ 'error', 'always' ],
    'space-before-function-paren': [ 'error', 'never' ],
    'space-in-parens': [ 'error', 'never' ],
    'space-infix-ops': 'error',
    'space-return-throw-case': 'off',
    'space-unary-ops': 'off',
    'spaced-comment': [ 'error', 'always', { block: { exceptions: [ '-', '*' ]}}],
    strict: [ 'error', 'global' ],
    'template-curly-spacing': [ 'error', 'never' ],
    'valid-jsdoc': [ 'error', {
      preferType: {
        Boolean: 'boolean',
        Number: 'number',
        object: 'Object',
        String: 'string'
      },
      requireParamDescription: true,
      requireReturn: false,
      requireReturnType: true
    }],
    'vars-on-top': 'error',
    'wrap-iife': [ 'error', 'any' ],
    yoda: [ 'error', 'never' ]
  }
};
