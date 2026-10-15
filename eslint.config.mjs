// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: true,
  },
  dirs: {
    src: [
      './apps',
      './packages',
    ],
  },
})
  .append(
    {
      rules: {
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'vue/no-mutating-props': 'off',
        '@stylistic/max-statements-per-line': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
        'jsdoc/check-param-names': 'off',
        'no-empty': 'off'
      },
    }
  )
