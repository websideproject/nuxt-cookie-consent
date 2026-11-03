import { describe, it, expect } from 'vitest'

import { CONSENT_MODE_TYPES, consentModeDefaultScript, consentModePayload } from '../src/runtime/consent-mode'

describe('consentModePayload', () => {
  it('names every Consent Mode type, denied unless a granted category maps it', () => {
    const payload = consentModePayload({ analytics: true, marketing: false }, { analytics: 'analytics_storage', marketing: ['ad_storage'] })
    expect(Object.keys(payload).sort()).toEqual([...CONSENT_MODE_TYPES].sort())
    expect(payload.analytics_storage).toBe('granted')
    expect(payload.ad_storage).toBe('denied')
    expect(payload.security_storage, 'mapped by nothing').toBe('denied')
  })

  it('a type mapped by several categories needs all of them', () => {
    const mapping = { analytics: 'analytics_storage', stats: 'analytics_storage' } as const
    expect(consentModePayload({ analytics: true, stats: false }, mapping).analytics_storage).toBe('denied')
    expect(consentModePayload({ analytics: true, stats: true }, mapping).analytics_storage).toBe('granted')
  })
})

describe('consentModeDefaultScript', () => {
  it('runs: pushes the default command once into the dataLayer', () => {
    const w: any = {}
    const script = consentModeDefaultScript(consentModePayload({}, {}), 300)
    new Function('window', 'dataLayer', `with (window) { ${script} }`)(w, undefined)
    new Function('window', `with (window) { ${script} }`)(w)
    expect(w.dataLayer).toHaveLength(1)
    expect(Array.from(w.dataLayer[0])).toEqual(['consent', 'default', expect.objectContaining({ ad_storage: 'denied', wait_for_update: 300 })])
  })
})
