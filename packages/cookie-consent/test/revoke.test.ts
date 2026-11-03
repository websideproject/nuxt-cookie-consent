import { describe, it, expect } from 'vitest'

import { deleteCookies } from '../src/runtime/revoke'

function fakeDocument(cookie: string) {
  const writes: string[] = []
  return { writes, doc: { get cookie() { return cookie }, set cookie(value: string) { writes.push(value) } } }
}

describe('deleteCookies', () => {
  it('expires exact and prefix matches with no domain and every parent domain', () => {
    const { doc, writes } = fakeDocument('_ga=GA1; _ga_ABC=GS1; theme=dark')
    expect(deleteCookies(['_ga', '_ga_*'], doc, 'www.example.com')).toEqual(['_ga', '_ga_ABC'])
    expect(writes).toEqual([
      '_ga=; Max-Age=0; path=/',
      '_ga=; Max-Age=0; path=/; domain=www.example.com',
      '_ga=; Max-Age=0; path=/; domain=example.com',
      '_ga_ABC=; Max-Age=0; path=/',
      '_ga_ABC=; Max-Age=0; path=/; domain=www.example.com',
      '_ga_ABC=; Max-Age=0; path=/; domain=example.com',
    ])
  })

  it('takes no domain attribute on localhost or an IP address', () => {
    for (const host of ['localhost', '127.0.0.1']) {
      const { doc, writes } = fakeDocument('_ga=GA1')
      deleteCookies(['_ga'], doc, host)
      expect(writes).toEqual(['_ga=; Max-Age=0; path=/'])
    }
  })

  it('leaves cookies that match nothing', () => {
    const { doc, writes } = fakeDocument('theme=dark')
    expect(deleteCookies(['_ga'], doc, 'example.com')).toEqual([])
    expect(writes).toEqual([])
  })
})
