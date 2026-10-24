import { computed, useNuxtApp, useRuntimeConfig } from '#imports'

export function useConsentBanner() {
  const { $consent } = useNuxtApp()
  const config = useRuntimeConfig().public.cookieConsent
  const colors = config.colors
  const darkColors = config.darkColors

  /**
   * Determines if the initial consent banner should be visible.
   */
  const isVisible = computed(() =>
    config.requiresInitialConsent && !$consent.hasMadeChoice.value,
  )

  /**
   * Accepts all cookie categories and closes the banner.
   */
  function acceptAll() {
    return $consent.acceptAll()
  }

  /**
   * Rejects every category that is not required and closes the banner.
   */
  function rejectAll() {
    return $consent.rejectAll()
  }

  /**
   * Opens the detailed settings modal.
   */
  function customize() {
    $consent.isModalOpen.value = true
  }

  return {
    isVisible,
    acceptAll,
    rejectAll,
    customize,
    colors,
    darkColors,
  }
}
