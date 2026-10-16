import { describe, it, expect } from 'vitest'
import { consentColorVars } from '../src/runtime/css-vars'

// The components' inline colour variables: a light set from `colors`, a dark set from `darkColors`.
describe('consentColorVars', () => {
  it('emits a light and a dark variable per colour', () => {
    const vars = consentColorVars({ background: 'white' }, { background: 'black' })
    expect(vars['--cc-bg-light']).toBe('white')
    expect(vars['--cc-bg-dark']).toBe('black')
  })

  it('repeats the light colours in dark mode when darkColors is false', () => {
    const vars = consentColorVars({ primary: 'tomato' }, false)
    expect(vars['--cc-primary-dark']).toBe('tomato')
  })

  it('a dark colour left out falls back to its light one, a light one to the built-in default', () => {
    const vars = consentColorVars({ border: 'gray' }, { background: 'black' })
    expect(vars['--cc-border-dark']).toBe('gray')
    expect(vars['--cc-fg-light']).toBe('hsl(240 10% 3.9%)')
  })
})
