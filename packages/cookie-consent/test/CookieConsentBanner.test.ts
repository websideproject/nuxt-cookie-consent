import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

import CookieConsentBanner from '../src/runtime/components/CookieConsentBanner.vue'

const h = vi.hoisted(() => ({ banner: null as any }))
vi.mock('../src/runtime/composables/useConsentBanner', () => ({ useConsentBanner: () => h.banner }))
vi.mock('../src/runtime/composables/useConsentText', () => ({ useConsentText: () => [{ type: 'string', content: 'We use cookies.' }] }))

// L3 — the initial consent banner: renders when required, and its two actions wire to customize/acceptAll.
describe('<CookieConsentBanner>', () => {
  beforeEach(() => { h.banner = { isVisible: ref(true), acceptAll: vi.fn(), customize: vi.fn(), colors: {} } })

  it('renders the banner with its text + both actions when visible', () => {
    const w = mount(CookieConsentBanner)
    expect(w.find('.cc-banner').exists()).toBe(true)
    expect(w.text()).toContain('We use cookies.')
    expect(w.findAll('button.cc-btn').length).toBe(2)
  })

  it('carries the light and the dark colours, so a .dark ancestor can switch between them', () => {
    h.banner = { ...h.banner, colors: { background: 'white' }, darkColors: { background: 'black' } }
    const style = mount(CookieConsentBanner).find('.cc-banner').attributes('style')
    expect(style).toContain('--cc-bg-light: white')
    expect(style).toContain('--cc-bg-dark: black')
  })

  it('is hidden when not visible', () => {
    h.banner = { isVisible: ref(false), acceptAll: vi.fn(), customize: vi.fn(), colors: {} }
    expect(mount(CookieConsentBanner).find('.cc-banner').exists()).toBe(false)
  })

  it('the outline action opens customize, the other accepts all', async () => {
    const w = mount(CookieConsentBanner)
    await w.find('button.cc-btn--outline').trigger('click')
    expect(h.banner.customize).toHaveBeenCalledTimes(1)
    expect(h.banner.acceptAll).not.toHaveBeenCalled()

    // the non-outline action button
    const accept = w.findAll('button.cc-btn').find(b => !b.classes().includes('cc-btn--outline'))!
    await accept.trigger('click')
    expect(h.banner.acceptAll).toHaveBeenCalledTimes(1)
  })
})
