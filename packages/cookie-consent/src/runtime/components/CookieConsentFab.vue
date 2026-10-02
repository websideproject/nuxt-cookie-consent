<script setup lang="ts">
import { computed } from '#imports'
import { useConsentFab } from '../composables/useConsentFab'

// Pure-CSS, dependency-free default (P12.M2). Inline SVG cookie icon — no icon library dependency.
const { isVisible, openModal, colors } = useConsentFab()

const cssVars = computed(() => ({
  '--cc-secondary': colors.secondary ?? 'hsl(240 4.8% 95.9%)',
  '--cc-secondary-fg': colors.secondaryForeground ?? 'hsl(240 5.9% 10%)',
  '--cc-border': colors.border ?? 'hsl(240 5.9% 90%)',
}))
</script>

<template>
  <div
    v-if="isVisible"
    class="cc-fab"
    :style="cssVars"
  >
    <button
      type="button"
      class="cc-fab__btn"
      aria-label="Manage cookie settings"
      @click="openModal"
    >
      <svg
        class="cc-fab__icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
        <path d="M8.5 8.5v.01" />
        <path d="M16 15.5v.01" />
        <path d="M12 12v.01" />
        <path d="M11 17v.01" />
        <path d="M7 14v.01" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.cc-fab {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 50;
}
.cc-fab__btn {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: var(--cc-secondary);
  color: var(--cc-secondary-fg);
  border: 1px solid var(--cc-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease;
}
.cc-fab__btn:hover { transform: scale(1.05); }
.cc-fab__icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
