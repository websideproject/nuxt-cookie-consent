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
  /**
   * Reload the page when the visitor withdraws this category's consent, after it was granted on the current page.
   * Overrides the module-level `reloadOnRevoke`.
   */
  reloadOnRevoke?: boolean
  /**
   * The cookies this category sets. They are listed in the modal (cookie kind), and deleted when consent is
   * withdrawn. An `id` ending in `*` matches by prefix (`_ga_*`).
   */
  cookies?: CookieDefinition[]
}

/** The Google Consent Mode v2 consent types. */
export type ConsentModeType
  = | 'ad_storage'
    | 'ad_user_data'
    | 'ad_personalization'
    | 'analytics_storage'
    | 'functionality_storage'
    | 'personalization_storage'
    | 'security_storage'

export interface GoogleConsentModeOptions {
  /**
   * Category → the Consent Mode types it grants. A type is `granted` only while every category mapped to it is
   * granted; a type no category maps is always `denied`.
   */
  mapping: Record<string, ConsentModeType | ConsentModeType[]>
  /** Milliseconds Google tags wait for the visitor's stored choice before firing. @default 500 */
  waitForUpdate?: number
}

/** The options the plugin reads from the public runtime config, beside `categories`, `texts` and the rest. */
export interface ConsentRuntimeOptions {
  cookieName?: string
  consentVersion?: string | null
  expiresInDays?: number
  reloadOnRevoke?: boolean
  googleConsentMode?: GoogleConsentModeOptions | false
}

/** What the companion `<cookieName>_meta` cookie stores: the policy version consented to and when. */
export interface ConsentMeta {
  version: string | null
  at: number
}

/** How a choice was committed: `acceptAll()`, `rejectAll()`, or a selection saved with `updateState()`. */
export type ConsentAction = 'acceptAll' | 'rejectAll' | 'save'

export interface ConsentChangeEvent {
  state: Record<string, boolean>
  previous: Record<string, boolean>
  /** Categories that went from off to on. */
  granted: string[]
  /** Categories that went from on to off. */
  revoked: string[]
  action: ConsentAction
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
  /** When the stored choice was made (ms since epoch), `null` before the visitor has chosen. */
  consentedAt: Ref<number | null>
  /** The `consentVersion` the module is configured with. */
  consentVersion: string | null
  /** Grant every category. */
  acceptAll: () => Promise<void>
  /** Withdraw every category that is not `readonly`. */
  rejectAll: () => Promise<void>
  /** Commit a selection. Readonly categories stay granted. */
  updateState: (newState: Record<ConsentCategory, boolean>) => Promise<void>
}

type HookResult = Promise<void> | void

declare module '#app' {
  interface NuxtApp {
    $consent: ConsentPlugin
  }
  interface RuntimeNuxtHooks {
    /** A choice was committed. Fires in the browser only, not for the choice restored from the cookie. */
    'consent:changed': (event: ConsentChangeEvent) => HookResult
    /** A category went from off to on. */
    'consent:granted': (category: string) => HookResult
    /** A category went from on to off: stop what it started here; its cookies are deleted after this hook. */
    'consent:revoked': (category: string) => HookResult
  }
}
declare module 'vue' {
  interface ComponentCustomProperties {
    $consent: ConsentPlugin
  }
}
