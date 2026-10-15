---
seo:
  title: nuxt-cookie-consent — GDPR cookie consent for Nuxt
  description: Cookie and cookieless-tracking consent for Nuxt 4 — a banner only when needed, a preferences modal, and consent-gated scripts and cookies.
---

::u-page-hero
#title
Nuxt Cookie Consent

#description
**Cookie and cookieless-tracking consent** for Nuxt 4. Granular categories, just-in-time consent, dynamic i18n, and consent-gated script loading powered by [Nuxt Scripts](https://scripts.nuxt.com).

#links
  :::u-button
  ---
  size: xl
  to: /guide/introduction
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  color: neutral
  size: xl
  to: /guide/configuration
  variant: outline
  ---
  Configuration
  :::
::

::u-page-section
#title
Built for real compliance

#features
  :::u-page-feature
  ---
  icon: i-lucide-shield-check
  ---
  #title
  GDPR-first
  #description
  Granular per-category control, stale-cookie detection, and cookies that are only written **after** the user consents.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-brain
  ---
  #title
  Intelligent banner
  #description
  The initial banner appears only when a configured non-essential cookie actually requires it — otherwise users just see the settings button.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-languages
  ---
  #title
  Dynamic i18n
  #description
  Fully translatable UI including cookie categories, with secure link handling and reactive locale switching. Ships with EN, DE, ES, FR.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-mouse-pointer-click
  ---
  #title
  On-demand consent
  #description
  Ask for permission "just-in-time" with `useRequestConsent`, then react to the user's choice.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-cookie
  ---
  #title
  Consent-aware cookies
  #description
  `useConsentCookie` behaves like `useCookie` but only persists once its category has been consented.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-rocket
  ---
  #title
  Powered by Nuxt Scripts
  #description
  Every category exposes a consent trigger you can pass straight to `useScript` for compliant, deferred loading.
  :::
::
