import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

import CookieConsentFab from '../src/runtime/components/CookieConsentFab.vue'

// L3 — render the actual SFC. The composable (decision logic) is mocked so this verifies the COMPONENT
// wiring: v-if on isVisible, and the click → openModal binding. `#imports` only supplies `computed`.
const h = vi.hoisted(() => ({ fab: null as any }))
// `#imports` (→ computed) comes from the alias stub in vitest.config; just mock the composable.
vi.mock('../src/runtime/composables/useConsentFab', () => ({ useConsentFab: () => h.fab }))

describe('<CookieConsentFab>', () => {
  beforeEach(() => { h.fab = { isVisible: ref(true), openModal: vi.fn(), colors: {} } })

  it('renders the settings button when visible', () => {
    const w = mount(CookieConsentFab)
    expect(w.find('.cc-fab').exists()).toBe(true)
    const btn = w.find('button.cc-fab__btn')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-label')).toBe('Manage cookie settings')
  })

  it('renders nothing when not visible', () => {
    h.fab = { isVisible: ref(false), openModal: vi.fn(), colors: {} }
    const w = mount(CookieConsentFab)
    expect(w.find('.cc-fab').exists()).toBe(false)
  })

  it('clicking the button opens the settings modal (openModal)', async () => {
    const w = mount(CookieConsentFab)
    await w.find('button.cc-fab__btn').trigger('click')
    expect(h.fab.openModal).toHaveBeenCalledTimes(1)
  })

  it('applies the configured colors as CSS custom properties', () => {
    h.fab = { isVisible: ref(true), openModal: vi.fn(), colors: { secondary: 'rebeccapurple' } }
    const w = mount(CookieConsentFab)
    const style = w.find('.cc-fab').attributes('style')
    expect(style).toContain('--cc-secondary-light: rebeccapurple')
    // no darkColors: dark mode keeps the same colour
    expect(style).toContain('--cc-secondary-dark: rebeccapurple')
  })
})
