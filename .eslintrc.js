module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'vue/custom-event-name-casing': 'off',
    'no-use-before-define': 'off',
    // 'no-use-before-define': [
    //   'error',
    //   {
    //     functions: false,
    //     classes: true,
    //   },
    // ],
    '@typescript-eslint/no-use-before-define': 'off',
    // '@typescript-eslint/no-use-before-define': [
    //   'error',
    //   {
    //     functions: false,
    //     classes: true,
    //   },
    // ],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'off',
      {
        argsIgnorePattern: '^h$',
        varsIgnorePattern: '^h$'
      }
    ],
    'no-unused-vars': 'off',
    'space-before-function-paren': 'off',
    quotes: ['error', 'single'],
    'comma-dangle': ['error', 'never'],
    'vue/max-attributes-per-line': 0, // 控制一行可接受的属性量
    'vue/singleline-html-element-content-newline': 'off', // 关闭在单行元素的内容之前和之后需要换行
    // 空标签需要自闭合
    'vue/html-self-closing': ['error', {
      'html': {
        'void': 'always',
        'normal': 'always',
        'component': 'always'
      },
      'svg': 'always',
      'math': 'always'
    }],
    'vue/script-setup-uses-vars': 'off',
    'vue/name-property-casing': ['error', 'PascalCase'],
    'vue/no-v-html': 'off',
    'vue/no-unused-components': [0, { ignoreWhenBindingPresent: true }],
    'no-mixed-spaces-and-tabs': 'off',
    'no-multiple-empty-lines': ['error', { 'max': 1 }], // 空行最多不能超过 1 行
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off', // 不允许对初始化为数字、字符串或布尔值的变量或参数进行显式类型声明
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // 'semi': 'off',
    // '@typescript-eslint/semi': ['error'], // 要求或禁止使用分号代替
    'indent': ['error', 2, { SwitchCase: 1 }], // 缩进使用 2个空格
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }], // 强制使用单引号 & 允许字符串使用反勾号
    'object-curly-spacing': ['error', 'always'], // 强制在花括号中使用一致的空格
    'comma-spacing': ['error', { 'before': false, 'after': true }], // 控制逗号前后的空格
    'eqeqeq': ['warn', 'always', { 'null': 'ignore' }], // 必须使用 === 和 !== ，和 null 对比时除外
    'no-multi-spaces': 'error', // 禁止使用多个空格
    'keyword-spacing': 'error' // 关键字前后必须有空格
  }
};