import { describe, it, expect } from 'vitest'
import { defaultConsentState } from '../src/runtime/default-state'

// The state a visitor has before choosing anything — this is what decides whether cookieless analytics
// runs (opt-out) and whether an opt-in category like session replays stays off.
describe('defaultConsentState', () => {
  const categories = {
    necessary: { readonly: true },
    preferences: { kind: 'cookie' as const, readonly: true, requiresBanner: false },
    analytics: { kind: 'tracking' as const, requiresBanner: false },
    replays: { kind: 'tracking' as const, requiresBanner: false, defaultEnabled: false },
    ads: { kind: 'cookie' as const },
    strictAnalytics: { kind: 'tracking' as const, requiresBanner: true },
  }

  it('necessary is always on', () => {
    expect(defaultConsentState(categories).necessary).toBe(true)
    expect(defaultConsentState({ necessary: { defaultEnabled: false } }).necessary).toBe(true)
  })

  it('opt-out tracking (no banner) starts ON', () => {
    expect(defaultConsentState(categories).analytics).toBe(true)
  })

  it('defaultEnabled:false keeps a no-banner tracking category opt-in', () => {
    expect(defaultConsentState(categories).replays).toBe(false)
  })

  it('cookie categories and banner-gated tracking start OFF', () => {
    const s = defaultConsentState(categories)
    expect(s.ads).toBe(false)
    expect(s.strictAnalytics).toBe(false)
    expect(s.preferences).toBe(false)
  })

  it('defaultEnabled wins over the kind/banner rule', () => {
    expect(defaultConsentState({ ads: { kind: 'cookie', defaultEnabled: true } }).ads).toBe(true)
  })
})
