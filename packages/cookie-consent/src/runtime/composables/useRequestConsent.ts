import { useNuxtApp, watch } from '#imports'
import type { ConsentCategory } from '../types'

export const useRequestConsent = (category: ConsentCategory): Promise<boolean> => {
  const { $consent } = useNuxtApp()

  return new Promise((resolve) => {
    if ($consent.state.value[category]) {
      return resolve(true)
    }
    if (category === 'necessary') {
      return resolve(true)
    }
    $consent.setRequestContext(category)
    $consent.isModalOpen.value = true
    const stopWatch = watch($consent.isModalOpen, (isOpen) => {
      if (!isOpen) {
        stopWatch()
        $consent.setRequestContext(null)
        resolve($consent.state.value[category])
      }
    })
  })
}
