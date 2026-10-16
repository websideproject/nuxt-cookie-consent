<script setup lang="ts">
const { isVisible, openModal } = useConsentFab()
</script>

<template>
  <button
    v-if="isVisible"
    class="cc-fab"
    aria-label="Manage cookie settings"
    @click="openModal"
  >
    🍪
  </button>
</template>

<style scoped>
.cc-fab {
  position: fixed; bottom: 1rem; right: 1rem; z-index: 50;
  height: 3.25rem; width: 3.25rem; border-radius: 9999px; border: 1px solid rgba(127,127,127,.3);
  background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); font-size: 1.4rem; cursor: pointer;
}
</style>
