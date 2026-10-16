<script setup lang="ts">
useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  htmlAttrs: { lang: 'en' },
})
useSeoMeta({
  title: 'Nuxt Cookie Consent playground',
  description: 'The built-in consent banner, settings modal and floating button of @websideproject/nuxt-cookie-consent, with just-in-time consent and consent-gated scripts and cookies.',
})

// The cookie-consent module auto-provides $consent and auto-imports its composables.
const { $consent } = useNuxtApp()

// The language works without consent, but is only remembered (written to its cookie) once "preferences" is granted.
const locale = useConsentCookie<'en' | 'de'>('locale_preference', 'preferences', { default: () => 'en' })
watch(locale, value => $consent.setLocale(value ?? 'en'), { immediate: true })

const { toggle: toggleColorMode } = useColorModeToggle()

// Consent-gated script: Nuxt Scripts only injects it once the `analytics` trigger resolves (on consent).
const analyticsLoaded = ref(false)
useScript('/analytics-demo.js', { trigger: $consent.triggers.analytics })
onMounted(() => {
  analyticsLoaded.value = !!(window as any).__analyticsDemoLoaded
  window.addEventListener('analytics-demo-loaded', () => { analyticsLoaded.value = true })
})

const analyticsAnswer = ref<boolean | null>(null)
async function requestAnalytics() {
  analyticsAnswer.value = await useRequestConsent('analytics')
}
</script>

<template>
  <UApp>
    <UHeader :toggle="false">
      <template #left>
        <NuxtLink
          to="/"
          aria-label="Nuxt Cookie Consent playground"
        >
          <AppLogo />
        </NuxtLink>
      </template>

      <template #right>
        <ThemeButton />
        <UButton
          to="https://github.com/websideproject/nuxt-cookie-consent"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain class="flex-1 min-h-auto">
      <UContainer class="max-w-3xl py-10 sm:py-14">
        <h1 class="text-3xl font-bold text-highlighted">
          Cookie consent for Nuxt
        </h1>
        <p class="mt-2 text-muted">
          The module's built-in banner, settings modal and floating button — plain CSS, no UI framework — on a
          Nuxt UI page. Same-named overrides, for an app that brings its own UI, are in
          <code class="text-sm">examples/overrides/</code>.
        </p>

        <div class="mt-8 space-y-6">
          <UCard>
            <template #header>
              <h2 class="font-semibold text-highlighted">
                Consent state
              </h2>
            </template>
            <ul class="space-y-2">
              <li
                v-for="(value, key) in $consent.state.value"
                :key="key"
                class="flex items-center justify-between gap-4"
              >
                <code class="text-sm">{{ key }}</code>
                <UBadge
                  :color="value ? 'success' : 'neutral'"
                  variant="subtle"
                  :icon="value ? 'i-lucide-check' : 'i-lucide-x'"
                  :label="value ? 'granted' : 'denied'"
                />
              </li>
            </ul>
            <template #footer>
              <p class="text-sm text-muted">
                Choice made: {{ $consent.hasMadeChoice.value ? 'yes' : 'no' }} · Locale: {{ $consent.currentLocale.value }}
              </p>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="font-semibold text-highlighted">
                Just-in-time consent
              </h2>
            </template>
            <div class="flex flex-wrap gap-3">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-sun-moon"
                label="Switch colour mode (needs preferences)"
                @click="toggleColorMode"
              />
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-chart-line"
                label="Enable analytics (needs analytics)"
                @click="requestAnalytics"
              />
            </div>
            <p
              v-if="analyticsAnswer !== null"
              class="mt-3 text-sm text-muted"
            >
              {{ analyticsAnswer ? 'Analytics consent granted.' : 'Analytics consent declined.' }}
            </p>
            <template #footer>
              <p
                class="text-sm text-muted"
                data-testid="analytics-script"
              >
                Analytics script (<code>useScript</code> + <code>$consent.triggers.analytics</code>):
                {{ analyticsLoaded ? 'loaded' : 'waiting for consent' }}
              </p>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="font-semibold text-highlighted">
                Controls
              </h2>
            </template>
            <div class="flex flex-wrap gap-3">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-settings-2"
                label="Open settings modal"
                @click="$consent.isModalOpen.value = true"
              />
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-languages"
                label="Switch language (EN/DE)"
                @click="locale = locale === 'en' ? 'de' : 'en'"
              />
            </div>
            <template #footer>
              <p class="text-sm text-muted">
                The language is remembered (<code>useConsentCookie</code>) only once <em>preferences</em> is granted.
              </p>
            </template>
          </UCard>
        </div>
      </UContainer>
    </UMain>

    <USeparator>
      <ProductLogo class="size-6" />
    </USeparator>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Nuxt Cookie Consent playground · by <ColourfulText class="font-semibold" />
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/websideproject/nuxt-cookie-consent"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>

    <CookieConsentBanner />
    <CookieConsentModal />
    <CookieConsentFab />
  </UApp>
</template>
