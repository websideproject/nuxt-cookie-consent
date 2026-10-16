export default defineNuxtConfig({
  // Nuxt UI styles the playground's own page (the shell around the demo), like the other websideproject playgrounds.
  // The consent banner, modal and floating button are the module's built-in, plain-CSS components.
  modules: ['@websideproject/nuxt-cookie-consent', '@nuxt/ui'],

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // The colour mode is a preference: it is kept in the `theme_preference` cookie declared below, and the theme
  // button (ThemeButton.vue) changes it — and so writes the cookie — only once `preferences` is granted.
  colorMode: {
    storage: 'cookie',
    storageKey: 'theme_preference',
  },
  compatibilityDate: '2026-01-01',

  vite: {
    define: {
      // Report every hydration mismatch in production builds too (attributes and classes are otherwise not
      // checked): a mismatched page renders differently run to run.
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    },
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
            provider: { en: 'This site', de: 'Diese Website' },
            duration: { en: '1 year', de: '1 Jahr' },
            // Set on-demand — no upfront banner needed for this one.
            requiresBanner: false,
          },
          {
            id: 'locale_preference',
            descriptionKey: 'cookies.preferences.locale.description',
            provider: { en: 'This site', de: 'Diese Website' },
            duration: { en: '1 year', de: '1 Jahr' },
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
            duration: { en: '2 years', de: '2 Jahre' },
          },
        ],
      },
      // Cookieless analytics: no cookie table, a plain toggle; opt-out, so it never forces the banner.
      statistics: {
        kind: 'tracking',
        requiresBanner: false,
      },
    },

    texts: {
      en: {
        categories: {
          statistics: {
            name: 'Usage Statistics',
            description: 'Cookieless, anonymous page-view statistics. Nothing is stored on your device.',
          },
        },
        cookies: {
          preferences: {
            theme: { description: 'Stores your colour mode (light/dark).' },
            locale: { description: 'Stores the language you picked.' },
          },
          analytics: {
            ga: { description: 'Used by Google Analytics to distinguish unique visitors.' },
          },
        },
      },
      de: {
        categories: {
          statistics: {
            name: 'Nutzungsstatistik',
            description: 'Cookielose, anonyme Seitenaufruf-Statistik. Auf Ihrem Gerät wird nichts gespeichert.',
          },
        },
        cookies: {
          preferences: {
            theme: { description: 'Speichert Ihr Farbschema (hell/dunkel).' },
            locale: { description: 'Speichert die gewählte Sprache.' },
          },
          analytics: {
            ga: { description: 'Wird von Google Analytics verwendet, um einzelne Besucher zu unterscheiden.' },
          },
        },
      },
    },
  },

  // Public Sans comes from public/fonts (see assets/css/main.css), not from a download at build time: Google Fonts
  // does not always serve the same file, and a different file shifts the glyphs in every screenshot.
  fonts: {
    families: [{ name: 'Public Sans', provider: 'none' }],
  },
})
