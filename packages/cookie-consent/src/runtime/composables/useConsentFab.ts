import { computed, useNuxtApp, useRuntimeConfig } from '#imports'

export function useConsentFab() {
  const { $consent } = useNuxtApp()
  const config = useRuntimeConfig().public.cookieConsent
  const colors = config.colors

  /**
   * Determines if the floating action button should be visible.
   */
  const isVisible = computed(() => {
    if ($consent.hasMadeChoice.value) return true
    if (!config.requiresInitialConsent) return true
    return false
  })

  /**
   * Opens the detailed settings modal.
   */
  function openModal() {
    $consent.isModalOpen.value = true
  }

  return {
    isVisible,
    openModal,
    colors,
  }
}
