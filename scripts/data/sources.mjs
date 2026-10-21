// Where each episode is published: Rumble, Odysee, BitChute and the site's
// own video on demand (VOD). Written into the seed data by generate.mjs;
// Laravel stores one row per episode and platform (episode_sources), and
// the platform sync (stage F) keeps them current.
//
// Which platforms carry which shows:
// - The Stoa Podcast and Morning Brief: all four.
// - Conversations: Rumble, Odysee and VOD.
// - Members' shows: VOD only, with free previews also on Rumble.
//
// VOD is the source of truth and always linked. The mirrors lag behind: the
// newest episodes are still "pending" there, and now and then a link is
// missing or failed, so the content desk has something to show.
//
// The platform ids are invented, so their embed links lead nowhere; the
// player shows a placeholder for them unless a real test embed is set in
// .env.local. VOD points at the CC0 ocean clip already in the site, so the
// site's own player really plays.

const VOD_DEMO_FILE = 'media/hero-loop.webm'
const HOUR = 3_600_000

const platformsFor = (episode) => {
  if (episode.showId === 'stoa-podcast' || episode.showId === 'morning-brief') return ['rumble', 'odysee', 'bitchute', 'vod']
  if (episode.showId === 'conversations') return ['rumble', 'odysee', 'vod']
  return episode.access === 'freemium' ? ['rumble', 'vod'] : ['vod']
}

/** A string of `length` characters from the alphabet, from the random sequence. */
const token = (random, length, alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789') =>
  Array.from({ length }, () => alphabet[Math.floor(random() * alphabet.length)]).join('')

const slugOf = (episode) =>
  (episode.title ?? `${episode.showId} ${episode.publishedAt.slice(0, 10)}`)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

/** One platform's link for one episode. */
function link(platform, episode, random) {
  switch (platform) {
    case 'rumble': {
      const id = `v${token(random, 6)}`
      return { externalId: id, embedUrl: `https://rumble.com/embed/${id}/` }
    }
    case 'odysee': {
      const claim = token(random, 40, '0123456789abcdef')
      const slug = slugOf(episode)
      return { externalId: `${slug}:${claim}`, embedUrl: `https://odysee.com/$/embed/@stoa:0/${slug}:${claim.slice(0, 1)}` }
    }
    case 'bitchute': {
      const id = token(random, 12, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
      return { externalId: id, embedUrl: `https://www.bitchute.com/embed/${id}/` }
    }
    default:
      return { externalId: `${episode.showId}/${episode.seq}`, embedUrl: VOD_DEMO_FILE }
  }
}

/**
 * Every episode's sources, as [{ episodeId, platform, status, externalId,
 * embedUrl, syncedAt }]. `now` is when the catalogue was generated;
 * `seededRandom` is the generator's seeded() function.
 */
export function buildSources({ episodes, now, seededRandom }) {
  const lastSync = new Date(now.getTime() - 20 * 60_000).toISOString()
  const rows = []
  for (const episode of episodes) {
    const random = seededRandom(`${episode.id}:sources`)
    const published = new Date(episode.publishedAt).getTime()
    const recent = now.getTime() - published < 6 * HOUR
    for (const platform of platformsFor(episode)) {
      const roll = random()
      let status = 'linked'
      if (platform !== 'vod') {
        if (recent && platform !== 'rumble') status = 'pending'
        else if (platform === 'bitchute' && roll < 0.03) status = 'missing'
        else if (platform === 'odysee' && roll < 0.015) status = 'missing'
        else if (roll > 0.996) status = 'failed'
      }
      const found = status === 'linked' ? link(platform, episode, random) : {}
      rows.push({
        episodeId: episode.id,
        platform,
        status,
        ...found,
        // Linked: when the sync found it, a little after release. Otherwise: the last check.
        syncedAt: status === 'linked' ? new Date(Math.min(published + (20 + random() * 100) * 60_000, now.getTime())).toISOString() : lastSync,
      })
    }
  }
  return rows
}

/** The live show streams on every platform at once. */
export const liveSources = [
  { platform: 'rumble', status: 'linked' },
  { platform: 'odysee', status: 'linked' },
  { platform: 'bitchute', status: 'linked' },
  { platform: 'vod', status: 'linked', embedUrl: VOD_DEMO_FILE },
]
