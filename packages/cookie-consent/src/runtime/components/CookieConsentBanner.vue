<script setup lang="ts">
import { computed } from '#imports'
import { useConsentBanner } from '../composables/useConsentBanner'
import { consentColorVars } from '../css-vars'
import { useConsentText } from '../composables/useConsentText'

// Pure-CSS, dependency-free default (P12.M2). Themeable via the `colors` config (CSS variables); the
// consuming app can override this component by name (e.g. with @nuxt/ui) — see P12.I4.
const { isVisible, acceptAll, customize, colors, darkColors } = useConsentBanner()

const cssVars = computed(() => consentColorVars(colors, darkColors))
</script>

<template>
  <div
    v-if="isVisible"
    class="cc-banner"
    :style="cssVars"
    role="region"
    aria-label="Cookie consent"
  >
    <div class="cc-banner__inner">
      <p class="cc-banner__text">
        <template
          v-for="part in useConsentText('bannerDescription')"
          :key="part.content"
        >
          <a
            v-if="part.type === 'link'"
            :href="part.href"
            target="_blank"
            rel="noopener noreferrer"
            class="cc-banner__link"
          >{{ part.content }}</a>
          <span v-else>{{ part.content }}</span>
        </template>
      </p>
      <div class="cc-banner__actions">
        <button
          type="button"
          class="cc-btn cc-btn--outline"
          @click="customize"
        >
          {{ useConsentText('customizeBtn')[0].content }}
        </button>
        <button
          type="button"
          class="cc-btn cc-btn--primary"
          @click="acceptAll"
        >
          {{ useConsentText('acceptAllBtn')[0].content }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* light or dark set of the inline colour variables (consentColorVars) */
.cc-banner {
  --cc-bg: var(--cc-bg-light);
  --cc-fg: var(--cc-fg-light);
  --cc-primary: var(--cc-primary-light);
  --cc-primary-fg: var(--cc-primary-fg-light);
  --cc-secondary: var(--cc-secondary-light);
  --cc-secondary-fg: var(--cc-secondary-fg-light);
  --cc-border: var(--cc-border-light);
}
.dark .cc-banner {
  --cc-bg: var(--cc-bg-dark);
  --cc-fg: var(--cc-fg-dark);
  --cc-primary: var(--cc-primary-dark);
  --cc-primary-fg: var(--cc-primary-fg-dark);
  --cc-secondary: var(--cc-secondary-dark);
  --cc-secondary-fg: var(--cc-secondary-fg-dark);
  --cc-border: var(--cc-border-dark);
}
.cc-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--cc-bg);
  color: var(--cc-fg);
  border-top: 1px solid var(--cc-border);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
}
.cc-banner__inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.cc-banner__text {
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
  text-align: center;
  opacity: 0.85;
}
.cc-banner__link {
  color: inherit;
  /* set explicitly: a CSS reset (e.g. Tailwind's preflight, under Nuxt UI) removes the underline from links */
  text-decoration: underline;
  text-underline-offset: 2px;
}
.cc-banner__actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}
.cc-btn {
  font: inherit;
  font-size: 0.875rem;
  line-height: 1;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.cc-btn:hover { opacity: 0.9; }
.cc-btn--primary {
  background: var(--cc-primary);
  color: var(--cc-primary-fg);
}
.cc-btn--outline {
  background: transparent;
  color: var(--cc-fg);
  border-color: var(--cc-border);
}
@media (min-width: 640px) {
  .cc-banner__inner { flex-direction: row; }
  .cc-banner__text { text-align: left; }
}
</style>
