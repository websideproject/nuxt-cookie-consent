import { describe, it, expect, vi } from 'vitest'

import { useConsentBanner } from '../src/runtime/composables/useConsentBanner'
import { useConsentFab } from '../src/runtime/composables/useConsentFab'
import { useConsentModal } from '../src/runtime/composables/useConsentModal'

// The consent composables hold the GDPR decision logic (banner/fab visibility = the requiresInitialConsent
// matrix; accept-all / save-selection commit choices). They're Nuxt-coupled via #imports — stub it with
// minimal reactivity fakes (`.value` get/set + lazy computed; the composables use nothing else) and a
// fake $consent/config, then assert the decisions + the committed state. No real Vue needed.
const r = <T>(value: T) => ({ value })
const env = vi.hoisted(() => ({ consent: null as any, config: null as any }))
vi.mock('#imports', () => ({
  ref: (v: any) => ({ value: v }),
  computed: (getter: any) => ({ get value() { return getter() } }),
  watch: () => {},
  useNuxtApp: () => ({ $consent: env.consent }),
  useRuntimeConfig: () => ({ public: { cookieConsent: env.config } }),
}))

function setup(opts: { requiresInitialConsent?: boolean, hasMadeChoice?: boolean, state?: Record<string, boolean>, categories?: Record<string, any> } = {}) {
  const updateState = vi.fn()
  const acceptAll = vi.fn()
  const rejectAll = vi.fn()
  env.consent = {
    hasMadeChoice: r(opts.hasMadeChoice ?? false),
    state: r(opts.state ?? { necessary: true, analytics: false }),
    isModalOpen: r(false),
    requestContext: r(null),
    currentLocale: r('en'),
    updateState,
    acceptAll,
    rejectAll,
  }
  env.config = {
    requiresInitialConsent: opts.requiresInitialConsent ?? true,
    categories: opts.categories ?? { necessary: {}, analytics: {} },
    colors: {}, fallbackLocale: 'en', texts: { en: {} }, linkMap: {},
  }
  return { updateState, acceptAll, rejectAll, consent: env.consent }
}

describe('useConsentBanner', () => {
  it('isVisible: shown only when consent is required AND no choice has been made', () => {
    setup({ requiresInitialConsent: true, hasMadeChoice: false })
    expect(useConsentBanner().isVisible.value).toBe(true)
    setup({ requiresInitialConsent: true, hasMadeChoice: true })
    expect(useConsentBanner().isVisible.value, 'choice already made → hidden').toBe(false)
    setup({ requiresInitialConsent: false, hasMadeChoice: false })
    expect(useConsentBanner().isVisible.value, 'consent not required → hidden').toBe(false)
  })

  it('acceptAll and rejectAll commit through $consent', () => {
    const { acceptAll, rejectAll } = setup()
    useConsentBanner().acceptAll()
    expect(acceptAll).toHaveBeenCalledTimes(1)
    useConsentBanner().rejectAll()
    expect(rejectAll).toHaveBeenCalledTimes(1)
  })

  it('customize opens the settings modal', () => {
    const { consent } = setup()
    useConsentBanner().customize()
    expect(consent.isModalOpen.value).toBe(true)
  })
})

describe('useConsentFab', () => {
  it('isVisible: shown after a choice is made, OR when consent is not required', () => {
    setup({ hasMadeChoice: true, requiresInitialConsent: true })
    expect(useConsentFab().isVisible.value).toBe(true)
    setup({ hasMadeChoice: false, requiresInitialConsent: false })
    expect(useConsentFab().isVisible.value).toBe(true)
    setup({ hasMadeChoice: false, requiresInitialConsent: true })
    expect(useConsentFab().isVisible.value, 'awaiting the initial banner → fab hidden').toBe(false)
  })

  it('openModal opens the settings modal', () => {
    const { consent } = setup()
    useConsentFab().openModal()
    expect(consent.isModalOpen.value).toBe(true)
  })
})

describe('useConsentModal', () => {
  it('acceptAll commits through $consent and closes the modal', () => {
    const { acceptAll, consent } = setup()
    consent.isModalOpen.value = true
    useConsentModal().acceptAll()
    expect(acceptAll).toHaveBeenCalledTimes(1)
    expect(consent.isModalOpen.value, 'closes after accept').toBe(false)
  })

  it('rejectAll commits through $consent and closes the modal', () => {
    const { rejectAll, consent } = setup()
    consent.isModalOpen.value = true
    useConsentModal().rejectAll()
    expect(rejectAll).toHaveBeenCalledTimes(1)
    expect(consent.isModalOpen.value, 'closes after reject').toBe(false)
  })

  it('saveSelection commits the per-category local choices', () => {
    const { updateState, consent } = setup()
    const modal = useConsentModal()
    // `analytics` is not in the module's default categories, which is what ConsentCategory resolves to here.
    modal.localConsentState.value = { necessary: true, analytics: true } as any
    modal.saveSelection()
    expect(updateState).toHaveBeenCalledWith({ necessary: true, analytics: true })
    expect(consent.isModalOpen.value).toBe(false)
  })

  it('toggleAccordion adds then removes a category key', () => {
    setup()
    const modal = useConsentModal()
    expect(modal.openAccordions.value).toEqual(['necessary'])
    modal.toggleAccordion('analytics')
    expect(modal.openAccordions.value).toContain('analytics')
    modal.toggleAccordion('analytics')
    expect(modal.openAccordions.value).not.toContain('analytics')
  })
})
