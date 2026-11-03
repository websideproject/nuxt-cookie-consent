import { describe, it, expect, vi, beforeEach } from 'vitest'

import plugin from '../src/runtime/plugin'

// The plugin restores the visitor's choice from the consent cookie. On a prerendered or cached page,
// useState hydrates from the payload that was rendered without any cookie, so the plugin must re-apply
// the cookie in the browser or every returning visitor sees the defaults again.
const env = vi.hoisted(() => ({
  cookies: {} as Record<string, { value: any }>,
  payload: {} as Record<string, any>,
  head: [] as any[],
  options: {} as Record<string, any>,
}))
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
        ...env.options,
      },
    },
  }),
  useCookie: (name: string) => (env.cookies[name] ??= { value: undefined }),
  // Like Nuxt: a key already in the payload wins over the initializer.
  useState: (key: string, init: () => any) => ({ value: key in env.payload ? env.payload[key] : init() }),
  useHead: (input: any) => { env.head.push(input) },
  // Only `immediate` matters here: it is how the plugin learns what was granted when the page loaded.
  watch: (source: any, cb: any, opts?: any) => { if (opts?.immediate) cb(source.value) },
}))
const revoke = vi.hoisted(() => ({ deleteCookies: vi.fn(() => []) }))
vi.mock('../src/runtime/revoke', () => revoke)

const reload = vi.fn()

beforeEach(() => {
  env.cookies = {}
  env.payload = {}
  env.head = []
  env.options = {}
  revoke.deleteCookies.mockClear()
  reload.mockClear()
  Object.defineProperty(window, 'location', { value: { reload, hostname: 'localhost' }, configurable: true })
  ;(window as any).dataLayer = undefined
  ;(window as any).__cookieConsentModeDefault = undefined
})

function run(cookie: unknown, opts: { payload?: Record<string, any>, meta?: unknown, options?: Record<string, any> } = {}) {
  env.cookies.cookie_consent = { value: cookie }
  env.cookies.cookie_consent_meta = { value: opts.meta }
  env.payload = opts.payload ?? {}
  env.options = opts.options ?? {}
  let consent: any
  const callHook = vi.fn(async () => {})
  ;(plugin as any)({ provide: (_name: string, value: any) => { consent = value }, callHook })
  return Object.assign(consent, { callHook })
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
    expect(consent.consentedAt.value).toBeNull()
  })

  it('restores a saved choice from the cookie', () => {
    const now = Date.now()
    const consent = run({ necessary: true, analytics: false, replays: true }, { meta: { version: null, at: now } })
    expect(consent.state.value).toEqual({ necessary: true, analytics: false, replays: true })
    expect(consent.hasMadeChoice.value).toBe(true)
    expect(consent.consentedAt.value).toBe(now)
  })

  it('on a prerendered page, the cookie wins over the payload state', () => {
    const consent = run({ necessary: true, analytics: false, replays: true }, { payload: prerendered })
    expect(consent.state.value).toEqual({ necessary: true, analytics: false, replays: true })
    expect(consent.hasMadeChoice.value).toBe(true)
  })

  it('a cookie from an older category set keeps its choices but asks again', () => {
    const consent = run({ necessary: true, analytics: false }, { payload: prerendered })
    expect(consent.state.value).toEqual({ necessary: true, analytics: false, replays: false })
    expect(consent.hasMadeChoice.value).toBe(false)
  })
})

describe('consent version and expiry', () => {
  const saved = { necessary: true, analytics: false, replays: true }

  it('a choice made under another consentVersion asks again from the defaults', () => {
    const consent = run(saved, { meta: { version: '1', at: Date.now() }, options: { consentVersion: '2' } })
    expect(consent.hasMadeChoice.value).toBe(false)
    expect(consent.state.value).toEqual({ necessary: true, analytics: true, replays: false })
  })

  it('a choice from before consentVersion was set asks again', () => {
    expect(run(saved, { options: { consentVersion: '1' } }).hasMadeChoice.value).toBe(false)
  })

  it('a choice made under the current version is kept', () => {
    expect(run(saved, { meta: { version: '2', at: Date.now() }, options: { consentVersion: '2' } }).hasMadeChoice.value).toBe(true)
  })

  it('a choice older than expiresInDays asks again; a recent one is kept', () => {
    const day = 24 * 60 * 60 * 1000
    expect(run(saved, { meta: { version: null, at: Date.now() - 31 * day }, options: { expiresInDays: 30 } }).hasMadeChoice.value).toBe(false)
    expect(run(saved, { meta: { version: null, at: Date.now() - 29 * day }, options: { expiresInDays: 30 } }).hasMadeChoice.value).toBe(true)
  })

  it('a commit stores the version and the time with the choice', async () => {
    const consent = run(undefined, { options: { consentVersion: '3' } })
    await consent.acceptAll()
    expect(env.cookies.cookie_consent!.value).toEqual({ necessary: true, analytics: true, replays: true })
    expect(env.cookies.cookie_consent_meta!.value).toEqual({ version: '3', at: consent.consentedAt.value })
    expect(consent.consentedAt.value).toBeTypeOf('number')
  })
})

describe('accept all / reject all', () => {
  it('acceptAll grants every category', async () => {
    const consent = run(undefined)
    await consent.acceptAll()
    expect(consent.state.value).toEqual({ necessary: true, analytics: true, replays: true })
    expect(consent.hasMadeChoice.value).toBe(true)
  })

  it('rejectAll withdraws everything optional, opt-out tracking included', async () => {
    const consent = run(undefined)
    await consent.rejectAll()
    expect(consent.state.value).toEqual({ necessary: true, analytics: false, replays: false })
    expect(consent.hasMadeChoice.value).toBe(true)
  })

  it('updateState keeps readonly categories granted', async () => {
    const consent = run(undefined)
    await consent.updateState({ necessary: false, analytics: false, replays: true })
    expect(consent.state.value).toEqual({ necessary: true, analytics: false, replays: true })
  })
})

describe('events', () => {
  it('a commit reports what changed, then each granted and each revoked category', async () => {
    const consent = run(undefined)
    await consent.updateState({ necessary: true, analytics: false, replays: true })
    expect(consent.callHook.mock.calls).toEqual([
      ['consent:changed', {
        state: { necessary: true, analytics: false, replays: true },
        previous: { necessary: true, analytics: true, replays: false },
        granted: ['replays'],
        revoked: ['analytics'],
        action: 'save',
      }],
      ['consent:granted', 'replays'],
      ['consent:revoked', 'analytics'],
    ])
  })

  it('the action names how the choice was made', async () => {
    const consent = run(undefined)
    await consent.rejectAll()
    expect(consent.callHook.mock.calls[0][1].action).toBe('rejectAll')
  })
})

describe('revocation', () => {
  const categories = {
    necessary: { readonly: true },
    analytics: { cookies: [{ id: '_ga' }, { id: '_ga_*' }] },
    marketing: { cookies: [{ id: '_fbp' }], reloadOnRevoke: false },
  }

  it('deletes the withdrawn category\'s cookies and reloads the page', async () => {
    const consent = run({ necessary: true, analytics: true, marketing: false }, { options: { categories } })
    await consent.rejectAll()
    expect(revoke.deleteCookies).toHaveBeenCalledWith(['_ga', '_ga_*'])
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('does not reload when the category opted out, or reloadOnRevoke is off', async () => {
    let consent = run({ necessary: true, analytics: false, marketing: true }, { options: { categories } })
    await consent.rejectAll()
    expect(revoke.deleteCookies).toHaveBeenCalledWith(['_fbp'])
    expect(reload).not.toHaveBeenCalled()

    consent = run({ necessary: true, analytics: true, marketing: false }, { options: { categories, reloadOnRevoke: false } })
    await consent.rejectAll()
    expect(reload).not.toHaveBeenCalled()
  })

  it('a commit that withdraws nothing deletes nothing', async () => {
    const consent = run({ necessary: true, analytics: false, marketing: false }, { options: { categories } })
    await consent.acceptAll()
    expect(revoke.deleteCookies).not.toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
  })

  it('revokes even when a consent:revoked listener throws', async () => {
    const consent = run({ necessary: true, analytics: true, marketing: false }, { options: { categories } })
    consent.callHook.mockImplementation(async (name: string) => { if (name === 'consent:revoked') throw new Error('listener') })
    await expect(consent.rejectAll()).rejects.toThrow('listener')
    expect(revoke.deleteCookies).toHaveBeenCalled()
    expect(reload).toHaveBeenCalled()
  })
})

describe('Google Consent Mode', () => {
  const googleConsentMode = { mapping: { analytics: 'analytics_storage', replays: ['ad_storage', 'ad_user_data'] } }
  const commands = () => ((window as any).dataLayer ?? []).map((args: IArguments) => Array.from(args))

  it('sends nothing unless configured', () => {
    run(undefined)
    expect(env.head).toEqual([])
    expect((window as any).dataLayer).toBeUndefined()
  })

  it('puts the default command in the head, then sends default + the restored choice', () => {
    run({ necessary: true, analytics: false, replays: true }, { options: { googleConsentMode } })
    expect(env.head[0].script[0].innerHTML).toContain('\'consent\',\'default\'')
    const [def, update] = commands()
    expect(def.slice(0, 2)).toEqual(['consent', 'default'])
    expect(def[2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'denied', ad_personalization: 'denied', wait_for_update: 500 })
    expect(update).toEqual(['consent', 'update', expect.objectContaining({ analytics_storage: 'denied', ad_storage: 'granted', ad_user_data: 'granted' })])
  })

  it('sends an update on every commit', async () => {
    const consent = run(undefined, { options: { googleConsentMode } })
    await consent.rejectAll()
    expect(commands().at(-1)).toEqual(['consent', 'update', expect.objectContaining({ analytics_storage: 'denied', ad_storage: 'denied' })])
  })
})
