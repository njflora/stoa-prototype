// The live show's video sources. Each loads the platform's own documented
// iframe embed. Embed URLs come from .env.local (see .env.example); with
// none set, the player shows a placeholder for that source.

export type StreamSourceId = 'rumble' | 'odysee'

export interface StreamSource {
  id: StreamSourceId
  label: string
  /** The iframe URL, or null to show the placeholder. */
  embedUrl: string | null
}

/**
 * Only accept embed URLs on the platform's own embed path, so the frame
 * can never be pointed at another site by mistake.
 */
function checkedEmbedUrl(value: string | undefined, allowedPrefix: string): string | null {
  const url = value?.trim()
  if (!url) return null
  if (!url.startsWith(allowedPrefix)) {
    console.warn(`Ignoring embed URL that does not start with ${allowedPrefix}`)
    return null
  }
  return url
}

export const streamSources: StreamSource[] = [
  {
    id: 'rumble',
    label: 'Rumble',
    embedUrl: checkedEmbedUrl(import.meta.env.VITE_RUMBLE_EMBED_URL, 'https://rumble.com/embed/'),
  },
  {
    id: 'odysee',
    label: 'Odysee',
    embedUrl: checkedEmbedUrl(import.meta.env.VITE_ODYSEE_EMBED_URL, 'https://odysee.com/$/embed/'),
  },
]
