import { ref, computed, watch, onMounted, useNuxtApp } from '#imports'
import type { CookieOptions } from '#app'
import { useCookie } from '#app'
import type { ConsentCategory } from '../types'

export function useConsentCookie<T>(
  name: string,
  category: ConsentCategory,
  options: CookieOptions<T> = {},
) {
  const { $consent } = useNuxtApp()
  const hasConsent = computed(() => $consent.state.value[category] === true)
  const internalState = ref<T | null | undefined>(
    (options.default ? options.default() : null) as T | null,
  )

  const readFromCookie = () => {
    const cookie = useCookie<T>(name, { ...options, readonly: false })
    if (cookie.value !== null && cookie.value !== undefined) {
      internalState.value = cookie.value
    }
  }

  onMounted(() => {
    if (hasConsent.value) {
      readFromCookie()
    }
  })

  watch(hasConsent, (isGranted, wasGranted) => {
    if (isGranted && !wasGranted) {
      readFromCookie()
    }
  })

  const consentCookie = computed<T | null | undefined>({
    get() { return internalState.value },
    set(newValue) {
      internalState.value = newValue
      if (hasConsent.value) {
        useCookie<T>(name, { ...options, readonly: false }).value = newValue as T
      }
    },
  })

  return consentCookie
}
