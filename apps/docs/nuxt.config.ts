// Nuxt 4.4 exempts a layer installed in node_modules from Nitro's "don't transpile node_modules" rule by its
// path, and only recognises npm's and pnpm's layouts. Under bun's isolated store the Docus layer lives at
// `node_modules/.bun/docus@<version>+<hash>/node_modules/docus/`: the exemption is built from the first
// `node_modules/`, the second one still matches, and Docus' TypeScript server routes (`sitemap.xml.ts`) reach
// Rollup untranspiled — "Expression expected", and the docs build fails. Exempt Docus in both layouts.
const DOCUS_EXCLUDE = /node_modules\/(?!(?:\.bun\/[^/]+\/node_modules\/)?docus\/)/

export default defineNuxtConfig({
  // Docus' OG images need an optional renderer (@takumi-rs/core) that is not installed, and every prerendered page
  // then fails. This app is the repo-local docs preview; the published docs (websideproject.com) render their own.

  hooks: {
    'nitro:config'(config) {
      config.esbuild ||= {}
      config.esbuild.options = { ...config.esbuild.options, exclude: [DOCUS_EXCLUDE] }
      // The same pattern decides which files get auto-imports (defineEventHandler, …).
      if (config.imports) config.imports.exclude = [DOCUS_EXCLUDE, /[\\/]\.git[\\/]/]
    },
  },
  ogImage: { enabled: false },
})
