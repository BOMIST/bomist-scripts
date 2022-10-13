module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  extends: [
    // "eslint:recommended",
    "plugin:prettier/recommended",
    // "plugin:import/warnings",
    // "plugin:import/errors",
  ],
  plugins: ["prettier", "@typescript-eslint"],
  // add your custom rules here
  rules: {
    "no-unused-vars": "off",
    "no-constant-condition": "off",
  },
  settings: {
    "import/resolver": {
      alias: {
        map: [["~", "./"]],
      },
    },
  },
  ignorePatterns: ["tasks/", "test/"],
};
