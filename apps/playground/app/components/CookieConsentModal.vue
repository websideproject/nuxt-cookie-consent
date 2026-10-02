<script setup lang="ts">
// Dependency-free override of the module's modal.
const {
  isOpen,
  categories,
  localConsentState,
  contextualMessage,
  acceptAll,
  saveSelection,
  closeModal,
} = useConsentModal()
</script>

<template>
  <div
    v-if="isOpen"
    class="cc-overlay"
    @click.self="closeModal"
  >
    <div
      class="cc-modal"
      role="dialog"
      aria-modal="true"
    >
      <header>
        <h2>{{ useConsentText('modalTitle')[0].content }}</h2>
        <p
          v-if="contextualMessage.length"
          class="cc-alert"
        >
          <template
            v-for="part in contextualMessage"
            :key="part.content"
          >
            <span>{{ part.content }}</span>
          </template>
        </p>
        <p class="cc-desc">
          <template
            v-for="part in useConsentText('modalDescription')"
            :key="part.content"
          >
            <a
              v-if="part.type === 'link'"
              :href="part.href"
              target="_blank"
              rel="noopener noreferrer"
            >{{ part.content }}</a>
            <span v-else>{{ part.content }}</span>
          </template>
        </p>
      </header>

      <div class="cc-body">
        <section
          v-for="[key, catConfig] in categories"
          :key="key"
          class="cc-cat"
        >
          <label class="cc-cat__head">
            <span>
              <strong>{{ useConsentText(`categories.${String(key)}.name`)[0].content }}</strong>
              <small>{{ useConsentText(`categories.${String(key)}.description`)[0].content }}</small>
            </span>
            <input
              v-model="localConsentState[key]"
              type="checkbox"
              :disabled="catConfig.readonly"
            >
          </label>
          <table v-if="catConfig.cookies && catConfig.cookies.length">
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
                <td><code>{{ cookie.id }}</code></td>
                <td>{{ cookie.provider }}</td>
                <td>{{ cookie.duration }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <footer>
        <button
          class="cc-btn cc-btn--ghost"
          @click="saveSelection"
        >
          {{ useConsentText('acceptSelectionBtn')[0].content }}
        </button>
        <button
          class="cc-btn"
          @click="acceptAll"
        >
          {{ useConsentText('acceptAllBtn')[0].content }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.cc-overlay { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 1rem; }
.cc-modal { background: #fff; color: #18181b; width: 100%; max-width: 640px; max-height: 85vh; overflow: auto; border-radius: 14px; padding: 1.5rem; }
.cc-modal h2 { margin: 0 0 .5rem; }
.cc-desc { font-size: .9rem; opacity: .8; }
.cc-desc a { color: #2563eb; }
.cc-alert { background: #fef3c7; border-radius: 8px; padding: .5rem .75rem; font-size: .85rem; }
.cc-cat { border-top: 1px solid rgba(127,127,127,.2); padding: 1rem 0; }
.cc-cat__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; cursor: pointer; }
.cc-cat__head small { display: block; opacity: .7; font-weight: 400; margin-top: .15rem; }
table { width: 100%; border-collapse: collapse; margin-top: .75rem; font-size: .8rem; }
th, td { text-align: left; padding: .35rem .5rem; border-bottom: 1px solid rgba(127,127,127,.15); }
footer { display: flex; justify-content: flex-end; gap: .5rem; border-top: 1px solid rgba(127,127,127,.2); padding-top: 1rem; margin-top: .5rem; }
.cc-btn { cursor: pointer; border: 0; border-radius: 8px; padding: .5rem 1rem; font-size: .85rem; background: #18181b; color: #fff; }
.cc-btn--ghost { background: transparent; color: #18181b; border: 1px solid rgba(127,127,127,.4); }
code { background: rgba(127,127,127,.18); padding: .1em .35em; border-radius: 4px; }
</style>
