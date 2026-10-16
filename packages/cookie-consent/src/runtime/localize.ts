import type { LocalizedString } from './types'

/**
 * A config value that is either one string for every locale or one per locale: the active locale's, else the
 * fallback locale's, else the first one given.
 */
export function localize(value: LocalizedString | undefined, locale: string, fallbackLocale: string): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return value[locale] ?? value[fallbackLocale] ?? Object.values(value)[0] ?? ''
}
