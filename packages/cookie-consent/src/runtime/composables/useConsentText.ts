import { useRuntimeConfig, useNuxtApp } from '#imports'

export interface TextPart {
  type: 'string' | 'link'
  content: string
  key?: string
  href?: string
}

// Always returns at least one part, so the result is a non-empty tuple (callers can safely read [0]).
export function useConsentText(key: string, replacements: Record<string, string> = {}): [TextPart, ...TextPart[]] {
  const config = useRuntimeConfig().public.cookieConsent
  const { $consent } = useNuxtApp()

  const locale = $consent.currentLocale.value
  const { fallbackLocale } = config
  // `texts`/`linkMap` are typed from the literal default config shape; treat them as open records for dynamic key lookup.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nested, runtime-defined i18n tree
  const texts = config.texts as Record<string, any>
  const linkMap = config.linkMap as Record<string, string>

  const keyParts = key.split('.')
  let rawText = keyParts.reduce((obj, part) => obj?.[part], texts[locale])
    || keyParts.reduce((obj, part) => obj?.[part], texts[fallbackLocale])
    || key

  if (typeof rawText !== 'string') {
    // Fallback if the key resolves to an object instead of a string
    rawText = key
  }

  for (const [placeholder, value] of Object.entries(replacements)) {
    rawText = rawText.replace(`{${placeholder}}`, value)
  }

  const parts: TextPart[] = []
  const linkRegex = /\{(\w+)\}/g
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'string', content: rawText.slice(lastIndex, match.index) })
    }

    const linkKey = match[1]
    const linkText = texts[locale]?.links?.[linkKey] || texts[fallbackLocale]?.links?.[linkKey] || linkKey
    const href: string = texts[locale]?.linkMap?.[linkKey] || linkMap?.[linkKey] || '#'

    parts.push({ type: 'link', content: linkText, key: linkKey, href })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < rawText.length) {
    parts.push({ type: 'string', content: rawText.slice(lastIndex) })
  }

  if (parts.length === 0) {
    return [{ type: 'string', content: rawText }]
  }

  return parts as [TextPart, ...TextPart[]]
}
