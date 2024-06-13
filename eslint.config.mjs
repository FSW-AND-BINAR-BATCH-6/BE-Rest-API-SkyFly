import globals from "globals";

export default [
    {
        rules: {
            "no-unused-vars": "error",
        },
    },
    {
        ignores: [".config/*", "node_modules/*", "coverage/*"],
    },
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    { languageOptions: { globals: globals.browser } },
];
