module.exports = {
  env: {
    node: true,
  },
  rules: {
    'vue/multi-word-component-names': 'off',
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended" // Add this line
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false,
    ecmaVersion: 2020,
    sourceType: "module"
  },
  plugins: ["vue"]
};
