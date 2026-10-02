<script setup lang="ts">
// The cookie-consent module auto-provides $consent and auto-imports its composables.
const { $consent } = useNuxtApp()

// A preference cookie — only persisted once the user consents to "preferences".
const theme = useConsentCookie<'light' | 'dark'>('theme_preference', 'preferences', {
  default: () => 'light',
})

async function toggleTheme() {
  const granted = await useRequestConsent('preferences')
  if (granted) {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
}

async function requestAnalytics() {
  const granted = await useRequestConsent('analytics')
  alert(granted ? 'Analytics consent granted — load your scripts now.' : 'Analytics consent declined.')
}
</script>

<template>
  <div :class="['page', theme]">
    <main class="container">
      <h1>nuxt-cookie-consent playground</h1>
      <p class="muted">
        A minimal demo of <code>@websideproject/nuxt-cookie-consent</code>. The banner / modal / fab below are
        dependency-free overrides living in <code>app/components/</code>.
      </p>

      <section class="card">
        <h2>Consent state</h2>
        <ul>
          <li
            v-for="(value, key) in $consent.state.value"
            :key="key"
          >
            <strong>{{ key }}</strong>: {{ value ? '✅ granted' : '❌ denied' }}
          </li>
        </ul>
        <p class="muted">
          Choice made: {{ $consent.hasMadeChoice.value ? 'yes' : 'no' }} · Locale: {{ $consent.currentLocale.value }}
        </p>
      </section>

      <section class="card">
        <h2>Just-in-time consent</h2>
        <div class="row">
          <button @click="toggleTheme">
            Toggle theme (needs <em>preferences</em>) — current: {{ theme }}
          </button>
          <button @click="requestAnalytics">
            Enable analytics (needs <em>analytics</em>)
          </button>
        </div>
      </section>

      <section class="card">
        <h2>Controls</h2>
        <div class="row">
          <button @click="$consent.isModalOpen.value = true">
            Open settings modal
          </button>
          <button @click="$consent.setLocale($consent.currentLocale.value === 'en' ? 'de' : 'en')">
            Switch locale (EN/DE)
          </button>
        </div>
      </section>
    </main>

    <CookieConsentBanner />
    <CookieConsentModal />
    <CookieConsentFab />
  </div>
</template>

<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; }
.page { min-height: 100vh; }
.page.light { background: #fff; color: #18181b; }
.page.dark { background: #18181b; color: #fafafa; }
.container { max-width: 720px; margin: 0 auto; padding: 3rem 1.5rem 6rem; }
h1 { margin-bottom: .25rem; }
.muted { opacity: .65; font-size: .9rem; }
code { background: rgba(127,127,127,.18); padding: .1em .35em; border-radius: 4px; }
.card { border: 1px solid rgba(127,127,127,.3); border-radius: 12px; padding: 1.25rem; margin-top: 1.5rem; }
.card h2 { margin-top: 0; font-size: 1.05rem; }
.row { display: flex; flex-wrap: wrap; gap: .75rem; }
button { cursor: pointer; border: 1px solid rgba(127,127,127,.4); background: transparent; color: inherit; padding: .5rem .9rem; border-radius: 8px; font-size: .9rem; }
button:hover { background: rgba(127,127,127,.12); }
ul { padding-left: 1.1rem; }
</style>
