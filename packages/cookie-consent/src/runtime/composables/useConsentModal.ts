import { ref, watch, computed, useNuxtApp, useRuntimeConfig } from '#imports'
import { useConsentText } from './useConsentText'
import type { CategoryOptions, ConsentCategory } from '../types'

export function useConsentModal() {
  const { $consent } = useNuxtApp()
  const config = useRuntimeConfig().public.cookieConsent

  // The categories to be rendered, derived from config.
  const categories = computed(() => Object.entries(config.categories) as [ConsentCategory, CategoryOptions][])

  // A local, temporary state for the switches in the modal.
  // This is only committed to the global state when the user saves.
  const localConsentState = ref<Record<ConsentCategory, boolean>>({ ...$consent.state.value })

  // The state for which accordion items are currently open.
  const openAccordions = ref(['necessary'])

  // Watch for the modal opening and sync the local state.
  // Note: We don't manage body scroll here - let Dialog/Drawer handle it
  watch($consent.isModalOpen, (isOpen) => {
    if (isOpen) {
      localConsentState.value = { ...$consent.state.value }
    }
  })

  // A message that appears if the modal was triggered for a specific reason.
  const contextualMessage = computed(() => {
    const context = $consent.requestContext.value
    if (!context) return []
    const categoryName = useConsentText(`categories.${context}.name`)[0]?.content ?? String(context)
    return useConsentText('contextMessage', { categoryName })
  })

  function acceptAll() {
    const committed = $consent.acceptAll()
    $consent.isModalOpen.value = false
    return committed
  }

  function rejectAll() {
    const committed = $consent.rejectAll()
    $consent.isModalOpen.value = false
    return committed
  }

  function saveSelection() {
    const committed = $consent.updateState(localConsentState.value)
    $consent.isModalOpen.value = false
    return committed
  }

  function closeModal() {
    $consent.isModalOpen.value = false
  }

  function toggleAccordion(key: string) {
    const index = openAccordions.value.indexOf(key)
    if (index === -1) {
      openAccordions.value.push(key)
    }
    else {
      openAccordions.value.splice(index, 1)
    }
  }

  return {
    isOpen: $consent.isModalOpen,
    colors: config.colors,
    darkColors: config.darkColors,
    categories,
    localConsentState,
    openAccordions,
    contextualMessage,
    acceptAll,
    rejectAll,
    saveSelection,
    closeModal,
    toggleAccordion,
  }
}
