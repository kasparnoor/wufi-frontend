module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "@next/next/no-page-custom-font": "off",
    "@next/next/no-typos": "off",
    "@next/next/no-duplicate-head": "off",
    "@next/next/no-before-interactive-script-outside-document": "off",
    "@next/next/no-styled-jsx-in-document": "off"
  }
};