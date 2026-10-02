import type { CategoryOptions } from './types'

/**
 * The consent state a visitor starts with, before they have made any choice.
 *
 * - `necessary` is always on.
 * - `defaultEnabled` wins when set — `false` makes a category opt-in without forcing a banner (e.g. session
 *   replays, which the visitor can switch on from the floating button / settings).
 * - Otherwise a `'tracking'` category that does NOT require the banner is **on** — that is what the opt-out
 *   posture means (cookieless analytics runs until the visitor switches it off). Starting it `false` made the
 *   documented opt-out a silent opt-in: no visitor without a saved choice was ever tracked, and the modal
 *   showed the toggle off.
 * - Everything else (cookie categories, banner-gated tracking) starts off until consent is given.
 */
export function defaultConsentState(categories: Record<string, CategoryOptions | undefined>): Record<string, boolean> {
  const state: Record<string, boolean> = {}
  for (const [key, cat] of Object.entries(categories)) {
    state[key] = cat?.defaultEnabled ?? (cat?.kind === 'tracking' && cat?.requiresBanner !== true)
  }
  state.necessary = true
  return state
}
