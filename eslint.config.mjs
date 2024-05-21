import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
        },
        parserOptions: {
          ecmaVersion: "latest",
          moduleType: "commonjs"
        },
      },
    },
    {
      files: ["test/*.js"],
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.mocha,
        },
      },
    },
];
