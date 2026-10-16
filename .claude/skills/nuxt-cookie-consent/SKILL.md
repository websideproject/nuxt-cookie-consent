---
name: nuxt-cookie-consent
description: Use when adding or configuring cookie consent in a Nuxt 4 app with nuxt-cookie-consent (@websideproject/nuxt-cookie-consent) - provides consent categories (cookie and cookieless tracking), the banner/modal/floating-button components, $consent, useRequestConsent, useConsentCookie, and consent-gated script loading via Nuxt Scripts.
license: MIT
---

# nuxt-cookie-consent

Cookie and cookieless-tracking consent for Nuxt 4. Categories are declared in `nuxt.config.ts`; the module provides
a banner (shown only when a category needs it), a preferences modal, a floating settings button, a `$consent` store,
and composables to gate cookies and scripts per category.

## When to Use

- Adding a consent banner / settings modal to a Nuxt app
- Declaring consent categories, cookie tables, or cookieless analytics (`kind: 'tracking'`)
- Loading a third-party script only after consent (`useScript` + `$consent.triggers.<category>`)
- Writing a cookie only after consent (`useConsentCookie`)
- Asking for one category at the moment a feature needs it (`useRequestConsent`)
- Replacing the default components with your own UI kit, or using the module headless

## Install

```bash
npm install @websideproject/nuxt-cookie-consent @nuxt/scripts
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@websideproject/nuxt-cookie-consent'],
  cookieConsent: {
    categories: {
      necessary: { readonly: true },
      analytics: {
        cookies: [{ id: '_ga', descriptionKey: 'cookies.analytics.ga.description', provider: 'Google LLC', duration: '2 years' }],
      },
    },
  },
})
```

- Nuxt `>=4.0.0`. `@nuxt/scripts` is a peer dependency (`^1.0.0`); the module registers it itself — do NOT add
  `@nuxt/scripts` to `modules` as well.
- Render the components once, in `app.vue` or a layout:

```vue
<template>
  <NuxtLayout><NuxtPage /></NuxtLayout>
  <CookieConsentBanner />
  <CookieConsentModal />
  <CookieConsentFab />
</template>
```

## Module options (`cookieConsent`)

| Option | Type | Default | Notes |
|---|---|---|---|
| `categories` | `Record<string, CategoryOptions>` | — | Keys become the category names (`ConsentCategory`). Always include `necessary: { readonly: true }`. |
| `locale` / `fallbackLocale` | `string` | `'en'` | Built-in texts: `en`, `de`, `es`, `fr`. Switch at runtime with `$consent.setLocale()`. |
| `texts` | `Record<locale, …>` | built-in | Deep-merged over the defaults. Placeholders `{privacy}` / `{imprint}` become links via `linkMap`. |
| `linkMap` | `Record<string, string>` | `{ privacy: '/privacy-policy', imprint: '/imprint' }` | Routes for the text placeholders. |
| `colors` | `Partial<ColorOptions>` | neutral palette | CSS variables for the default components: `background`, `foreground`, `primary`, `primaryForeground`, `secondary`, `secondaryForeground`, `border`, `borderInput`. |
| `darkColors` | `Partial<ColorOptions> \| false` | dark neutral palette | Used instead of `colors` under a `.dark` ancestor (Nuxt color mode's class on `<html>`). `false` = `colors` in both modes. |
| `cookieName` | `string` | `'cookie_consent'` | Renaming it makes every visitor decide again. |

### `CategoryOptions`

| Field | Meaning |
|---|---|
| `readonly` | Always on, cannot be toggled (use for `necessary`). |
| `kind` | `'cookie'` (default): modal shows a provider/duration table from `cookies[]`. `'tracking'`: a plain toggle + `description`, no table, `cookies[]` not needed (cookieless analytics). |
| `cookies` | `{ id, descriptionKey, provider, duration, requiresBanner? }[]` — `descriptionKey` is a path into `texts`; `provider` and `duration` are a string or one per locale (`{ en: '1 year', de: '1 Jahr' }`). |
| `description` | Shown in the modal (mainly for `kind: 'tracking'`); a string or one per locale. Falls back to `texts.<locale>.categories.<key>.description`. |
| `requiresBanner` | Forces (or suppresses) the first-visit banner for this category. |
| `defaultEnabled` | State before the visitor chooses. |

**When is the banner shown?** Only if some non-readonly category requires it:
- `kind: 'tracking'` → only when `requiresBanner: true` (default is opt-out: on, no banner).
- otherwise the category's `requiresBanner` wins; without it, a category with no `cookies` requires a banner, and a
  category with cookies requires one if any cookie has `requiresBanner !== false`.
- If nothing requires it, only the floating button appears.

**Default state:** `necessary` on; a `kind: 'tracking'` category without a banner on (opt-out); everything else off.
`defaultEnabled: false` on a tracking category = opt-in without a banner (e.g. session replays).

## `$consent` (from `useNuxtApp()`)

```ts
const { $consent } = useNuxtApp()
$consent.state.value.analytics          // boolean per category (Ref<Record<ConsentCategory, boolean>>)
$consent.hasMadeChoice.value            // true once a choice is persisted in the consent cookie
$consent.isModalOpen.value = true       // open the settings modal
$consent.updateState({ ...$consent.state.value, analytics: true }) // update + persist
$consent.triggers.analytics             // Promise, resolved when the category is granted
$consent.currentLocale.value            // current UI locale
$consent.setLocale('de')
```

## Composables (auto-imported)

| Composable | Use |
|---|---|
| `useRequestConsent(category)` | `Promise<boolean>`. Resolves `true` immediately if granted (or `'necessary'`); otherwise opens the modal with a context message and resolves with the choice when it closes. |
| `useConsentCookie<T>(name, category, cookieOptions)` | Like `useCookie`, but the value is only written to the cookie while the category is granted; it is read back once consent is given. Takes `useCookie` options (`default`, `maxAge`, …). |
| `useConsentText(key, replacements?)` | Localized text as a non-empty array of parts `{ type: 'string' \| 'link', content, href? }`, so `{privacy}`-style placeholders render as links. `[0].content` for plain strings. |
| `useConsentLocalized(value)` | A `provider` / `duration` / `description` value in the active locale (string as-is; `{ en, de }` by locale, then `fallbackLocale`). |
| `useConsentBanner()` | `{ isVisible, acceptAll, customize, colors, darkColors }` |
| `useConsentModal()` | `{ isOpen, categories, localConsentState, openAccordions, contextualMessage, acceptAll, saveSelection, closeModal, toggleAccordion, colors, darkColors }` — `categories` is `[key, CategoryOptions][]`; `contextualMessage` is text parts (empty unless opened by `useRequestConsent`). |
| `useConsentFab()` | `{ isVisible, openModal, colors, darkColors }` — visible once a choice is made, or from the start when no banner is required. |

## Common patterns

### Load a script only after consent

```vue
<script setup lang="ts">
const { $consent } = useNuxtApp()
useScript('https://example.com/analytics.js', { trigger: $consent.triggers.analytics })
</script>
```

The trigger resolves once, on grant. It is not reset on revoke: `useScript` will not unload the script. When revoking
must stop tracking, gate the tracker on the state instead:

```ts
// app/plugins/analytics.client.ts
export default defineNuxtPlugin(() => {
  const { $consent } = useNuxtApp()
  watch(() => $consent.state.value.analytics === true, on => myTracker.setEnabled(on), { immediate: true })
})
```

### Just-in-time consent for a feature

```ts
const theme = useConsentCookie<'light' | 'dark'>('theme_preference', 'preferences', { default: () => 'light' })

async function toggleTheme() {
  if (await useRequestConsent('preferences')) theme.value = theme.value === 'light' ? 'dark' : 'light'
}
```

Give such a cookie `requiresBanner: false` so it does not force the first-visit banner.

### Cookieless analytics (opt-out, no banner)

```ts
categories: {
  necessary: { readonly: true },
  analytics: { kind: 'tracking', description: 'Cookieless, anonymous usage statistics.' },
}
```

## Custom UI

The default components are plain CSS (themed by `colors`, and by `darkColors` under `.dark`), registered with negative priority — a component with the
same name in the app (`CookieConsentBanner.vue`, `CookieConsentModal.vue`, `CookieConsentFab.vue`) replaces it.
Build it on the composables above; see [references/custom-ui.md](references/custom-ui.md).

## Gotchas

- Do not list `@nuxt/scripts` in `modules` — the module installs it.
- Category keys in `texts.<locale>.categories.<key>` (`name`, `description`) label the modal; add them for custom keys.
- `necessary` must be `readonly: true`; `useRequestConsent('necessary')` always resolves `true`.
- The consent cookie (`cookie_consent`) is itself strictly necessary; renaming it (`cookieName`) resets every visitor.
- Using the module does not make a site compliant by itself — cookie descriptions and choices remain the site's responsibility.
