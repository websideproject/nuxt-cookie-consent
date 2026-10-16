<script setup lang="ts">
const { isDark, toggle } = useColorModeToggle()
</script>

<template>
  <!-- The server cannot know the system colour mode, so the icon renders in the browser only -->
  <ClientOnly>
    <UButton
      :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
      color="neutral"
      variant="ghost"
      :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
      @click="toggle"
    />
    <template #fallback>
      <div class="size-8" />
    </template>
  </ClientOnly>
</template>
