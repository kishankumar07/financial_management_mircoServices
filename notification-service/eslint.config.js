import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Keep browser globals
        ...globals.node, // Add Node.js globals
        ...globals.jest, // Include Jest testing globals
      },
    },
  },
  pluginJs.configs.recommended,
];
