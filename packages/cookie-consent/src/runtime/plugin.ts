import { defineNuxtPlugin, useCookie, useRuntimeConfig, useState, watch } from '#imports'
import type { CategoryOptions, ConsentCategory } from './types'
import { defaultConsentState } from './default-state'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.cookieConsent
  const requiredCategories = Object.keys(config.categories) as ConsentCategory[]
  // P12.M4 — configurable cookie name (default 'cookie_consent').
  const cookieName = (config as { cookieName?: string }).cookieName || 'cookie_consent'

  // A fresh default state for the current config (opt-out tracking on, everything else off — see default-state.ts).
  const createDefaultState = (): Record<string, boolean> =>
    defaultConsentState(config.categories as unknown as Record<string, CategoryOptions>)

  // --- INITIALIZATION WITH SHAPE VALIDATION ---
  const rawCookie = useCookie<Record<string, boolean> | undefined>(cookieName).value

  let isConsentComplete = false
  let initialState = createDefaultState()

  if (rawCookie && typeof rawCookie === 'object' && Object.keys(rawCookie).length > 0) {
    const storedCategories = Object.keys(rawCookie)

    // VALIDATION: Does the cookie contain all required categories from the config?
    const hasAllRequiredKeys = requiredCategories.every(key => storedCategories.includes(key))
    // VALIDATION: Does the cookie have the same number of keys as the config?
    const hasSameNumberOfKeys = requiredCategories.length === storedCategories.length

    if (hasAllRequiredKeys && hasSameNumberOfKeys) {
      // The cookie is valid and complete for the current configuration.
      isConsentComplete = true
      initialState = rawCookie
    }
    else {
      // The cookie is STALE (incomplete). The user must make a new choice.
      isConsentComplete = false
      // We merge their old choices into the new state.
      const mergedState = createDefaultState()
      Object.keys(rawCookie).forEach((key) => {
        if (key in mergedState) {
          mergedState[key] = rawCookie[key] === true
        }
      })
      initialState = mergedState
    }
  }

  // `hasMadeChoice` is correctly determined by the validation logic.
  const hasMadeChoice = useState<boolean>('cookie-consent-choice-made', () => isConsentComplete)
  const consentState = useState<Record<string, boolean>>('cookie-consent-state', () => initialState)
  const currentLocale = useState<string>('cookie-consent-locale', () => config.locale)

  // A prerendered or cached page carries the state it was rendered with — the defaults, since there was no
  // visitor cookie — and useState hydrates from that payload instead of running the initializers above. In
  // the browser the visitor's cookie is the source of truth, so re-apply it before anything reads the state.
  // (On the server this is the value the initializers just set from the same cookie.)
  hasMadeChoice.value = isConsentComplete
  consentState.value = initialState

  const consentCookie = useCookie<Record<string, boolean>>(cookieName, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
  })

  // Watch for changes in our main state and persist them to the cookie.
  watch(consentState, (newValue) => {
    consentCookie.value = newValue
  }, { deep: true })

  // Create script triggers for each category.
  // const triggers: Record<string, ReturnType<typeof useScriptTriggerConsent>> = {}
  // for (const category of requiredCategories) {
  //   triggers[category] = useScriptTriggerConsent({
  //     consent: computed(() => consentState.value[category] === true)
  //   })
  // }

  // 1. Create script triggers for each category WITHOUT arguments.
  // They are now in a "pending" state, waiting for an explicit `.accept()` call.
  // const triggers: Record<string, ReturnType<typeof useScriptTriggerConsent>> = {}
  // for (const category of requiredCategories) {
  //   triggers[category] = useScriptTriggerConsent()
  // }
  //
  // // 2. Watch the global consent state for changes.
  // watch(consentState, (newState, oldState) => {
  //   // 3. When the state changes, iterate through the categories and explicitly accept the triggers.
  //   for (const category of requiredCategories) {
  //     // If the consent for this category has just changed from false to true...
  //     if (newState[category] === true && oldState?.[category] === false) {
  //       // ...manually call .accept() to resolve the trigger's promise.
  //       triggers[category].accept()
  //       console.log(`[nuxt-cookie-consent] Trigger accepted for category: ${category}`)
  //     }
  //   }
  // }, { deep: true, immediate: true }) // `immediate: true` handles the initial page load for users who already have consent.

  const resolveFunctions: Record<string, () => void> = {}

  // 2. Create the triggers. Each trigger is now a simple Promise.
  const triggers: Record<string, Promise<void>> = {}
  for (const category of requiredCategories) {
    triggers[category] = new Promise<void>((resolve) => {
      // Store the resolve function so we can call it later.
      resolveFunctions[category] = resolve
    })
  }

  // 3. Watch the global consent state.
  watch(consentState, (newState) => {
    // 4. When the state changes, check each category.
    for (const category of requiredCategories) {
      // If consent for this category is granted...
      if (newState[category] === true) {
        // ...and its resolve function exists...
        if (resolveFunctions[category]) {
          // ...call the resolve function to fulfill the promise.
          resolveFunctions[category]()
        }
      }
    }
  }, { deep: true, immediate: true }) // `immediate: true` handles returning visitors.

  const isModalOpen = useState('cookie-consent-modal-open', () => false)
  const requestContext = useState<ConsentCategory | null>('cookie-consent-request-context', () => null)

  // Provide all state and helpers to the Nuxt app instance.
  nuxtApp.provide('consent', {
    state: consentState,
    hasMadeChoice,
    isModalOpen,
    triggers,
    requestContext,
    currentLocale,
    setLocale: (newLocale: string) => { currentLocale.value = newLocale },
    setRequestContext: (context: ConsentCategory | null) => { requestContext.value = context },
    updateState: (newState: Record<ConsentCategory, boolean>) => {
      consentState.value = { ...newState, necessary: true }
      hasMadeChoice.value = true
    },
  })
})
