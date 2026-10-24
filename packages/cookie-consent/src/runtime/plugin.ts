import { defineNuxtPlugin, useCookie, useHead, useRuntimeConfig, useState, watch } from '#imports'
import type { CategoryOptions, ConsentAction, ConsentCategory, ConsentMeta, ConsentRuntimeOptions } from './types'
import { defaultConsentState, uniformConsentState } from './default-state'
import { consentModeDefaultScript, consentModePayload, pushConsentModeDefault, pushConsentModeUpdate } from './consent-mode'
import { deleteCookies } from './revoke'

const DAY_MS = 24 * 60 * 60 * 1000

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.cookieConsent
  const options = config as unknown as ConsentRuntimeOptions
  const categories = config.categories as unknown as Record<string, CategoryOptions>
  const requiredCategories = Object.keys(config.categories) as ConsentCategory[]
  // P12.M4 — configurable cookie name (default 'cookie_consent').
  const cookieName = options.cookieName || 'cookie_consent'
  const consentVersion = options.consentVersion ?? null
  const expiresInDays = options.expiresInDays ?? 365
  const reloadOnRevoke = options.reloadOnRevoke ?? true
  const consentMode = options.googleConsentMode || undefined
  const waitForUpdate = consentMode?.waitForUpdate ?? 500

  // A fresh default state for the current config (opt-out tracking on, everything else off — see default-state.ts).
  const createDefaultState = (): Record<string, boolean> => defaultConsentState(categories)

  const cookieOptions = { maxAge: expiresInDays * DAY_MS / 1000, sameSite: 'lax' as const, path: '/' }
  const consentCookie = useCookie<Record<string, boolean> | undefined>(cookieName, cookieOptions)
  // The version consented to and when, beside the choice itself (so the choice cookie keeps its shape).
  const metaCookie = useCookie<ConsentMeta | undefined>(`${cookieName}_meta`, cookieOptions)

  // --- INITIALIZATION WITH SHAPE VALIDATION ---
  // A choice made under another `consentVersion`, or longer ago than `expiresInDays`, no longer counts: the visitor
  // starts from the defaults and is asked again. A cookie without a timestamp (written before there was one) expires
  // with the cookie itself.
  const meta = metaCookie.value
  const isOutdated = consentVersion !== null && meta?.version !== consentVersion
  const isExpired = typeof meta?.at === 'number' && Date.now() - meta.at > expiresInDays * DAY_MS
  const rawCookie = isOutdated || isExpired ? undefined : consentCookie.value

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
  const initialConsentedAt = isConsentComplete && typeof meta?.at === 'number' ? meta.at : null

  // `hasMadeChoice` is correctly determined by the validation logic.
  const hasMadeChoice = useState<boolean>('cookie-consent-choice-made', () => isConsentComplete)
  const consentState = useState<Record<string, boolean>>('cookie-consent-state', () => initialState)
  const consentedAt = useState<number | null>('cookie-consent-at', () => initialConsentedAt)
  const currentLocale = useState<string>('cookie-consent-locale', () => config.locale)

  // A prerendered or cached page carries the state it was rendered with — the defaults, since there was no
  // visitor cookie — and useState hydrates from that payload instead of running the initializers above. In
  // the browser the visitor's cookie is the source of truth, so re-apply it before anything reads the state.
  // (On the server this is the value the initializers just set from the same cookie.)
  hasMadeChoice.value = isConsentComplete
  consentState.value = initialState
  consentedAt.value = initialConsentedAt

  // Watch for changes in our main state and persist them to the cookie.
  watch(consentState, (newValue) => {
    consentCookie.value = newValue
  }, { deep: true })

  // Google Consent Mode: the `default` command goes in the head so it runs before any Google tag, then the browser
  // sends an `update` for the restored choice and for every commit.
  if (consentMode) {
    const defaults = consentModePayload(createDefaultState(), consentMode.mapping)
    useHead({
      script: [{ key: 'cookie-consent-mode', innerHTML: consentModeDefaultScript(defaults, waitForUpdate), tagPriority: 'critical' }],
    })
    if (import.meta.client) {
      pushConsentModeDefault(defaults, waitForUpdate)
      pushConsentModeUpdate(consentModePayload(consentState.value, consentMode.mapping))
    }
  }

  // Each category's Nuxt Scripts trigger: a promise resolved the first time the category is granted.
  const resolveFunctions: Record<string, () => void> = {}
  const triggers: Record<string, Promise<void>> = {}
  for (const category of requiredCategories) {
    triggers[category] = new Promise<void>((resolve) => {
      resolveFunctions[category] = resolve
    })
  }
  // Categories granted at some point on this page: their scripts may be running, so withdrawing one reloads.
  const activated = new Set<string>()

  watch(consentState, (newState) => {
    for (const category of requiredCategories) {
      if (newState[category] === true) {
        activated.add(category)
        resolveFunctions[category]?.()
      }
    }
  }, { deep: true, immediate: true }) // `immediate: true` handles returning visitors.

  const isModalOpen = useState('cookie-consent-modal-open', () => false)
  const requestContext = useState<ConsentCategory | null>('cookie-consent-request-context', () => null)

  // Every commit goes through here: save the choice, then (in the browser) tell Consent Mode and the hooks, and
  // carry out a withdrawal — delete the category's cookies and reload when something it started may still run.
  async function commit(newState: Record<string, boolean>, action: ConsentAction) {
    const previous = { ...consentState.value }
    const state: Record<string, boolean> = { ...newState, necessary: true }
    for (const [key, cat] of Object.entries(categories)) {
      if (cat?.readonly) state[key] = true
    }

    consentState.value = state
    hasMadeChoice.value = true
    consentedAt.value = Date.now()
    consentCookie.value = state
    metaCookie.value = { version: consentVersion, at: consentedAt.value }

    if (import.meta.server) return
    const granted = Object.keys(state).filter(key => state[key] === true && previous[key] !== true)
    const revoked = Object.keys(previous).filter(key => previous[key] === true && state[key] !== true)
    if (consentMode) pushConsentModeUpdate(consentModePayload(state, consentMode.mapping))

    try {
      await nuxtApp.callHook('consent:changed', { state, previous, granted, revoked, action })
      for (const category of granted) await nuxtApp.callHook('consent:granted', category)
      for (const category of revoked) await nuxtApp.callHook('consent:revoked', category)
    }
    finally {
      if (revoked.length) {
        deleteCookies(revoked.flatMap(key => categories[key]?.cookies?.map(cookie => cookie.id) ?? []))
        if (revoked.some(key => activated.has(key) && (categories[key]?.reloadOnRevoke ?? reloadOnRevoke)))
          window.location.reload()
      }
    }
  }

  // Provide all state and helpers to the Nuxt app instance.
  nuxtApp.provide('consent', {
    state: consentState,
    hasMadeChoice,
    isModalOpen,
    triggers,
    requestContext,
    currentLocale,
    consentedAt,
    consentVersion,
    setLocale: (newLocale: string) => { currentLocale.value = newLocale },
    setRequestContext: (context: ConsentCategory | null) => { requestContext.value = context },
    acceptAll: () => commit(uniformConsentState(categories, true), 'acceptAll'),
    rejectAll: () => commit(uniformConsentState(categories, false), 'rejectAll'),
    updateState: (newState: Record<ConsentCategory, boolean>) => commit(newState, 'save'),
  })
})
