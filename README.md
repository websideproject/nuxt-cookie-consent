# nuxt-cookie-consent

<!-- automd:badges color="black" license name="@websideproject/nuxt-cookie-consent" -->

[![npm version](https://img.shields.io/npm/v/@websideproject/nuxt-cookie-consent?color=black)](https://npmjs.com/package/@websideproject/nuxt-cookie-consent)
[![npm downloads](https://img.shields.io/npm/dm/@websideproject/nuxt-cookie-consent?color=black)](https://npm.chart.dev/@websideproject/nuxt-cookie-consent)
[![license](https://img.shields.io/github/license/websideproject/nuxt-cookie-consent?color=black)](https://github.com/websideproject/nuxt-cookie-consent/blob/main/LICENSE)

<!-- /automd -->

Cookie and cookieless-tracking consent for Nuxt 4. Declare your categories in `nuxt.config.ts` and get a banner that
only appears when something actually needs consent, a preferences modal, a floating settings button, and composables
to gate scripts and cookies behind each category.

> **Disclaimer:** This module provides tools to help you comply with privacy regulations like GDPR, but using it does not automatically guarantee compliance. You are solely responsible for your site's configuration, cookie descriptions, and overall privacy practices. Always consult a legal professional. The author assumes no liability for any legal issues arising from its use.

## ✨ Features

<!-- automd:file src=".github/snippets/features.md" -->

- **Banner only when needed** — it appears on the first visit only if a configured category requires it
- **Cookies and cookieless tracking** — `kind: 'cookie'` categories list provider and duration; `kind: 'tracking'` ones (e.g. cookieless analytics) are a plain toggle, opt-out by default
- **Just-in-time consent** — `useRequestConsent` asks for one category at the moment a feature needs it
- **Consent-gated cookies and scripts** — `useConsentCookie` writes only after consent; `$consent.triggers.<category>` loads a script through [Nuxt Scripts](https://scripts.nuxt.com) once granted
- **No UI framework required** — the default components are plain CSS themed from your `colors`; override any of them with a same-named component in your own UI kit
- **Headless** — use `$consent` and the composables as the consent store and render your own UI, or none
- **Translatable** — every text, including categories, with runtime locale switching; English, German, Spanish and French built in

<!-- /automd -->

## 🚀 Installation

<!-- automd:file src=".github/snippets/installation.md" -->

Install the module and its peer dependency:

```bash
# npm
npm install @websideproject/nuxt-cookie-consent @nuxt/scripts

# pnpm
pnpm add @websideproject/nuxt-cookie-consent @nuxt/scripts

# bun
bun add @websideproject/nuxt-cookie-consent @nuxt/scripts
```

Add it to your `nuxt.config.ts` and declare your categories:

```typescript
export default defineNuxtConfig({
  modules: ['@websideproject/nuxt-cookie-consent'],
  cookieConsent: {
    categories: {
      necessary: { readonly: true },
      analytics: { kind: 'tracking', description: 'Cookieless, anonymous usage statistics.' },
    },
  },
})
```

The module registers `@nuxt/scripts` itself, so don't add it to `modules`. Then render the components once, in
`app.vue` or a layout:

```vue
<template>
  <NuxtPage />
  <CookieConsentBanner />
  <CookieConsentModal />
  <CookieConsentFab />
</template>
```

<!-- /automd -->

## 🧩 Usage

```vue
<script setup lang="ts">
const { $consent } = useNuxtApp()

// A script that is requested only once "analytics" is granted
useScript('https://example.com/analytics.js', { trigger: $consent.triggers.analytics })

// A cookie that is written only once "preferences" is granted
const theme = useConsentCookie<'light' | 'dark'>('theme_preference', 'preferences', { default: () => 'light' })

async function toggleTheme() {
  // Opens the settings modal for "preferences" if it is not granted yet
  if (await useRequestConsent('preferences')) theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>
```

Configuration, the full `$consent` API, custom components and headless use are in the
[module README](./packages/cookie-consent/README.md) and the documentation.

## 📖 Documentation

📖 **[Full documentation → websideproject.com/docs/nuxt-cookie-consent](https://websideproject.com/docs/nuxt-cookie-consent)**

## 🤖 Claude Code Skills

If you use [Claude Code](https://claude.ai/code), install the skill plugin to give Claude accurate knowledge of `nuxt-cookie-consent` — categories, the components, `$consent`, the composables and consent-gated scripts.

```bash
/plugin marketplace add websideproject/nuxt-cookie-consent
/plugin install nuxt-cookie-consent-skills
```

The plugin provides:
- **`nuxt-cookie-consent`** — module options, banner rules, `$consent`, `useRequestConsent`, `useConsentCookie`, script triggers, and custom or headless UI

## 🔍 PR Previews

<!-- automd:file src=".github/snippets/pr-preview.md" -->

Every pull request publishes a preview package via [pkg.pr.new](https://pkg.pr.new), so you can install and test changes before they are merged.

```bash
# npm
npm install https://pkg.pr.new/@websideproject/nuxt-cookie-consent@<pr-number>

# pnpm
pnpm add https://pkg.pr.new/@websideproject/nuxt-cookie-consent@<pr-number>

# bun
bun add https://pkg.pr.new/@websideproject/nuxt-cookie-consent@<pr-number>
```

<!-- /automd -->

## 🤝 Contributing

<!-- automd:file src=".github/snippets/contributing.md" -->

Contributions are welcome! Feel free to open an issue or submit a pull request.

```bash
# Install dependencies
bun install

# Generate type stubs
bun run dev:prepare

# Start the playground
bun run dev

# Run tests
bun run test
```

<!-- /automd -->

## 🧪 Test Coverage

<!-- automd:file src=".github/snippets/coverage.md" -->

| File | Stmts | Branch | Funcs | Lines |
|------|------:|-------:|------:|------:|
| **components** | | | | |
| CookieConsentBanner.vue | 100% | 96% | 100% | 100% |
| CookieConsentFab.vue | 100% | 100% | 100% | 100% |
| CookieConsentModal.vue | 91.3% | 84.09% | 66.66% | 90.9% |
| **composables** | | | | |
| useConsentBanner.ts | 100% | 100% | 100% | 100% |
| useConsentCookie.ts | 0% | 0% | 0% | 0% |
| useConsentFab.ts | 100% | 100% | 100% | 100% |
| useConsentModal.ts | 71.42% | 25% | 66.66% | 72% |
| useConsentText.ts | 93.33% | 77.77% | 100% | 93.1% |
| useRequestConsent.ts | 0% | 0% | 0% | 0% |
| **runtime** | | | | |
| default-state.ts | 100% | 100% | 100% | 100% |
| plugin.ts | 0% | 0% | 0% | 0% |
| texts.ts | 100% | 100% | 100% | 100% |
| **All files** | **53.62%** | **63.39%** | **50%** | **53.68%** |

> Coverage from 31 tests (`bun run test:coverage` in `packages/cookie-consent`). The plugin, `useConsentCookie` and
> `useRequestConsent` have no unit tests yet; the playground exercises them.

<!-- /automd -->

## ❓ Questions & Support

<!-- automd:file src=".github/snippets/support.md" -->

- **Issues**: [Open an issue](https://github.com/websideproject/nuxt-cookie-consent/issues) for bugs or feature requests
- **Discussions**: [Join the discussion](https://github.com/websideproject/nuxt-cookie-consent/discussions) for questions and ideas

<!-- /automd -->

## 📄 License

<!-- automd:file src=".github/snippets/license.md" -->

Published under the [MIT](https://github.com/websideproject/nuxt-cookie-consent/blob/main/LICENSE) license.

Made by [websideproject](https://github.com/websideproject) and [community](https://github.com/websideproject/nuxt-cookie-consent/graphs/contributors) 💛

<a href="https://github.com/websideproject/nuxt-cookie-consent/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=websideproject/nuxt-cookie-consent" />
</a>

<!-- /automd -->
