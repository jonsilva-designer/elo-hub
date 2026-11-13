import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // As telas leem tudo por lib/dados: a pasta mock é apagada na Etapa 3 (parte 1, 5.4).
  {
    files: ["**/*.{ts,tsx,mts}"],
    ignores: ["lib/dados/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          regex: "(^|/)dados/mock(/|$)",
          message: "Leia os dados por lib/dados. A pasta mock é apagada na Etapa 3.",
        }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
