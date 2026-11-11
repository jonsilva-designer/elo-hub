import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  oxc: { jsx: { runtime: 'automatic' } },
  // Fuso fixo em UTC: os testes de data não podem depender do fuso da máquina.
  test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], css: false, env: { TZ: 'UTC' } },
})
