import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

// L3 — the settings modal (pure-CSS, no Nuxt UI). The decision logic lives in useConsentModal (tested
// in consent-composables); here we verify the COMPONENT wiring: open gate, one row per category, and
// the footer actions calling saveSelection / acceptAll.
const m = vi.hoisted(() => ({ modal: null as any }))
vi.mock('../src/runtime/composables/useConsentModal', () => ({ useConsentModal: () => m.modal }))
vi.mock('../src/runtime/composables/useConsentText', () => ({ useConsentText: () => [{ type: 'string', content: 'x' }] }))

import CookieConsentModal from '../src/runtime/components/CookieConsentModal.vue'

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

  it('clicking the overlay backdrop closes the modal', async () => {
    const w = mount(CookieConsentModal, { global: { stubs: { teleport: true } } })
    await w.find('.cc-overlay').trigger('click')
    expect(m.modal.closeModal).toHaveBeenCalled()
  })
})
