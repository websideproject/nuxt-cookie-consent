import { useNuxtApp, useRuntimeConfig } from '#imports'
import { localize } from '../localize'
import type { LocalizedString } from '../types'

/**
 * Resolve a config value that may be translated (a cookie's `provider`/`duration`, a category's `description`) in
 * the active locale — `'1 year'` stays as it is, `{ en: '1 year', de: '1 Jahr' }` follows `$consent.setLocale()`.
 */
export function useConsentLocalized(value: LocalizedString | undefined): string {
  const { $consent } = useNuxtApp()
  return localize(value, $consent.currentLocale.value, useRuntimeConfig().public.cookieConsent.fallbackLocale)
}
