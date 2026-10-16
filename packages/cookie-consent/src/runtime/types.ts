import type { Ref } from 'vue'
import type { NuxtApp } from '#app'

// Export main config type
export type CookieConsentConfig = NuxtApp['$config']['public']['cookieConsent']
export type ConsentCategory = keyof CookieConsentConfig['categories']

// Type definitions for module options
export interface ColorOptions {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  border: string
  borderInput: string
}

/** One string for every locale, or one per locale (`{ en: '1 year', de: '1 Jahr' }`). See `useConsentLocalized`. */
export type LocalizedString = string | Record<string, string>

export interface CookieDefinition {
  id: string
  descriptionKey: string
  provider: LocalizedString
  duration: LocalizedString
  requiresBanner?: boolean
}

export interface CategoryOptions {
  readonly?: boolean
  /**
   * What this category represents (P12.M8):
   * - `'cookie'` (default) — backed by real device storage; the modal renders a provider/duration table.
   * - `'tracking'` — a non-cookie toggle (e.g. cookieless analytics); the modal renders a labeled
   *   on/off switch + description, NO cookie table, and `cookies[]` is not required.
   */
  kind?: 'cookie' | 'tracking'
  /**
   * Description shown in the modal (esp. for `'tracking'` items), one string or one per locale. Falls back to the
   * `categories.<key>.description` text.
   */
  description?: LocalizedString
  /**
   * Whether this category forces the initial consent banner. Overrides the per-cookie heuristic when
   * set. For `'tracking'` categories the banner is shown ONLY when this is `true` (default: opt-out, no
   * banner) — so a cookieless analytics category no longer wrongly forces a banner.
   */
  requiresBanner?: boolean
  /**
   * The state before the visitor has chosen. Default: `true` for a `'tracking'` category without a banner
   * (opt-out), `false` for everything else. Set `false` on a tracking category to make it opt-in without a
   * banner (e.g. session replays: off until switched on from the floating button / settings).
   */
  defaultEnabled?: boolean
  cookies?: CookieDefinition[]
}

// Define the shape of the plugin we are providing
interface ConsentPlugin {
  state: Ref<Record<ConsentCategory, boolean>>
  hasMadeChoice: Ref<boolean>
  isModalOpen: Ref<boolean>
  requestContext: Ref<ConsentCategory | null>
  // Each category exposes a Nuxt Scripts consent trigger (a promise resolved on consent).
  triggers: Record<string, Promise<void>>
  currentLocale: Ref<string>
  setLocale: (newLocale: string) => void
  setRequestContext: (context: ConsentCategory | null) => void
  updateState: (newState: Record<ConsentCategory, boolean>) => void
}

declare module '#app' {
  interface NuxtApp {
    $consent: ConsentPlugin
  }
}
declare module 'vue' {
  interface ComponentCustomProperties {
    $consent: ConsentPlugin
  }
}
