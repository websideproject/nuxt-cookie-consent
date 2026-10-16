// The colour mode is a preference cookie (`theme_preference`, see nuxt.config.ts): it changes — and is stored — only
// once `preferences` is granted. Without that consent, the toggle asks for it first (useRequestConsent).
export function useColorModeToggle() {
  const colorMode = useColorMode()
  const isDark = computed(() => colorMode.value === 'dark')

  async function toggle() {
    if (!(await useRequestConsent('preferences'))) return
    colorMode.preference = isDark.value ? 'light' : 'dark'
  }

  return { isDark, toggle }
}
