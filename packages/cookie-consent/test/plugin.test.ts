import { describe, it, expect, vi } from 'vitest'

import plugin from '../src/runtime/plugin'

// The plugin restores the visitor's choice from the consent cookie. On a prerendered or cached page,
// useState hydrates from the payload that was rendered without any cookie, so the plugin must re-apply
// the cookie in the browser or every returning visitor sees the defaults again.
const env = vi.hoisted(() => ({ cookie: undefined as any, payload: {} as Record<string, any> }))
vi.mock('#imports', () => ({
  defineNuxtPlugin: (setup: any) => setup,
  useRuntimeConfig: () => ({
    public: {
      cookieConsent: {
        locale: 'en',
        categories: {
          necessary: { readonly: true },
          analytics: { kind: 'tracking' },
          replays: { kind: 'tracking', defaultEnabled: false },
        },
      },
    },
  }),
  useCookie: () => ({ value: env.cookie }),
  // Like Nuxt: a key already in the payload wins over the initializer.
  useState: (key: string, init: () => any) => ({ value: key in env.payload ? env.payload[key] : init() }),
  watch: () => {},
}))

function run(cookie: unknown, payload: Record<string, any> = {}) {
  env.cookie = cookie
  env.payload = payload
  let consent: any
  ;(plugin as any)({ provide: (_name: string, value: any) => { consent = value } })
  return consent
}

// What a prerendered page carries: the defaults, rendered with no cookie.
const prerendered = {
  'cookie-consent-choice-made': false,
  'cookie-consent-state': { necessary: true, analytics: true, replays: false },
}

describe('consent plugin', () => {
  it('without a cookie, starts from the defaults', () => {
    const consent = run(undefined)
    expect(consent.state.value).toEqual({ necessary: true, analytics: true, replays: false })
    expect(consent.hasMadeChoice.value).toBe(false)
  })

  it('restores a saved choice from the cookie', () => {
    const consent = run({ necessary: true, analytics: false, replays: true })
    expect(consent.state.value).toEqual({ necessary: true, analytics: false, replays: true })
    expect(consent.hasMadeChoice.value).toBe(true)
  })

  it('on a prerendered page, the cookie wins over the payload state', () => {
    const consent = run({ necessary: true, analytics: false, replays: true }, prerendered)
    expect(consent.state.value).toEqual({ necessary: true, analytics: false, replays: true })
    expect(consent.hasMadeChoice.value).toBe(true)
  })

  it('a cookie from an older category set keeps its choices but asks again', () => {
    const consent = run({ necessary: true, analytics: false }, prerendered)
    expect(consent.state.value).toEqual({ necessary: true, analytics: false, replays: false })
    expect(consent.hasMadeChoice.value).toBe(false)
  })
})
