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
