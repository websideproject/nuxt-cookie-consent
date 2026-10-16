import { describe, it, expect } from 'vitest'
import { localize } from '../src/runtime/localize'

// A cookie's provider/duration and a category's description: one string, or one per locale.
describe('localize', () => {
  it('returns a plain string in every locale', () => {
    expect(localize('Google LLC', 'de', 'en')).toBe('Google LLC')
  })

  it('picks the active locale, else the fallback locale, else the first value', () => {
    const duration = { en: '1 year', de: '1 Jahr' }
    expect(localize(duration, 'de', 'en')).toBe('1 Jahr')
    expect(localize(duration, 'fr', 'en')).toBe('1 year')
    expect(localize({ de: '1 Jahr' }, 'fr', 'en')).toBe('1 Jahr')
  })

  it('is empty for a missing value, so a caller can fall back to its text key', () => {
    expect(localize(undefined, 'en', 'en')).toBe('')
    expect(localize({}, 'en', 'en')).toBe('')
  })
})
