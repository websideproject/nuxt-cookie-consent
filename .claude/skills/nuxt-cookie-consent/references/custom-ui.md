# Custom UI for nuxt-cookie-consent

The module registers `CookieConsentBanner`, `CookieConsentModal` and `CookieConsentFab` with `priority: -10`, so a
same-named component in the app's `components/` wins. Keep the same names and render them once (app.vue or a layout).
All state and actions come from the composables; the components only supply markup.

## Banner

```vue
<!-- app/components/CookieConsentBanner.vue -->
<script setup lang="ts">
const { isVisible, acceptAll, customize } = useConsentBanner()
</script>

<template>
  <div v-if="isVisible" role="dialog" aria-live="polite">
    <p>
      <template v-for="(part, i) in useConsentText('bannerDescription')" :key="i">
        <NuxtLink v-if="part.type === 'link'" :to="part.href">{{ part.content }}</NuxtLink>
        <span v-else>{{ part.content }}</span>
      </template>
    </p>
    <button @click="customize">{{ useConsentText('customizeBtn')[0].content }}</button>
    <button @click="acceptAll">{{ useConsentText('acceptAllBtn')[0].content }}</button>
  </div>
</template>
```

`isVisible` is true until a choice is made and only when the configuration requires a banner.

## Modal

```vue
<!-- app/components/CookieConsentModal.vue -->
<script setup lang="ts">
const { isOpen, categories, localConsentState, contextualMessage, acceptAll, saveSelection, closeModal } = useConsentModal()
</script>

<template>
  <div v-if="isOpen" role="dialog" aria-modal="true">
    <p v-if="contextualMessage.length">
      <span v-for="(part, i) in contextualMessage" :key="i">{{ part.content }}</span>
    </p>
    <section v-for="[key, category] in categories" :key="key">
      <label>
        <strong>{{ useConsentText(`categories.${String(key)}.name`)[0].content }}</strong>
        <input v-model="localConsentState[key]" type="checkbox" :disabled="category.readonly">
      </label>
      <!-- kind 'cookie': render category.cookies (id, provider, duration); kind 'tracking': category.description.
           provider, duration and description may be per-locale objects: render them with useConsentLocalized(…) -->
    </section>
    <button @click="saveSelection">{{ useConsentText('acceptSelectionBtn')[0].content }}</button>
    <button @click="acceptAll">{{ useConsentText('acceptAllBtn')[0].content }}</button>
    <button @click="closeModal">×</button>
  </div>
</template>
```

- `localConsentState` is a working copy: it is reset from `$consent.state` each time the modal opens and committed only
  by `saveSelection()` (or `acceptAll()`).
- `contextualMessage` (text parts) is non-empty when the modal was opened by `useRequestConsent(category)`; closing the modal resolves
  that request with the category's state.
- Group `categories` by `category.kind` to show cookie tables and cookieless toggles in separate sections.

## Floating button

```vue
<!-- app/components/CookieConsentFab.vue -->
<script setup lang="ts">
const { isVisible, openModal } = useConsentFab()
</script>

<template>
  <button v-if="isVisible" aria-label="Cookie settings" @click="openModal">🍪</button>
</template>
```

## Headless

Skip the components entirely and drive everything from `$consent` (`state`, `updateState`, `isModalOpen`,
`triggers`, `setLocale`) and `useRequestConsent`.
