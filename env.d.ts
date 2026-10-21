/// <reference types="vite/client" />

// Settings read from .env files. Only names starting with VITE_ reach the page.
interface ImportMetaEnv {
  /** "laravel" to use the API in backend/; anything else reads the static preview in public/data. */
  readonly VITE_API_MODE?: string
  /** Full embed URL copied from Rumble's Share → Embed option. */
  readonly VITE_RUMBLE_EMBED_URL?: string
  /** Full embed URL copied from Odysee's Share → Embed option. */
  readonly VITE_ODYSEE_EMBED_URL?: string
  /** Full embed URL copied from BitChute's Share → Embed option. */
  readonly VITE_BITCHUTE_EMBED_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
