import { describe, it, expect, vi } from 'vitest'
import { nextTick, ref } from 'vue'

import { useConsentCookie } from '../src/runtime/composables/useConsentCookie'

const env = vi.hoisted(() => ({ cookies: {} as Record<string, { value: any }>, state: null as any }))
// `#imports` and `#app` alias the same stub file (vitest.config.ts), so one mock serves both.
const mockImports = vi.hoisted(() => async () => {
  const vue = await import('vue')
  return {
    ref: vue.ref,
    computed: vue.computed,
    watch: vue.watch,
    onMounted: () => {},
    useNuxtApp: () => ({ $consent: { state: env.state } }),
    useCookie: (name: string) => (env.cookies[name] ??= { value: undefined }),
  }
})
vi.mock('#imports', mockImports)
vi.mock('#app', mockImports)

describe('useConsentCookie', () => {
  it('writes only while consent is granted, and deletes the cookie when it is withdrawn', async () => {
    env.state = ref({ necessary: true, preferences: false })
    const theme = useConsentCookie<string>('theme', 'preferences' as any)

    theme.value = 'dark'
    expect(env.cookies.theme?.value, 'no consent yet').toBeUndefined()

    env.state.value = { necessary: true, preferences: true }
    await nextTick()
    theme.value = 'dark'
    expect(env.cookies.theme!.value).toBe('dark')

    env.state.value = { necessary: true, preferences: false }
    await nextTick()
    expect(env.cookies.theme!.value, 'withdrawn → deleted').toBeNull()
    expect(theme.value, 'kept in memory for this page').toBe('dark')
  })
})
