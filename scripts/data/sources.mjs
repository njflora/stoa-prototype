// Where each episode is published: Rumble, Odysee, BitChute and the site's
// own video on demand (VOD). Written into the seed data by generate.mjs;
// Laravel stores one row per episode and platform (episode_sources), and
// the platform sync (stage F) keeps them current.
//
// Which platforms carry which shows (a design decision):
// - Shows that air live (The Stoa Podcast, Morning Brief, The Forum), and
//   the live stream itself: Rumble, Odysee and VOD.
// - Shows that do not (Chronos, Ledger, Statecraft, Conversations):
//   Rumble, BitChute and VOD.
// Members' episodes are on the platforms too; the API only hands their
// links to people who may watch.
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

const platformsFor = (episode, liveShowIds) =>
  liveShowIds.includes(episode.showId) ? ['rumble', 'odysee', 'vod'] : ['rumble', 'bitchute', 'vod']

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
      return {
        externalId: `${slug}:${claim}`,
        embedUrl: `https://odysee.com/$/embed/@stoa:0/${slug}:${claim.slice(0, 1)}`,
      }
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
export function buildSources({ episodes, liveShowIds, now, seededRandom }) {
  const lastSync = new Date(now.getTime() - 20 * 60_000).toISOString()
  const rows = []
  for (const episode of episodes) {
    const random = seededRandom(`${episode.id}:sources`)
    const published = new Date(episode.publishedAt).getTime()
    const recent = now.getTime() - published < 6 * HOUR
    for (const platform of platformsFor(episode, liveShowIds)) {
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
        syncedAt:
          status === 'linked'
            ? new Date(Math.min(published + (20 + random() * 100) * 60_000, now.getTime())).toISOString()
            : lastSync,
      })
    }
  }
  return rows
}

/** The live stream: Rumble, Odysee and the site's own player, at once. */
export const liveSources = [
  { platform: 'rumble', status: 'linked' },
  { platform: 'odysee', status: 'linked' },
  { platform: 'vod', status: 'linked', embedUrl: VOD_DEMO_FILE },
]

// ---------- sample platform feeds, for the sync ----------
// Recorded feeds the platform sync (php artisan stoa:sync --fixtures) reads
// instead of the live platforms. Each is in the platform's own shape:
// Odysee's claim_search JSON, BitChute's RSS, a simple Rumble list (its real
// API is to verify), and a listing from the site's own video storage. Each
// holds the newest uploads (already linked: nothing to do), the ones still
// pending or missing (the sync links them), and a few clips that are not
// episodes (left unmatched). Titles follow each platform's habits, so the
// matcher has to normalise them.

const MINUTE = 60_000
const titleOf = (episode, shows) =>
  episode.title ?? `${shows.get(episode.showId)} | ${new Date(episode.publishedAt).toUTCString().slice(0, 16)}`
const clips = ['Clip: Tom on the budget', 'Highlights of the week', 'Behind the scenes at Stoa']

export function buildFeeds({ episodes, sources, shows, now, seededRandom }) {
  const random = seededRandom('feeds')
  const byId = new Map(episodes.map((e) => [e.id, e]))
  const names = new Map(shows.map((s) => [s.id, s.name]))
  const items = { rumble: [], odysee: [], bitchute: [], vod: [] }

  // Newest first, so "the newest uploads" are the first of each platform's rows.
  const rows = [...sources].sort((a, b) =>
    byId.get(b.episodeId).publishedAt.localeCompare(byId.get(a.episodeId).publishedAt),
  )
  const taken = { rumble: 0, odysee: 0, bitchute: 0, vod: 0 }
  let missingSeen = 0
  for (const row of rows) {
    const episode = byId.get(row.episodeId)
    const include =
      (row.status === 'linked' && taken[row.platform] < 12) ||
      row.status === 'pending' ||
      (row.status === 'missing' && missingSeen++ % 2 === 0)
    if (!include) continue
    taken[row.platform]++
    const delay = { rumble: 5, odysee: 30, bitchute: 90, vod: 1 }[row.platform] + random() * 60
    items[row.platform].push({ episode, at: new Date(new Date(episode.publishedAt).getTime() + delay * MINUTE), row })
  }
  const id = (length, alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789') =>
    Array.from({ length }, () => alphabet[Math.floor(random() * alphabet.length)]).join('')
  const clipTimes = clips.map((_, i) => new Date(now.getTime() - (3 + i * 5) * 3_600_000 - 17 * MINUTE))

  const rumble = {
    videos: [
      ...items.rumble.map(({ episode, at, row }) => {
        const vid = row.externalId ?? `v${id(6)}`
        return {
          id: vid,
          title: titleOf(episode, names),
          published_at: at.toISOString(),
          embed_url: `https://rumble.com/embed/${vid}/`,
        }
      }),
      ...clips.map((title, i) => ({
        id: `v${id(6)}`,
        title,
        published_at: clipTimes[i].toISOString(),
        embed_url: null,
      })),
    ],
  }
  const odysee = {
    result: {
      items: [
        ...items.odysee.map(({ episode, at, row }) => {
          // A link already made keeps its id; a new upload gets a new one.
          const [name, claim] = row.externalId
            ? row.externalId.split(':')
            : [
                titleOf(episode, names)
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, '')
                  .slice(0, 60),
                id(40, '0123456789abcdef'),
              ]
          // Odysee titles here carry the channel's suffix, which the matcher strips.
          return {
            claim_id: claim,
            name,
            canonical_url: `lbry://@stoa#0/${name}#${claim[0]}`,
            value: {
              title: `${titleOf(episode, names)} - Stoa`,
              release_time: String(Math.floor(at.getTime() / 1000)),
            },
          }
        }),
        ...clips.map((title, i) => ({
          claim_id: id(40, '0123456789abcdef'),
          name: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          canonical_url: null,
          value: { title, release_time: String(Math.floor(clipTimes[i].getTime() / 1000)) },
        })),
      ],
    },
  }
  const rssItem = (title, link, guid, at) =>
    `    <item>\n      <title><![CDATA[${title}]]></title>\n      <link>${link}</link>\n      <guid>${guid}</guid>\n      <pubDate>${at.toUTCString()}</pubDate>\n    </item>`
  const bitchute = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    '    <title>Stoa</title>',
    ...items.bitchute.map(({ episode, at, row }) => {
      const vid = row.externalId ?? id(12, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
      // BitChute titles here use plain dashes and capitals, which the matcher normalises.
      return rssItem(
        titleOf(episode, names).replace(/ \| /g, ' - ').toUpperCase(),
        `https://www.bitchute.com/video/${vid}/`,
        vid,
        at,
      )
    }),
    ...clips.map((title, i) => rssItem(title, `https://www.bitchute.com/video/${id(12)}/`, id(12), clipTimes[i])),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
  const vod = {
    assets: items.vod.map(({ episode, at }) => ({
      path: `${episode.showId}/${episode.seq}`,
      file: 'media/hero-loop.webm',
      uploaded_at: at.toISOString(),
    })),
  }
  return { rumble, odysee, bitchute, vod }
}
