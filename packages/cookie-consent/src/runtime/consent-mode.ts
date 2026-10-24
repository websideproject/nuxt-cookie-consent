import type { ConsentModeType, GoogleConsentModeOptions } from './types'

export const CONSENT_MODE_TYPES: ConsentModeType[] = [
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
  'analytics_storage',
  'functionality_storage',
  'personalization_storage',
  'security_storage',
]

type ConsentModePayload = Record<ConsentModeType, 'granted' | 'denied'>

// Set by whichever pushes the `default` command first: the inline head script or the plugin (SPA pages).
const DEFAULT_PUSHED = '__cookieConsentModeDefault'

/**
 * Every Consent Mode type for a consent state: `granted` only while every category mapped to it is granted. A type
 * no category maps stays `denied` — Google treats a type left out of the `default` command as granted.
 */
export function consentModePayload(state: Record<string, boolean>, mapping: GoogleConsentModeOptions['mapping']): ConsentModePayload {
  const payload = {} as ConsentModePayload
  for (const type of CONSENT_MODE_TYPES) {
    const owners = Object.entries(mapping)
      .filter(([, types]) => (Array.isArray(types) ? types : [types]).includes(type))
      .map(([category]) => category)
    payload[type] = owners.length > 0 && owners.every(category => state[category] === true) ? 'granted' : 'denied'
  }
  return payload
}

/**
 * The inline head script that sends the `default` command before any Google tag loads. It is the same on every page
 * (built from the defaults, not the visitor's cookie), so prerendered and cached pages stay correct; the plugin
 * follows with an `update` for the stored choice.
 */
export function consentModeDefaultScript(payload: ConsentModePayload, waitForUpdate: number): string {
  const args = JSON.stringify({ ...payload, wait_for_update: waitForUpdate }).replace(/</g, '\\u003c')
  return `window.dataLayer=window.dataLayer||[];if(!window.${DEFAULT_PUSHED}){window.${DEFAULT_PUSHED}=true;(function(){dataLayer.push(arguments)})('consent','default',${args})}`
}

// gtag's own definition: the Google tags read the dataLayer entries as `arguments` objects, not arrays.
function gtag(..._args: unknown[]) {
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  // eslint-disable-next-line prefer-rest-params
  w.dataLayer.push(arguments)
}

/** The `default` command, unless the head script already sent it (it has not run yet on a client-rendered page). */
export function pushConsentModeDefault(payload: ConsentModePayload, waitForUpdate: number) {
  const w = window as unknown as Record<string, unknown>
  if (w[DEFAULT_PUSHED]) return
  w[DEFAULT_PUSHED] = true
  gtag('consent', 'default', { ...payload, wait_for_update: waitForUpdate })
}

export function pushConsentModeUpdate(payload: ConsentModePayload) {
  gtag('consent', 'update', payload)
}
