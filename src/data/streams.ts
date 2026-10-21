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
//   site's own player. The demo points it at a CC0 clip in several sizes,
//   so it really plays, and the quality menu really switches.

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

/** One file of a video, in one format. */
export interface VideoFile {
  src: string
  type: string
}

/**
 * One size of a video, such as "480p". Its files are the same picture in
 * different formats; the browser plays the first it can. "Auto" lets the
 * browser choose; with HLS it follows the connection.
 */
export interface Rendition {
  label: string
  files: VideoFile[]
}

/** What the player shows for a source. */
export type Playable =
  | { kind: 'iframe'; url: string }
  | { kind: 'video'; renditions: Rendition[] }
  | { kind: 'placeholder' }

const single = (files: VideoFile[]): Playable => ({ kind: 'video', renditions: [{ label: 'Auto', files }] })

export function playableFor(source: EpisodeSource): Playable {
  if (source.platform !== 'vod') {
    const url = testEmbeds[source.platform]
    return url ? { kind: 'iframe', url } : { kind: 'placeholder' }
  }
  const file = source.embedUrl
  if (!file) return { kind: 'placeholder' }
  // The demo clip, in the sizes Wikimedia Commons publishes it. Auto is the
  // 480p file, with the Safari fallback HeroVideo uses too. (Commons has no
  // larger copy a browser can play: the original is Ogg Theora.)
  if (file === heroVideo.webm) {
    const webm480 = { src: mediaUrl(heroVideo.webm), type: 'video/webm' }
    // The 360p file is MPEG-4 in a QuickTime box, which only Safari plays. Its
    // exact type means other browsers leave it out of the menu.
    const mov360 = { src: mediaUrl(heroVideo.mov), type: 'video/quicktime; codecs="mp4v"' }
    return {
      kind: 'video',
      renditions: [
        { label: 'Auto', files: [webm480, mov360] },
        { label: '480p', files: [webm480] },
        { label: '360p', files: [mov360] },
        { label: '240p', files: [{ src: mediaUrl(heroVideo.webm240), type: 'video/webm' }] },
      ],
    }
  }
  const src = /^https:\/\//.test(file) ? file : mediaUrl(file)
  if (file.endsWith('.m3u8')) {
    // HLS plays natively in Safari; elsewhere it needs a library such as hls.js.
    const native = document.createElement('video').canPlayType('application/vnd.apple.mpegurl')
    return native ? single([{ src, type: 'application/vnd.apple.mpegurl' }]) : { kind: 'placeholder' }
  }
  return single([{ src, type: file.endsWith('.webm') ? 'video/webm' : 'video/mp4' }])
}
