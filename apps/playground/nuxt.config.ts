import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@websideproject/nuxt-cookie-consent'],

  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2026-01-01',

  // The module injects a `@import "tailwindcss"` stylesheet, so wire up the Tailwind v4 Vite plugin.
  vite: {
    plugins: [tailwindcss()],
  },

  // Demo cookie-consent configuration.
  cookieConsent: {
    locale: 'en',
    fallbackLocale: 'en',

    linkMap: {
      privacy: '/privacy-policy',
      imprint: '/imprint',
    },

    categories: {
      necessary: { readonly: true },
      preferences: {
        cookies: [
          {
            id: 'theme_preference',
            descriptionKey: 'cookies.preferences.theme.description',
            provider: 'This site',
            duration: '1 year',
            // Set on-demand — no upfront banner needed for this one.
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
          },
        ],
      },
    },

    texts: {
      en: {
        cookies: {
          preferences: {
            theme: { description: 'Stores your preferred color theme (dark/light).' },
          },
          analytics: {
            ga: { description: 'Used by Google Analytics to distinguish unique visitors.' },
          },
        },
      },
    },
  },
})
