import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {languageOptions: {  globals: {
    ...globals.browser, // keep browser globals
    process: 'readonly',
    ...globals.jest
     // Add process as a global for Node.js
     }
 }},
  pluginJs.configs.recommended,
];