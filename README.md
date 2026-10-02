# nuxt-cookie-consent

A GDPR-compliant, intelligent, and fully customizable **cookie consent** module for Nuxt 3 & 4 — powered by [Nuxt Scripts](https://scripts.nuxt.com).

> **Disclaimer:** This module provides tools to help you comply with privacy regulations like GDPR, but using it does not automatically guarantee compliance. You are solely responsible for your site's configuration, cookie descriptions, and overall privacy practices. Always consult a legal professional. The author assumes no liability for any legal issues arising from its use.

## Packages

| Package | Description |
|---------|-------------|
| [`@websideproject/nuxt-cookie-consent`](./packages/cookie-consent) | The Nuxt cookie consent module — categories, just-in-time consent, dynamic i18n, consent-gated script loading |

## Quick install

```bash
bun add -D @websideproject/nuxt-cookie-consent
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@websideproject/nuxt-cookie-consent'],
})
```

The module installs `@nuxt/scripts` automatically.

## Features

- ✅ **GDPR compliant** — granular control, stale-cookie detection, and consent-gated cookie writing
- 🧠 **Intelligent banner** — only shows when a configured non-essential cookie actually requires it
- 🌍 **Dynamic i18n** — fully translatable UI with reactive locale switching (EN, DE, ES, FR built in)
- ⚙️ **Fully configurable** — categories, colors, and text in `nuxt.config.ts`
- ✨ **On-demand consent** — `useRequestConsent` asks just-in-time
- 🍪 **Consent-aware cookies** — `useConsentCookie` only persists after consent
- 🎨 **Overridable UI** — replace any component via Nuxt Layers
- 🚀 **Powered by Nuxt Scripts** — `$consent.triggers.<category>` for compliant script loading

See [`packages/cookie-consent/README.md`](./packages/cookie-consent/README.md) for full module docs.

## Monorepo layout

```
apps/
  playground/    # Dev playground — demos the module with dependency-free override components
  docs/          # Docus documentation site (apps/docs/content)
packages/
  cookie-consent/  # @websideproject/nuxt-cookie-consent — the publishable module
```

## Development

```bash
bun install
bun run build:module    # Build the module
bun run dev             # Start the playground
bun run docs            # Start the docs site
bun run typecheck       # TypeScript check
bun run test            # Run tests
```

## License

MIT — Benjamin Gervan
