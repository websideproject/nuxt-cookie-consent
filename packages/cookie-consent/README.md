# `@websideproject/nuxt-cookie-consent`

A GDPR-compliant, intelligent, and highly customizable cookie consent module for Nuxt 3 & 4.

> **Disclaimer:** This module provides tools to help you comply with privacy regulations like GDPR, but using it does not automatically guarantee compliance. You are solely responsible for ensuring your website's configuration, cookie descriptions, and overall privacy practices are compliant with all applicable laws in your users' jurisdictions. The author assumes no liability for any legal issues arising from its use. Always consult a legal professional for matters of legal compliance.

## Features

- ✅ **GDPR compliant** — granular control, stale-cookie detection, and consent-gated cookie writing.
- 🧠 **Intelligent banner** — the initial banner only appears if a configured category actually requires it.
- 🍪 **Cookies *and* cookieless tracking** — categories declare a `kind` (`'cookie'` | `'tracking'`); cookie categories render a provider/duration table, tracking categories render a plain toggle (no table) for honest cookieless analytics.
- 🪶 **Zero UI-framework dependency** — the default banner/modal/FAB are **pure-CSS** (scoped styles + CSS variables from `colors`), so they work in any app. Runtime deps are just `@nuxt/kit` + `@nuxt/scripts` + `defu`.
- 🌍 **Dynamic i18n** — fully translatable UI (including cookie categories) with secure link handling and reactive locale switching. Defaults for EN, DE, ES, FR.
- ⚙️ **Fully configurable** — define categories, colors, and text in `nuxt.config.ts`.
- ✨ **On-demand consent** — `useRequestConsent` asks for permission "just-in-time".
- 🍪 **Consent-aware cookies** — `useConsentCookie` for effortless, compliant cookie management.
- 🎨 **Overridable UI** — drop in a same-named component to replace any default with your own UI kit.
- 🧩 **Usable as a pure state engine** — render your own UI entirely and use the composables/`$consent` as the consent store (see below).
- 🚀 **Powered by Nuxt Scripts** — exposes consent-based triggers for efficient script loading.

## Installation

```bash
# bun
bun add -D @websideproject/nuxt-cookie-consent

# pnpm
pnpm add -D @websideproject/nuxt-cookie-consent

# npm
npm install -D @websideproject/nuxt-cookie-consent
```

Add it to your `modules`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@websideproject/nuxt-cookie-consent'],
})
```

The module installs [`@nuxt/scripts`](https://scripts.nuxt.com) automatically.

## Configuration

### Granular banner control (`requiresBanner`)

The module shows the initial consent banner *only if necessary*, controlled by the `requiresBanner` property on individual cookie definitions.

- A non-essential cookie that **requires** a banner (analytics, marketing): omit the property or set `requiresBanner: true` (the default).
- A non-essential cookie that should **not** trigger a banner (e.g. a theme preference set on-demand): set `requiresBanner: false`. Use `useConsentCookie` to manage such cookies so they are written only after consent.

If **all** non-essential cookies set `requiresBanner: false`, no banner shows on first visit — only the floating settings button appears.

### Cookie vs cookieless tracking categories (`kind`)

A category declares what it represents:

- **`kind: 'cookie'`** (default) — backed by real device storage. The modal renders the provider/duration **table** from its `cookies[]`. The per-cookie `requiresBanner` heuristic decides the banner.
- **`kind: 'tracking'`** — a non-cookie item (e.g. cookieless analytics like Umami). No `cookies[]` is needed; the modal renders a labeled **toggle + `description`** with no table. A tracking category shows the banner **only** when you set its category-level `requiresBanner: true` — so cookieless analytics defaults to an opt-out (no banner), not a forced opt-in.

```ts
categories: {
  analytics: {
    kind: 'tracking',
    requiresBanner: false, // opt-out: no banner, just the FAB/settings toggle
    description: 'Cookieless, anonymous usage analytics. No cookie, no persistent identifier.',
  },
}
```

Category-level fields: `kind?`, `description?`, `requiresBanner?` (the last overrides the per-cookie heuristic for `cookie` categories too).

### Example

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@websideproject/nuxt-cookie-consent'],

  cookieConsent: {
    // Initial locale. Can be changed at runtime via $consent.setLocale().
    locale: 'en',
    fallbackLocale: 'en',

    // Map link placeholders ({privacy}, {imprint}) used in texts to routes.
    linkMap: {
      privacy: '/privacy-policy',
      imprint: '/imprint',
    },

    // Define the cookie categories your site uses.
    categories: {
      necessary: { readonly: true },
      preferences: {
        cookies: [
          {
            id: 'theme_preference',
            descriptionKey: 'cookies.preferences.theme.description',
            provider: 'Our Website',
            duration: '1 year',
            // This cookie does NOT require an upfront banner.
            requiresBanner: false,
          },
        ],
      },
      analytics: {
        cookies: [
          {
            id: '_ga',
            descriptionKey: 'cookies.analytics.ga.description',
            provider: 'Google LLC',
            duration: '2 years',
            // requiresBanner: true is the default.
          },
        ],
      },
    },

    // All text lives here (merged over the built-in EN/DE/ES/FR defaults).
    texts: {
      en: {
        cookies: {
          preferences: {
            theme: { description: 'Saves your selected theme (dark/light).' },
          },
          analytics: {
            ga: { description: 'Used by Google Analytics to distinguish users.' },
          },
        },
      },
    },
  },
})
```

## Usage

### 1. Add the components

Add the module's components to your layout or `app.vue`:

```vue
<template>
  <div>
    <NuxtPage />
    <CookieConsentBanner />
    <CookieConsentModal />
    <CookieConsentFab />
  </div>
</template>
```

### 2. Dynamic language switching

```vue
<script setup lang="ts">
const { $consent } = useNuxtApp()
const route = useRoute()

watch(() => route.path, (path) => {
  $consent.setLocale(path.startsWith('/de') ? 'de' : 'en')
}, { immediate: true })
</script>
```

### 3. Conditional script loading

Each category exposes a consent trigger named after its key:

```vue
<script setup lang="ts">
const { $consent } = useNuxtApp()
useScript('https://example.com/analytics.js', { trigger: $consent.triggers.analytics })
</script>
```

### 4. Consent-aware cookies with `useConsentCookie`

```vue
<script setup lang="ts">
// Linked to the 'preferences' category — only written after consent.
const theme = useConsentCookie('theme_preference', 'preferences', {
  default: () => 'light',
})

async function toggleTheme() {
  const hasConsent = await useRequestConsent('preferences')
  if (hasConsent) {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
}
</script>
```

## Composables

| Composable | Purpose |
|------------|---------|
| `useRequestConsent(category)` | Ask for consent just-in-time; resolves to a boolean. |
| `useConsentCookie(name, category, options)` | A `useCookie`-like ref that only persists once the category is consented. |
| `useConsentText(key, replacements?)` | Resolve a localized text into renderable string/link parts. |
| `useConsentBanner()` / `useConsentModal()` / `useConsentFab()` | State/handlers backing the built-in components (useful when building custom UI). |

## Overriding components

The default `CookieConsentBanner`/`CookieConsentModal`/`CookieConsentFab` are **pure-CSS and dependency-free** — they work in any app and theme from your `colors` config via CSS variables. To restyle with your own UI kit (e.g. `@nuxt/ui`), create a component with the **same name** in your project's `components/` directory; the module registers its defaults with a negative priority, so your version reliably wins:

- `CookieConsentBanner.vue`
- `CookieConsentModal.vue`
- `CookieConsentFab.vue`

Your overrides reuse the module's composables — `useConsentBanner()`, `useConsentModal()`, `useConsentFab()`, `useConsentText()` — for all state/handlers, so you only supply markup. `useConsentModal().categories` is `[key, CategoryOptions][]`; group it by `kind` to render cookies (table) and tracking (toggle) sections.

## No-UI / state-engine usage

You don't have to render any of the built-in components. The module works as a **consent state engine** — use `$consent` and the composables and render your own UI (or no UI at all, gating scripts in a plugin):

```ts
const { $consent } = useNuxtApp()
// Reactive state:           $consent.state.value.analytics        // boolean per category
// Persisted choice made?    $consent.hasMadeChoice.value
// Open your own settings:   $consent.isModalOpen.value = true
// Update + persist:         $consent.updateState({ ...$consent.state.value, analytics: true })
// Per-category trigger:     $consent.triggers.analytics           // Promise resolved on grant
// Locale:                   $consent.setLocale('de')
```

Persistence is the `cookie_consent` cookie (a strictly-necessary cookie that remembers the choice). Gate a third-party tracker by watching the state, e.g.:

```ts
// app/plugins/analytics.client.ts
export default defineNuxtPlugin(() => {
  const { $consent } = useNuxtApp()
  // immediate: true re-applies the PERSISTED choice on every load, before the first call.
  watch(() => $consent.state.value.analytics === true, on => myTracker.setEnabled(on), { immediate: true })
})
```

> **`triggers` caveat:** a trigger resolves once on grant and is **not** reset on revoke — it's ideal for `watch(state)` gating (above) and for `useScript({ trigger })` load-on-consent, but `useScript` won't *unload* a script when consent is later revoked. Use an in-memory kill-switch on the tracker (as above) when you need revoke-to-stop.

## License

MIT — Benjamin Gervan
