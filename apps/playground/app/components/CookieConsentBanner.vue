<script setup lang="ts">
// Dependency-free override of the module's banner. Uses the module's composables.
const { isVisible, acceptAll, customize } = useConsentBanner()
</script>

<template>
  <div
    v-if="isVisible"
    class="cc-banner"
  >
    <p>
      <template
        v-for="part in useConsentText('bannerDescription')"
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
    <div class="cc-banner__actions">
      <button
        class="cc-btn cc-btn--ghost"
        @click="customize"
      >
        {{ useConsentText('customizeBtn')[0].content }}
      </button>
      <button
        class="cc-btn"
        @click="acceptAll"
      >
        {{ useConsentText('acceptAllBtn')[0].content }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cc-banner {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 1rem 1.5rem; background: #1f1f23; color: #fafafa; border-top: 1px solid rgba(255,255,255,.12);
}
.cc-banner p { margin: 0; font-size: .9rem; max-width: 60ch; }
.cc-banner a { color: #93c5fd; }
.cc-banner__actions { display: flex; gap: .5rem; }
.cc-btn { cursor: pointer; border: 0; border-radius: 8px; padding: .5rem 1rem; font-size: .85rem; background: #fafafa; color: #18181b; }
.cc-btn--ghost { background: transparent; color: #fafafa; border: 1px solid rgba(255,255,255,.3); }
</style>
