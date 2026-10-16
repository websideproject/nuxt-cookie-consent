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
    const allConsents: Record<string, boolean> = {}
    Object.keys($consent.state.value).forEach(key => (allConsents[key] = true))
    $consent.updateState(allConsents)
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
    customize,
    colors,
    darkColors,
  }
}
