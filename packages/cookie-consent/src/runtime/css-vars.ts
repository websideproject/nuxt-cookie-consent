import type { ColorOptions } from './types'

const DEFAULT_LIGHT: ColorOptions = {
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(240 10% 3.9%)',
  primary: 'hsl(240 5.9% 10%)',
  primaryForeground: 'hsl(0 0% 98%)',
  secondary: 'hsl(240 4.8% 95.9%)',
  secondaryForeground: 'hsl(240 5.9% 10%)',
  border: 'hsl(240 5.9% 90%)',
  borderInput: 'hsl(240 5.9% 90%)',
}

const VARS: [string, keyof ColorOptions][] = [
  ['bg', 'background'],
  ['fg', 'foreground'],
  ['primary', 'primary'],
  ['primary-fg', 'primaryForeground'],
  ['secondary', 'secondary'],
  ['secondary-fg', 'secondaryForeground'],
  ['border', 'border'],
]

/**
 * The inline CSS variables the built-in components read: `--cc-<name>-light` from `colors`, `--cc-<name>-dark` from
 * `darkColors`. Each component's stylesheet picks one set as `--cc-<name>`, the dark one under a `.dark` ancestor
 * (the class Nuxt's color mode puts on <html>). An inline `--cc-<name>` could not be switched by a stylesheet, hence
 * the indirection. Without `darkColors` (`false`), the dark set repeats the light one.
 */
export function consentColorVars(colors: Partial<ColorOptions>, darkColors: Partial<ColorOptions> | false | undefined): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [name, key] of VARS) {
    const light = colors[key] ?? DEFAULT_LIGHT[key]
    vars[`--cc-${name}-light`] = light
    vars[`--cc-${name}-dark`] = (darkColors && darkColors[key]) || light
  }
  return vars
}
