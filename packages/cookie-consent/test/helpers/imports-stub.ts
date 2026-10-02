// Stub for Nuxt's `#imports` virtual module so the SFCs/composables resolve under vitest.
// Reactivity comes from real Vue; the Nuxt app/config accessors delegate to globals a test may set
// (vi.mock('#imports', …) in the logic tests still fully overrides this — the alias is just the
// fallback so vite's SFC transform can resolve the bare specifier).
export { ref, computed, watch, reactive, onMounted, nextTick } from 'vue'

export function useNuxtApp(): any {
  const g = (globalThis as any).useNuxtApp
  return typeof g === 'function' && g !== useNuxtApp ? g() : {}
}

export function useRuntimeConfig(): any {
  const g = (globalThis as any).useRuntimeConfig
  return typeof g === 'function' && g !== useRuntimeConfig ? g() : { public: {} }
}

export function useCookie(): any {
  return { value: null }
}

export function useState(_key: string, init?: () => any): any {
  return { value: init ? init() : null }
}
