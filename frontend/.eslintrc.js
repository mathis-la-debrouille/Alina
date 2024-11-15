module.exports = {
  env: {
    node: true,
  },
  parser: 'vue-eslint-parser',
  rules: {
    'vue/multi-word-component-names': 'off',
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended" // Add this line
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    requireConfigFile: false,
    ecmaVersion: 2020,
    sourceType: "module"
  },
  plugins: ["vue"]
};
