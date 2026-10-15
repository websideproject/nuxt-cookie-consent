import { describe, expect, it } from 'vitest'
import { defaultTexts } from '../src/runtime/texts'

describe('default texts', () => {
  it('every built-in locale labels the {privacy} and {imprint} links', () => {
    for (const [locale, texts] of Object.entries(defaultTexts))
      expect(Object.keys(texts.links).sort(), locale).toEqual(['imprint', 'privacy'])
  })
})
