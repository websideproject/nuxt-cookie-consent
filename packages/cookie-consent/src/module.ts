import { defineNuxtModule, addPlugin, createResolver, addComponentsDir, addImportsDir, installModule } from '@nuxt/kit'
import { defu } from 'defu'
import { defaultTexts } from './runtime/texts'
import type { CategoryOptions, ColorOptions } from './runtime/types'

export interface ModuleOptions {
  locale?: string
  fallbackLocale?: string
  colors?: Partial<ColorOptions>
  texts?: Partial<Record<string, unknown>>
  linkMap?: Record<string, string>
  categories: Record<string, CategoryOptions>
  /** Name of the cookie that stores the consent decision. @default 'cookie_consent' (P12.M4). */
  cookieName?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@websideproject/nuxt-cookie-consent',
    configKey: 'cookieConsent',
    compatibility: {
      nuxt: '^3.0.0 || ^4.0.0',
    },
  },
  defaults: {
    locale: 'en',
    fallbackLocale: 'en',
    cookieName: 'cookie_consent',
    colors: {
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(240 10% 3.9%)',
      primary: 'hsl(240 5.9% 10%)',
      primaryForeground: 'hsl(0 0% 98%)',
      secondary: 'hsl(240 4.8% 95.9%)',
      secondaryForeground: 'hsl(240 5.9% 10%)',
      border: 'hsl(240 5.9% 90%)',
      borderInput: 'hsl(240 5.9% 90%)',
    },
    texts: defaultTexts,
    linkMap: {
      privacy: '/privacy-policy',
      imprint: '/imprint',
    },
    categories: {
      necessary: {
        readonly: true,
      },
    },
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // P12.M1: no forced global CSS. The default components are pure-CSS (scoped <style> + CSS vars from
    // `colors`), so the module injects nothing and takes no UI-framework dependency. Host styling (e.g.
    // @nuxt/ui) is done via same-named component overrides in the consuming app.

    await installModule('@nuxt/scripts')

    // Logic to determine if the initial banner is required (P12.M8).
    const requiresInitialConsent = Object.entries(options.categories).some(([key, category]) => {
      if (key === 'necessary' || category.readonly) return false

      // `'tracking'` (non-cookie) categories never force a banner unless explicitly opted in — this is
      // the cookieless opt-out posture (a category with no cookies must not wrongly require a banner).
      if (category.kind === 'tracking') return category.requiresBanner === true

      // A category-level `requiresBanner` wins when set.
      if (category.requiresBanner !== undefined) return category.requiresBanner

      // Otherwise fall back to the per-cookie heuristic: no cookies listed ⇒ assume a banner is needed;
      // else a banner is required if ANY cookie requires one (`requiresBanner` defaults to true).
      if (!category.cookies || category.cookies.length === 0) return true
      return category.cookies.some(cookie => cookie.requiresBanner !== false)
    })

    // Deep merge user configs with defaults
    const finalTexts = defu(options.texts, defaultTexts)
    const finalLinkMap = defu(options.linkMap, {
      privacy: '/privacy-policy',
      imprint: '/imprint',
    })
    const finalCategories = defu(options.categories, {})

    // Add everything to public runtime config (dynamic shape — assign through an index cast).
    ;(nuxt.options.runtimeConfig.public as Record<string, unknown>).cookieConsent = {
      locale: options.locale,
      fallbackLocale: options.fallbackLocale,
      cookieName: options.cookieName || 'cookie_consent',
      colors: options.colors,
      texts: finalTexts,
      linkMap: finalLinkMap,
      categories: finalCategories,
      requiresInitialConsent: requiresInitialConsent,
    }

    addPlugin(resolver.resolve('./runtime/plugin'))
    addImportsDir(resolver.resolve('./runtime/composables'))
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      // Negative priority so a consuming app's same-named component (e.g. a @nuxt/ui version) reliably
      // overrides the pure-CSS default. See P12.M5 (the module as a state engine + app-rendered UI).
      priority: -10,
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.externals = nitroConfig.externals || {}
      nitroConfig.externals.inline = nitroConfig.externals.inline || []
      nitroConfig.externals.inline.push(resolver.resolve('./runtime/types'))
    })
    nuxt.options.alias['#cookie-consent-types'] = resolver.resolve('./runtime/types')
  },
})
