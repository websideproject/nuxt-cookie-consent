import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

import CookieConsentBanner from '../src/runtime/components/CookieConsentBanner.vue'

const h = vi.hoisted(() => ({ banner: null as any }))
vi.mock('../src/runtime/composables/useConsentBanner', () => ({ useConsentBanner: () => h.banner }))
vi.mock('../src/runtime/composables/useConsentText', () => ({ useConsentText: () => [{ type: 'string', content: 'We use cookies.' }] }))

// L3 — the initial consent banner: renders when required, and its actions wire to customize/rejectAll/acceptAll.
describe('<CookieConsentBanner>', () => {
  beforeEach(() => { h.banner = { isVisible: ref(true), acceptAll: vi.fn(), rejectAll: vi.fn(), customize: vi.fn(), colors: {} } })

  it('renders the banner with its text + all three actions when visible', () => {
    const w = mount(CookieConsentBanner)
    expect(w.find('.cc-banner').exists()).toBe(true)
    expect(w.text()).toContain('We use cookies.')
    expect(w.findAll('button.cc-btn').length).toBe(3)
  })

  it('carries the light and the dark colours, so a .dark ancestor can switch between them', () => {
    h.banner = { ...h.banner, colors: { background: 'white' }, darkColors: { background: 'black' } }
    const style = mount(CookieConsentBanner).find('.cc-banner').attributes('style')
    expect(style).toContain('--cc-bg-light: white')
    expect(style).toContain('--cc-bg-dark: black')
  })

  it('is hidden when not visible', () => {
    h.banner = { isVisible: ref(false), acceptAll: vi.fn(), rejectAll: vi.fn(), customize: vi.fn(), colors: {} }
    expect(mount(CookieConsentBanner).find('.cc-banner').exists()).toBe(false)
  })

  it('the outline action opens customize; reject and accept commit', async () => {
    const w = mount(CookieConsentBanner)
    await w.find('button.cc-btn--outline').trigger('click')
    expect(h.banner.customize).toHaveBeenCalledTimes(1)
    expect(h.banner.acceptAll).not.toHaveBeenCalled()

    await w.find('button.cc-btn--reject').trigger('click')
    expect(h.banner.rejectAll).toHaveBeenCalledTimes(1)
    await w.find('button.cc-btn--accept').trigger('click')
    expect(h.banner.acceptAll).toHaveBeenCalledTimes(1)
  })

  it('offers reject as prominently as accept', () => {
    const w = mount(CookieConsentBanner)
    expect(w.find('button.cc-btn--reject').classes()).toContain('cc-btn--primary')
    expect(w.find('button.cc-btn--accept').classes()).toContain('cc-btn--primary')
  })
})
