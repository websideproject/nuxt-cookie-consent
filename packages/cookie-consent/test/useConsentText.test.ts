import { describe, it, expect, beforeEach, vi } from 'vitest'

// useConsentText is Nuxt-coupled (reads texts/locale via #imports) — stub #imports so the link-parsing
// logic (placeholder replacement → string/link tokenization, locale + linkMap fallbacks) can be tested.
const state = vi.hoisted(() => ({ locale: 'en' }))
vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({ public: { cookieConsent: {
    fallbackLocale: 'en',
    linkMap: { terms: '/terms-global' },
    texts: {
      en: {
        banner: { message: 'We use cookies. See {privacy}.', plain: 'Just text.', greeting: 'Hi {name}, see {privacy}.', global: 'Read the {terms}.' },
        links: { privacy: 'Privacy Policy' },
        linkMap: { privacy: '/privacy' },
      },
      de: { banner: {} }, // no message → falls back to en
    },
  } } }),
  useNuxtApp: () => ({ $consent: { currentLocale: { value: state.locale } } }),
}))

import { useConsentText } from '../src/runtime/composables/useConsentText'

describe('useConsentText', () => {
  beforeEach(() => { state.locale = 'en' })

  it('returns a single string part for text with no placeholders', () => {
    expect(useConsentText('banner.plain')).toEqual([{ type: 'string', content: 'Just text.' }])
  })

  it('tokenizes a link placeholder into string + link + string parts', () => {
    const parts = useConsentText('banner.message')
    expect(parts).toEqual([
      { type: 'string', content: 'We use cookies. See ' },
      { type: 'link', content: 'Privacy Policy', key: 'privacy', href: '/privacy' },
      { type: 'string', content: '.' },
    ])
  })

  it('applies {placeholder} replacements BEFORE link parsing', () => {
    const parts = useConsentText('banner.greeting', { name: 'Bob' })
    expect(parts[0]).toEqual({ type: 'string', content: 'Hi Bob, see ' })
    expect(parts.find(p => p.type === 'link')).toMatchObject({ key: 'privacy', content: 'Privacy Policy' })
  })

  it('falls back to the fallback locale when the key is missing in the current locale', () => {
    state.locale = 'de' // de.banner.message is missing → use en
    const parts = useConsentText('banner.message')
    expect(parts.find(p => p.type === 'link'), 'link text falls back to en').toMatchObject({ content: 'Privacy Policy' })
    // de has no per-locale linkMap → href resolves from the GLOBAL linkMap (none for privacy) → '#'
    expect(parts.find(p => p.type === 'link')!.href).toBe('#')
  })

  it('resolves a link href from the global linkMap when no per-locale entry exists', () => {
    const parts = useConsentText('banner.global') // uses {terms}, only in global linkMap
    const link = parts.find(p => p.type === 'link')!
    expect(link).toMatchObject({ key: 'terms', href: '/terms-global' })
    expect(link.content, 'no link text configured → falls back to the key').toBe('terms')
  })

  it('returns the key itself when it resolves to nothing', () => {
    expect(useConsentText('does.not.exist')).toEqual([{ type: 'string', content: 'does.not.exist' }])
  })
})
