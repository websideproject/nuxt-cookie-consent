import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

/**
 * Screenshots of the playground, compared against committed baselines. The baselines are also the images the docs
 * show (apps/docs/public/screenshots/, see playwright.config.ts), so a component that changes fails here until its
 * picture is refreshed — the docs cannot quietly go stale.
 *
 * The playground renders the module's built-in components (no overrides), so the pictures are what an app gets
 * out of the box. Nothing in them may depend on when or where they were taken:
 *   - storage: the decision lives in the `cookie_consent` cookie, and each test runs in a new browser context, so
 *     every test starts as a first visit;
 *   - font: Public Sans, committed in public/fonts;
 *   - locale, timezone, colour scheme, motion: pinned in playwright.config.ts. A `dark` shot emulates a dark system
 *     colour scheme; the colour mode follows it (preference `system`), and the module switches to `darkColors`.
 * The module talks to no server, so a page must send no write at all — each test checks.
 *
 * A shot's `act` steps are what a visitor does before the picture, written with the locators a person would use, so
 * they double as a script for recording the demo.
 *
 * Run and refresh: scripts/visual-baseline.sh.
 */

const DESKTOP = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }
// Tall enough for the whole modal (it scrolls inside itself above 90% of the viewport); the image is still `-1440`
const DESKTOP_TALL = { width: 1440, height: 1200 }

interface Shot {
  /** The image name, `<name>-<width>.png`, which is also the test title a refresh filters on. */
  name: string
  viewport: { width: number, height: number }
  /** What a visitor does before the picture. Each step waits for what it produced, so the picture never races it. */
  act?: (page: Page) => Promise<void>
  /** Photograph one part of the page instead of the whole viewport. */
  crop?: (page: Page) => Locator
  /** Taken with a dark system colour scheme; the image is `<name>-dark-<width>.png`. */
  dark?: boolean
}

const banner = (page: Page) => page.getByRole('region', { name: 'Cookie consent' })
const dialog = (page: Page) => page.getByRole('dialog')

const customize = async (page: Page, label = 'Customize') => {
  await banner(page).getByRole('button', { name: label }).click()
  await expect(dialog(page)).toBeVisible()
}

const SHOTS: Shot[] = [
  // First visit: the analytics cookie requires consent, so the banner shows
  { name: 'banner', viewport: DESKTOP },
  { name: 'banner', viewport: PHONE },

  // The settings modal: cookie categories with their provider/duration table, the cookieless one as a toggle only
  { name: 'modal', viewport: DESKTOP_TALL, crop: dialog, act: page => customize(page) },
  // Below 768px the same modal is a bottom sheet
  { name: 'drawer', viewport: PHONE, act: page => customize(page) },

  {
    // useRequestConsent('preferences'): the modal opens with the reason on top
    name: 'modal-request', viewport: DESKTOP_TALL, crop: dialog,
    act: async (page) => {
      await page.getByRole('button', { name: 'Switch colour mode (needs preferences)' }).click()
      await expect(dialog(page)).toContainText('please grant consent for Preference Cookies')
    },
  },
  {
    name: 'modal-de', viewport: DESKTOP_TALL, crop: dialog,
    act: async (page) => {
      // Switching the language asks for "preferences" first; dismissed (backdrop click), it switches anyway —
      // only remembering it needs the cookie
      await page.getByRole('button', { name: 'Switch language (EN/DE)' }).click()
      await expect(dialog(page)).toContainText('please grant consent for Preference Cookies')
      await page.locator('.cc-overlay').click({ position: { x: 5, y: 5 } })
      await expect(dialog(page)).toBeHidden()
      await customize(page, 'Anpassen')
      await expect(dialog(page)).toContainText('Cookie-Einstellungen')
    },
  },
  {
    // After "Accept All": the banner is gone, the floating button reopens the settings, and the consent-gated
    // script has loaded
    name: 'accepted', viewport: DESKTOP,
    act: async (page) => {
      await banner(page).getByRole('button', { name: 'Accept All' }).click()
      await expect(banner(page)).toBeHidden()
      await expect(page.getByRole('button', { name: 'Manage cookie settings' })).toBeVisible()
      await expect(page.getByTestId('analytics-script')).toContainText('loaded')
    },
  },

  // Dark mode: the page in Nuxt UI's dark theme, the module's components in their `darkColors`
  { name: 'banner', viewport: DESKTOP, dark: true },
  { name: 'modal', viewport: DESKTOP_TALL, dark: true, crop: dialog, act: page => customize(page) },
]

for (const shot of SHOTS) {
  const image = `${shot.name}${shot.dark ? '-dark' : ''}-${shot.viewport.width}`

  test.describe(() => {
    test.use({ viewport: shot.viewport, colorScheme: shot.dark ? 'dark' : 'light' })

    test(image, async ({ page }) => {
      // The module stores the decision in a cookie and calls no API: any request other than a read is a bug
      const writes: string[] = []
      page.on('request', (r) => {
        const method = r.method()
        if (method !== 'GET' && method !== 'HEAD') writes.push(`${method} ${r.url()}`)
      })
      const errors: string[] = []
      page.on('console', (m) => {
        if (/hydration/i.test(m.text()) || m.type() === 'error') errors.push(m.text())
      })
      page.on('pageerror', e => errors.push(e.message))

      await page.goto('/', { waitUntil: 'networkidle' })
      // Every test is a first visit
      await expect(banner(page)).toBeVisible()
      if (shot.act) {
        await shot.act(page)
        await page.mouse.move(0, 0)
      }
      await page.evaluate(() => document.fonts.ready)

      expect(writes, 'the module talks to no server, so nothing may be sent').toEqual([])
      // A mismatch leaves the server's HTML and the client's render mixed, differently on every run
      expect(errors, 'console errors or hydration mismatches').toEqual([])
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        'the page overflows the viewport horizontally',
      ).toBeLessThanOrEqual(shot.viewport.width)

      if (shot.crop) await expect(shot.crop(page)).toHaveScreenshot(`${image}.png`)
      else await expect(page).toHaveScreenshot(`${image}.png`)
    })
  })
}
