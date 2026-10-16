import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

import CookieConsentModal from '../src/runtime/components/CookieConsentModal.vue'

// L3 — the settings modal (pure-CSS, no Nuxt UI). The decision logic lives in useConsentModal (tested
// in consent-composables); here we verify the COMPONENT wiring: open gate, one row per category, and
// the footer actions calling saveSelection / acceptAll.
const m = vi.hoisted(() => ({ modal: null as any }))
vi.mock('../src/runtime/composables/useConsentModal', () => ({ useConsentModal: () => m.modal }))
vi.mock('../src/runtime/composables/useConsentText', () => ({ useConsentText: () => [{ type: 'string', content: 'x' }] }))
// The visitor reads German; the fallback locale is English
vi.mock('../src/runtime/composables/useConsentLocalized', async () => {
  const { localize } = await import('../src/runtime/localize')
  return { useConsentLocalized: (v: any) => localize(v, 'de', 'en') }
})

describe('<CookieConsentModal>', () => {
  beforeEach(() => {
    m.modal = {
      isOpen: ref(true),
      categories: ref([['necessary', { description: 'Required' }], ['analytics', { description: 'Stats' }]]),
      localConsentState: ref({ necessary: true, analytics: false }),
      openAccordions: ref(['necessary']),
      contextualMessage: ref([]),
      colors: {},
      acceptAll: vi.fn(),
      saveSelection: vi.fn(),
      closeModal: vi.fn(),
      toggleAccordion: vi.fn(),
    }
  })

  it('does not render when closed', () => {
    m.modal.isOpen = ref(false)
    expect(mount(CookieConsentModal, { global: { stubs: { teleport: true } } }).find('.cc-dialog').exists()).toBe(false)
  })

  it('renders a dialog with one row per configured category when open', () => {
    const w = mount(CookieConsentModal, { global: { stubs: { teleport: true } } })
    expect(w.find('.cc-dialog').exists()).toBe(true)
    expect(w.findAll('.cc-cat').length).toBe(2)
  })

  it('the primary action accepts all; the outline action saves the selection', async () => {
    const w = mount(CookieConsentModal, { global: { stubs: { teleport: true } } })
    await w.find('.cc-btn--primary').trigger('click')
    expect(m.modal.acceptAll).toHaveBeenCalledTimes(1)
    await w.find('.cc-btn--outline').trigger('click')
    expect(m.modal.saveSelection).toHaveBeenCalledTimes(1)
  })

  it('shows a cookie\'s provider and duration, and a category\'s description, in the active locale', () => {
    m.modal.categories = ref([
      ['analytics', { cookies: [{ id: '_ga', descriptionKey: 'k', provider: 'Google LLC', duration: { en: '2 years', de: '2 Jahre' } }] }],
      ['statistics', { kind: 'tracking', description: { en: 'Cookieless statistics', de: 'Cookielose Statistik' } }],
    ])
    const w = mount(CookieConsentModal, { global: { stubs: { teleport: true } } })
    expect(w.find('.cc-table tbody').text()).toContain('Google LLC')
    expect(w.find('.cc-table tbody').text()).toContain('2 Jahre')
    expect(w.text()).toContain('Cookielose Statistik')
    expect(w.text()).not.toContain('2 years')
  })

  it('clicking the overlay backdrop closes the modal', async () => {
    const w = mount(CookieConsentModal, { global: { stubs: { teleport: true } } })
    await w.find('.cc-overlay').trigger('click')
    expect(m.modal.closeModal).toHaveBeenCalled()
  })
})
