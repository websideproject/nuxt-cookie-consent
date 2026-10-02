import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// Component (L3) tests mount the .vue SFCs, so we need the Vue SFC compiler + a DOM environment.
// `#imports` is a Nuxt build-only virtual module; alias it to a stub so vite can resolve the SFC's
// imports (the logic tests still `vi.mock('#imports', …)` to override it per-file).
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '#imports': fileURLToPath(new URL('./test/helpers/imports-stub.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
  },
})
