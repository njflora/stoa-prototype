// The site's identity, in one place. Every name, title and line of wording
// that says whose site this is reads from here, so the site can take on
// another identity by changing this file, the logo component and the
// colour tokens. BRANDING.md explains how.
//
// It holds no imports, so vite.config.ts can read it too (for index.html).

export const brand = {
  /** The site's name: the header, the footer, page titles, notifications. */
  name: 'Stoa',

  /** One line about the site: the page description and the footer. */
  description: 'An unofficial concept for a modern media site.',

  /** The footer's line after the name. */
  footerLine: 'is an unofficial concept. Every show, host and episode is a placeholder.',

  /** The site's own video player, as the source picker names it beside Rumble and the rest. */
  playerName: 'Stoa',

  /** The welcome animation: the word above the colonnade, and the line under the name. */
  intro: {
    word: 'στοά',
    prompt: 'Break the seal to enter',
  },

  /**
   * The colours are the theme tokens in src/assets/main.css (@theme), named
   * here so this file shows the whole identity. Tailwind turns each into
   * classes: --color-accent gives bg-accent, text-accent and so on.
   */
  colourTokens: ['--color-ink', '--color-surface', '--color-raised', '--color-line', '--color-muted', '--color-accent', '--color-accent-bright', '--color-gold', '--color-live'],

  /** The wordmark or logo is a component: src/components/BrandLogo.vue. */
} as const

/** A page's title in the browser tab: "Agincourt · Stoa", or the name alone. */
export function pageTitle(page?: string): string {
  return page ? `${page} · ${brand.name}` : brand.name
}
