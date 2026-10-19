/// <reference types="vite/client" />

// Settings read from .env files. Only names starting with VITE_ reach the page.
interface ImportMetaEnv {
  /** Full embed URL copied from Rumble's Share → Embed option. */
  readonly VITE_RUMBLE_EMBED_URL?: string
  /** Full embed URL copied from Odysee's Share → Embed option. */
  readonly VITE_ODYSEE_EMBED_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
