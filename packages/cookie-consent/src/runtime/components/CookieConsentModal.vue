<script setup lang="ts">
import { computed } from '#imports'
import { useConsentModal } from '../composables/useConsentModal'
import { useConsentText } from '../composables/useConsentText'
import type { CategoryOptions, ConsentCategory } from '../types'

// Pure-CSS, dependency-free default (P12.M2): a native overlay dialog, responsive via a CSS media query
// (no @vueuse breakpoints). Renders each category by `kind` (P12.M8): `'cookie'` → provider/duration
// table; `'tracking'` → toggle + description only, no table. The consuming app overrides this by name.
const {
  isOpen,
  categories,
  localConsentState,
  contextualMessage,
  acceptAll,
  saveSelection,
  closeModal,
  colors,
} = useConsentModal()

const cssVars = computed(() => ({
  '--cc-bg': colors.background ?? 'hsl(0 0% 100%)',
  '--cc-fg': colors.foreground ?? 'hsl(240 10% 3.9%)',
  '--cc-primary': colors.primary ?? 'hsl(240 5.9% 10%)',
  '--cc-primary-fg': colors.primaryForeground ?? 'hsl(0 0% 98%)',
  '--cc-secondary': colors.secondary ?? 'hsl(240 4.8% 95.9%)',
  '--cc-secondary-fg': colors.secondaryForeground ?? 'hsl(240 5.9% 10%)',
  '--cc-border': colors.border ?? 'hsl(240 5.9% 90%)',
}))

function categoryDescription(key: ConsentCategory, cat: CategoryOptions): string {
  return cat.description || useConsentText(`categories.${key}.description`)[0].content
}
function isCookieKind(cat: CategoryOptions): boolean {
  return (cat.kind ?? 'cookie') === 'cookie'
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="cc-overlay"
      :style="cssVars"
      @click.self="closeModal"
    >
      <div
        class="cc-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header class="cc-dialog__header">
          <h2 class="cc-dialog__title">
            {{ useConsentText('modalTitle')[0].content }}
          </h2>
          <p
            v-if="contextualMessage.length"
            class="cc-dialog__alert"
          >
            <template
              v-for="part in contextualMessage"
              :key="part.content"
            >
              <span v-if="part.type === 'string'">{{ part.content }}</span>
            </template>
          </p>
          <p class="cc-dialog__desc">
            <template
              v-for="part in useConsentText('modalDescription')"
              :key="part.content"
            >
              <a
                v-if="part.type === 'link'"
                :href="part.href"
                target="_blank"
                rel="noopener noreferrer"
                class="cc-link"
              >{{ part.content }}</a>
              <span v-else>{{ part.content }}</span>
            </template>
          </p>
        </header>

        <div class="cc-dialog__body">
          <section
            v-for="[key, catConfig] in categories"
            :key="key"
            class="cc-cat"
          >
            <div class="cc-cat__head">
              <div class="cc-cat__meta">
                <h3 class="cc-cat__name">
                  {{ useConsentText(`categories.${key}.name`)[0].content }}
                </h3>
                <p class="cc-cat__desc">
                  {{ categoryDescription(key, catConfig) }}
                </p>
              </div>
              <label
                class="cc-switch"
                :class="{ 'cc-switch--disabled': catConfig.readonly }"
              >
                <input
                  v-model="localConsentState[key]"
                  type="checkbox"
                  :disabled="catConfig.readonly"
                  @click.stop
                >
                <span class="cc-switch__track"><span class="cc-switch__thumb" /></span>
              </label>
            </div>

            <!-- cookie kind → provider/duration table -->
            <table
              v-if="isCookieKind(catConfig) && catConfig.cookies && catConfig.cookies.length"
              class="cc-table"
            >
              <thead>
                <tr>
                  <th>{{ useConsentText('cookieId')[0].content }}</th>
                  <th>{{ useConsentText('cookieProvider')[0].content }}</th>
                  <th>{{ useConsentText('cookieDuration')[0].content }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="cookie in catConfig.cookies"
                  :key="cookie.id"
                >
                  <td>
                    <code class="cc-badge">{{ cookie.id }}</code>
                    <p class="cc-cat__desc">
                      {{ useConsentText(cookie.descriptionKey)[0].content }}
                    </p>
                  </td>
                  <td>{{ cookie.provider }}</td>
                  <td>{{ cookie.duration }}</td>
                </tr>
              </tbody>
            </table>
            <!-- tracking kind (or a cookie category with no cookies) → description only, no table -->
          </section>
        </div>

        <footer class="cc-dialog__footer">
          <button
            type="button"
            class="cc-btn cc-btn--outline"
            @click="saveSelection"
          >
            {{ useConsentText('acceptSelectionBtn')[0].content }}
          </button>
          <button
            type="button"
            class="cc-btn cc-btn--primary"
            @click="acceptAll"
          >
            {{ useConsentText('acceptAllBtn')[0].content }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.cc-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  color: var(--cc-fg);
}
.cc-dialog {
  background: var(--cc-bg);
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  overflow: hidden;
}
.cc-dialog__header {
  padding: 1.25rem 1.25rem 0.5rem;
  border-bottom: 1px solid var(--cc-border);
}
.cc-dialog__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}
.cc-dialog__alert {
  font-size: 0.85rem;
  margin: 0 0 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--cc-border);
  border-radius: 0.5rem;
  background: var(--cc-secondary);
  color: var(--cc-secondary-fg);
}
.cc-dialog__desc {
  font-size: 0.85rem;
  opacity: 0.85;
  margin: 0 0 0.75rem;
}
.cc-link { color: inherit; text-underline-offset: 2px; }
.cc-dialog__body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1.25rem;
}
.cc-cat {
  padding: 1rem 0;
  border-bottom: 1px solid var(--cc-border);
}
.cc-cat:last-child { border-bottom: none; }
.cc-cat__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.cc-cat__name { font-size: 0.95rem; font-weight: 600; margin: 0 0 0.15rem; }
.cc-cat__desc { font-size: 0.8rem; opacity: 0.75; margin: 0.15rem 0 0; }
.cc-badge {
  display: inline-block;
  font-family: ui-monospace, monospace;
  font-size: 0.7rem;
  padding: 0.1rem 0.35rem;
  border-radius: 0.3rem;
  background: var(--cc-secondary);
  color: var(--cc-secondary-fg);
}
.cc-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
  font-size: 0.8rem;
}
.cc-table th,
.cc-table td {
  text-align: left;
  padding: 0.4rem 0.5rem;
  border-top: 1px solid var(--cc-border);
  vertical-align: top;
}
.cc-table th { opacity: 0.7; font-weight: 600; }

/* toggle switch (styled checkbox) */
.cc-switch {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  display: inline-flex;
}
.cc-switch--disabled { cursor: not-allowed; opacity: 0.6; }
.cc-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
.cc-switch__track {
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: var(--cc-secondary);
  border: 1px solid var(--cc-border);
  display: inline-flex;
  align-items: center;
  transition: background 0.15s ease;
}
.cc-switch__thumb {
  width: 0.9rem;
  height: 0.9rem;
  margin: 0 0.15rem;
  border-radius: 9999px;
  background: var(--cc-bg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease;
}
.cc-switch input:checked + .cc-switch__track {
  background: var(--cc-primary);
}
.cc-switch input:checked + .cc-switch__track .cc-switch__thumb {
  transform: translateX(1rem);
}
.cc-dialog__footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--cc-border);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
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
.cc-btn--primary { background: var(--cc-primary); color: var(--cc-primary-fg); }
.cc-btn--outline { background: transparent; color: var(--cc-fg); border-color: var(--cc-border); }

/* desktop: center the dialog as a rounded card instead of a bottom sheet */
@media (min-width: 768px) {
  .cc-overlay { align-items: center; padding: 1rem; }
  .cc-dialog {
    max-width: 42rem;
    border-radius: 1rem;
    max-height: 90vh;
  }
}
</style>
