// The platforms a show is published on, and what the player can load for
// each. One record per episode and platform comes from Laravel
// (episode_sources), so the player offers only the platforms an episode
// actually has.
//
// - Rumble, Odysee and BitChute load the platform's own documented iframe
//   embed. The demo's platform links are invented, so the player shows a
//   placeholder for them, unless a real test embed is set in .env.local
//   (see .env.example); that one plays for every episode.
// - VOD is the site's own hosting: a plain video file (or HLS stream) in the
//   site's own player. The demo points it at a CC0 clip, so it really plays.

import { heroVideo, mediaUrl } from './media'

export type Platform = 'rumble' | 'odysee' | 'bitchute' | 'vod'
export type SourceStatus = 'linked' | 'pending' | 'missing' | 'failed'

/** One platform's link for an episode (or the live show). */
export interface EpisodeSource {
  platform: Platform
  status: SourceStatus
  externalId?: string
  embedUrl?: string
  /** ISO date of the last sync with the platform. */
  syncedAt?: string
}

export const platformLabels: Record<Platform, string> = {
  rumble: 'Rumble',
  odysee: 'Odysee',
  bitchute: 'BitChute',
  vod: 'Stoa',
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

/** A real test embed per platform, from .env.local. */
const testEmbeds: Record<Exclude<Platform, 'vod'>, string | null> = {
  rumble: checkedEmbedUrl(import.meta.env.VITE_RUMBLE_EMBED_URL, 'https://rumble.com/embed/'),
  odysee: checkedEmbedUrl(import.meta.env.VITE_ODYSEE_EMBED_URL, 'https://odysee.com/$/embed/'),
  bitchute: checkedEmbedUrl(import.meta.env.VITE_BITCHUTE_EMBED_URL, 'https://www.bitchute.com/embed/'),
}

/** What the player shows for a source. */
export type Playable =
  | { kind: 'iframe'; url: string }
  | { kind: 'video'; sources: { src: string; type: string }[] }
  | { kind: 'placeholder' }

export function playableFor(source: EpisodeSource): Playable {
  if (source.platform !== 'vod') {
    const url = testEmbeds[source.platform]
    return url ? { kind: 'iframe', url } : { kind: 'placeholder' }
  }
  const file = source.embedUrl
  if (!file) return { kind: 'placeholder' }
  // The demo clip, with the Safari fallback HeroVideo uses too.
  if (file === heroVideo.webm) {
    return {
      kind: 'video',
      sources: [
        { src: mediaUrl(heroVideo.webm), type: 'video/webm' },
        { src: mediaUrl(heroVideo.mov), type: 'video/mp4' },
      ],
    }
  }
  const src = /^https:\/\//.test(file) ? file : mediaUrl(file)
  if (file.endsWith('.m3u8')) {
    // HLS plays natively in Safari; elsewhere it needs a library such as hls.js.
    const native = document.createElement('video').canPlayType('application/vnd.apple.mpegurl')
    return native ? { kind: 'video', sources: [{ src, type: 'application/vnd.apple.mpegurl' }] } : { kind: 'placeholder' }
  }
  return { kind: 'video', sources: [{ src, type: file.endsWith('.webm') ? 'video/webm' : 'video/mp4' }] }
}
