// Generates a catalogue at the real site's scale and writes it to
// public/data as static JSON, laid out like a paged API.
//
//   node scripts/data/generate.mjs
//
// Seeded, so every run gives the same catalogue. Formats follow the real
// site: running numbers ("The Stoa Podcast #1530"), "Show #N | Topic"
// titles, daily editions titled by date, view and comment counts.
// Access (free, free preview, members) is data, not a word in the title.

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT = join(ROOT, 'public', 'data')
const PAGE_SIZE = 50
const DAY = 86_400_000

// ---------- seeded randomness (same algorithm as src/utils/random.ts) ----------
function hashString(value) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
function seeded(seed) {
  let state = hashString(seed)
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const random = seeded('stoa-catalogue')
const pick = (list) => list[Math.floor(random() * list.length)]
const between = (min, max) => min + Math.floor(random() * (max - min + 1))

/**
 * Deals items in a shuffled order without repeats, like a deck of cards,
 * so no topic comes round twice within a show. If the deck runs out it
 * throws, which means the pool needs more combinations.
 */
function deck(name, items) {
  const order = [...items]
  const shuffle = seeded(name)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(shuffle() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return () => {
    if (!order.length) throw new Error(`The ${name} deck ran out. Add more subjects or angles.`)
    return order.pop()
  }
}
/** Every pairing of a subject with an angle, such as "The Bond Market: Who Blinks First?". */
const combine = (subjects, angles, join = (s, a) => (/[?!]$/.test(s) ? `${s} ${a}` : `${s}: ${a}`)) => subjects.flatMap((s) => angles.map((a) => join(s, a)))

// ---------- dates ----------
// Today at midnight, local time. The site moves every date forward by whole
// weeks to "now", so weekdays (and daily titles) stay correct.
const generatedAt = new Date()
generatedAt.setHours(0, 0, 0, 0)

function at(date, hour, minute = 0) {
  const d = new Date(date)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}
function isWeekday(date) {
  const day = date.getDay()
  return day !== 0 && day !== 6
}
/** Dates going back from yesterday, keeping only the given weekdays (0 is Sunday). */
function datesBack(count, days, startOffset = 1) {
  const out = []
  const d = new Date(generatedAt.getTime() - startOffset * DAY)
  while (out.length < count) {
    if (days.includes(d.getDay())) out.push(new Date(d))
    d.setTime(d.getTime() - DAY)
  }
  return out // newest first
}

// ---------- reference data ----------
const hosts = [
  { id: 'andrew', name: 'Andrew Pickering' },
  { id: 'richard', name: 'Richard Holloway' },
  { id: 'tom', name: 'Tom Heywood' },
  { id: 'rachel', name: 'Rachel Ashworth' },
  { id: 'neil', name: 'Neil Barraclough' },
  { id: 'helen', name: 'Helen Thwaite' },
  { id: 'danny', name: 'Danny Shaw' },
  { id: 'gary', name: 'Gary Lowther' },
  { id: 'sally', name: 'Sally Dunmore' },
]

const shows = [
  { id: 'stoa-podcast', name: 'The Stoa Podcast', tagline: 'The daily flagship, live every weekday', access: 'free', hostIds: ['andrew', 'richard', 'tom'], palette: ['#c04d93', '#2a0f22', '#f0a6ca'], streamedLive: true },
  { id: 'morning-brief', name: 'Morning Brief', tagline: 'The day ahead, in short segments every weekday morning', access: 'free', hostIds: ['danny'], palette: ['#d5b720', '#2a2205', '#f6e7a1'], streamedLive: true },
  { id: 'conversations', name: 'Conversations', tagline: 'Long-form interviews with interesting people', access: 'free', hostIds: ['richard'], palette: ['#8b5cf6', '#170d2e', '#d8c8ff'] },
  { id: 'chronos', name: 'Chronos', tagline: 'History told in full, series by series', access: 'premium', hostIds: ['helen'], palette: ['#2a9d8f', '#08221f', '#e9c46a'] },
  { id: 'statecraft', name: 'Statecraft', tagline: 'Geopolitics without the noise', access: 'premium', hostIds: ['rachel'], palette: ['#4f8fc0', '#0b1726', '#a8dadc'] },
  { id: 'ledger', name: 'Ledger', tagline: 'Economics you can actually use', access: 'premium', hostIds: ['neil'], palette: ['#6a994e', '#101b0c', '#e3f0c8'] },
  { id: 'the-forum', name: 'The Forum', tagline: 'The panel show, live for members', access: 'premium', hostIds: ['andrew', 'tom', 'danny', 'neil'], palette: ['#e76f51', '#260d06', '#f4a261'] },
]

// ---------- topic pools ----------
const newsTopics = [
  'Parliament Returns', 'The Budget Nobody Wanted', 'Energy Prices Bite', 'Strikes and Standstills', 'The Housing Question',
  'A Week in Westminster', 'Polls, Promises and Problems', 'The Border Debate', 'Free Speech on Trial', "Europe's New Mood",
  'The Cost of Net Zero', 'Councils in Crisis', 'The Reshuffle', 'Party Conference Season', 'The Leadership Contest',
  'Rail Fares Rise Again', 'The Grooming Gangs Inquiry', 'Inflation Returns', 'The Two-Child Cap', 'The Assisted Dying Bill',
  'Water Bills and Sewage', 'The Defence Review', 'Farmers on the March', 'Digital ID Cards', 'The Spending Review',
  'The By-Election', 'The Courts and the Commons', 'The Licence Fee', 'Teachers Walk Out', 'The Pension Triple Lock',
  'Grid Failures', 'A Cold Winter Ahead', 'The Trade Deal', 'Universities in Trouble', 'The Online Safety Act',
  'The Mayor Problem', 'Small Boats', 'Hospital Waiting Lists', 'The Smoking Ban', 'Prisons at Capacity',
  'The Sentencing Review', 'Local Elections Loom', 'Crime and the Cities', 'Cost of Living', 'Fuel Duty',
  'The Interest Rate Call', 'The Census Results', 'Green Belt Battles', 'The Steel Works', 'The Royal Visit',
]
// Morning Brief segments: a news subject with the day's angle on it.
const morningAngles = [
  'What Happens Next', 'The Numbers', 'Who Pays?', 'The Fallout', 'What the Papers Say', 'Five Things to Know',
  'The Reaction', 'Behind the Headlines', 'The Vote', 'Winners and Losers', 'The U-Turn', 'A Week On',
  'The Row Deepens', 'The Leaked Memo', 'Questions in the House', 'The Regional View', 'The Small Print',
  'Missing the Point', 'The Official Line', 'The Backlash', 'Read Between the Lines', 'The Deadline Looms',
  'What They Did Not Say', 'Counting the Cost', 'The Expert View', 'The Letters Page', 'Overnight Developments',
  'The Timeline', 'The Poll', 'The Promise', 'The Climbdown', 'Ministers Respond', 'The Opposition Responds',
  'Local Reaction', 'The Statistics', 'The Inquiry', 'The Report', 'Back to Square One', 'The Long View',
  'Fact Check', 'What It Means for You', 'The Morning After', 'The Compromise', 'Twelve Months On', 'The Hidden Cost',
]
const morningTopics = combine(newsTopics, morningAngles)
const historySeries = [
  ['Augustus', 4], ['The Plantagenets', 6], ['The Spanish Armada', 3], ['Alfred the Great', 4], ['The Crusades', 7],
  ['The Wars of the Roses', 6], ['Charlemagne', 4], ['The Glorious Revolution', 3], ['Hannibal', 4], ['The Black Death', 3],
  ['Elizabeth I', 5], ['The Normans', 5], ['Rome and Carthage', 4], ['The Tudors', 6], ['Athens and Sparta', 5],
  ['The Stuarts', 4], ['Alexander the Great', 5], ['The Vikings', 5], ['The Reformation', 4], ['Constantinople Falls', 3],
  ['Henry VIII', 7], ['The Anglo-Saxons', 5], ['The Fall of the Republic', 5], ['The Eastern Roman Empire', 4], ["The Hundred Years' War", 3],
]
const historyExtras = [
  'How Empires Decline', 'Reading the Ancients', 'Questions from Members', "The Historian's Toolkit", 'Myths of the Middle Ages',
  'The Art of the Archive', 'Castles Explained', 'Coins and Kings', 'The Great Libraries', 'Mapping the Medieval World',
  'Why Rome Fell (Again)', 'Siege Warfare', 'Saints and Relics', 'How We Date the Past', 'Lost Cities', 'Heralds and Heraldry',
  'Monks and Manuscripts', 'The Roads of Empire', 'Plague, Famine and Weather', 'Queens Who Ruled',
]
const geoTopics = [
  'The Great Energy Crunch', 'Elections Across the Gulf', "China's Long Game", 'The Arctic Scramble', 'Sanctions That Backfired',
  'Water Wars', 'The Shipping Lanes', "Africa's New Partners", 'The Balkan Question', 'Taiwan and the Strait',
  'The Sahel', 'Oil and OPEC', 'The Caucasus', 'India Rising', 'The Pacific Islands', 'Latin America Shifts',
  'The Baltic Front', 'Iran and the Bomb', 'The Red Sea', 'Turkey Between Worlds', 'The New Silk Road', 'Rare Earths',
]
const geoAngles = ['Who Holds the Cards?', 'The Map Explained', 'What Happens Next', 'Follow the Money', 'The View from London', 'Flashpoints', 'A Short History', 'The Players', 'Ten Years On', 'What the West Gets Wrong']
const econTopics = [
  'The Petrodollar Explained', 'Why Rents Keep Rising', 'Debt, Deficits and You', 'The Pension Problem', "Inflation's Long Tail",
  'What Productivity Means', 'Gold Standard Myths', 'Tax Code Tangles', 'The Basis of Empire', 'Big Ideas', 'Housing Supply',
  'The Bond Market', 'Central Banks', 'The Gig Economy', 'Trade and Tariffs', 'Wages and Migration', 'The Welfare Bill',
  'Energy Economics', 'Money Printing', 'The Stock Market', 'Small Business Britain', 'Austerity Revisited',
]
const econAngles = ['Who Blinks First?', 'The Numbers', 'Myths and Facts', 'What It Means for You', 'A Short History', 'The Winners', 'The Losers', 'The Case Against', 'Where Next?', 'Explained Simply']
const forumTopics = [
  'Who Would Win?', 'Films We Will Defend', 'The Best Decade for Music', 'Desert Island Books', 'Ranking Prime Ministers',
  'Underrated Inventions', 'The Great Debate Night', 'Worst Haircuts in History', 'Fantasy Cabinet', 'The Perfect Pub',
  'Board Games Tournament', 'Childhood TV', 'Best Battles in Film', 'Food Fight', 'The Ultimate Road Trip', 'Monty Python',
]
const forumEditions = ['The Eighties Edition', 'Listener Picks', 'Christmas Special', 'Grudge Match', 'The Rematch', 'Summer Special', 'Lightning Round', 'Members Choose', 'The Final', 'Away Day', 'Late Night', 'Rapid Fire']
// Conversations: a field and a framing, with a guest made from English first and last names.
const interviewFields = [
  'Archaeology', 'Farming', 'Biography', 'Publishing', 'Sleep', 'the Railways', 'Map-Making', 'Architecture', 'Shipbuilding',
  'Brewing', 'Beekeeping', 'Forestry', 'Medicine', 'Policing', 'Journalism', 'the Law', 'Teaching', 'Engineering', 'Fishing',
  'Astronomy', 'Church Music', 'Theatre', 'Translation', 'Diplomacy', 'Mining', 'Clockmaking', 'Bookbinding', 'Falconry',
  'Cartooning', 'Stonemasonry',
]
const interviewFramings = [(f) => `A Life in ${f}`, (f) => `The Future of ${f}`, (f) => `Why ${f} Matters`, (f) => `The Trouble with ${f}`, (f) => `Inside ${f}`]
const interviewTopics = interviewFields.flatMap((f) => interviewFramings.map((frame) => frame(f)))
const guestFirst = ['Peter', 'Joanne', 'Mark', 'Susan', 'Colin', 'Diane', 'Keith', 'Alan', 'Margaret', 'Graham', 'Ruth', 'Barry', 'Janet', 'Stephen', 'Pauline', 'Roger', 'Gillian', 'Martin', 'Carol', 'Derek']
const guestLast = ['Ridley', 'Hartley', 'Brindley', 'Elwood', 'Ashby', 'Marsh', 'Rowntree', 'Croft', 'Lyle', 'Pell', 'Ormerod', 'Holt', 'Fairclough', 'Bramwell', 'Catterall', 'Dunstan', 'Pickles', 'Whitworth', 'Sowerby', 'Heald']
const guests = combine(guestFirst, guestLast, (f, l) => `${f} ${l}`)

// ---------- episodes ----------
const episodes = []
const seqByShow = new Map()

function add(showId, fields) {
  episodes.push({ showId, ...fields })
}

// Popularity: views for the mainline, others scaled down; older items have had longer to collect views.
function views(base, ageDays) {
  const growth = Math.min(1, 0.25 + ageDays / 30)
  return Math.round(base * (0.6 + random() * 0.8) * growth)
}
function comments(viewCount, rate) {
  return Math.max(0, Math.round(viewCount * rate * (0.5 + random())))
}

// The Stoa Podcast: #1 to #1530, weekdays, live at 13:00.
{
  const dates = datesBack(1530, [1, 2, 3, 4, 5])
  dates.forEach((date, i) => {
    const number = 1530 - i
    const ageDays = (generatedAt - date) / DAY
    const v = views(4200, ageDays)
    add('stoa-podcast', {
      number,
      title: `The Stoa Podcast #${number}`,
      topics: [pick(newsTopics), pick(newsTopics), pick(newsTopics)].filter((t, j, a) => a.indexOf(t) === j),
      hostIds: ['andrew', 'richard', 'tom'],
      publishedAt: at(date, 13),
      durationMin: between(80, 110),
      access: 'free',
      live: true,
      views: v,
      comments: comments(v, 0.012),
    })
  })
}

// Morning Brief: three segments every weekday morning for about four years.
const nextMorning = deck('morning-brief', morningTopics)
{
  const dates = datesBack(1040, [1, 2, 3, 4, 5], 0)
  dates.forEach((date) => {
    const ageDays = (generatedAt - date) / DAY
    const segments = [nextMorning(), nextMorning()]
    // The main edition is titled by its date when displayed, so it never goes stale.
    const edition = views(800, ageDays)
    add('morning-brief', { edition: true, hostIds: ['danny'], publishedAt: at(date, 8), durationMin: 22, access: 'free', views: edition, comments: comments(edition, 0.008) })
    segments.forEach((topic, j) => {
      const v = views(350, ageDays)
      add('morning-brief', { title: `Morning Brief | ${topic}`, hostIds: ['danny'], publishedAt: at(date, 8, 30 + j * 15), durationMin: between(6, 12), access: 'free', views: v, comments: comments(v, 0.006) })
    })
  })
}

// Chronos: weekly on Sundays, in multi-part series, with occasional free extras.
{
  // Oldest series first, so the three named series end up most recent.
  // Its own random sequence, so edits to other shows never move these series.
  const planRandom = seeded('chronos-plan')
  const nextExtra = deck('chronos-extras', historyExtras)
  const plan = []
  for (const [name, parts] of historySeries) {
    for (let p = 1; p <= parts; p++) plan.push({ series: { name, part: p, of: parts } })
    if (planRandom() < 0.4) plan.push({ extra: nextExtra() })
  }
  const dates = datesBack(plan.length, [0], 1).reverse() // oldest first
  plan.forEach((item, i) => {
    const number = 160 + i
    const ageDays = (generatedAt - dates[i]) / DAY
    const v = views(1600, ageDays)
    const isExtra = !item.series
    add('chronos', {
      number,
      title: isExtra ? `Chronos #${number} | ${item.extra}` : `Chronos #${number} | ${item.series.name}, Part ${item.series.part}`,
      series: item.series,
      hostIds: ['helen'],
      publishedAt: at(dates[i], 13),
      durationMin: isExtra ? between(40, 55) : between(75, 95),
      access: isExtra ? 'freemium' : 'premium',
      views: v,
      comments: comments(v, 0.01),
    })
  })
}

// Weekly members' shows, each with the odd free preview.
function weekly(showId, count, day, hour, makeTitle, base, duration, previewEvery) {
  const dates = datesBack(count, [day], 1)
  dates.forEach((date, i) => {
    const ageDays = (generatedAt - date) / DAY
    const v = views(base, ageDays)
    const preview = i % previewEvery === previewEvery - 1
    add(showId, {
      ...makeTitle(count - i, preview),
      hostIds: shows.find((s) => s.id === showId).hostIds,
      publishedAt: at(date, hour),
      durationMin: preview ? between(12, 25) : between(duration[0], duration[1]),
      access: preview ? 'freemium' : 'premium',
      views: v,
      comments: comments(v, 0.012),
    })
  })
}
// A free preview is marked by its access, not by a word in the title.
const nextGeo = deck('statecraft', combine(geoTopics, geoAngles))
const nextEcon = deck('ledger', combine(econTopics, econAngles))
const nextForum = deck('the-forum', combine(forumTopics, forumEditions))
weekly('statecraft', 200, 2, 15, (n) => ({ number: n, title: `Statecraft #${n} | ${nextGeo()}` }), 2300, [60, 85], 15)
weekly('ledger', 200, 4, 11, (n) => ({ number: n, title: `Ledger #${n} | ${nextEcon()}` }), 2100, [45, 65], 15)
weekly('the-forum', 200, 5, 19, (n, preview) => ({ number: n, title: preview ? `The Forum #${n} | The Best Bits of #${n - 1}` : `The Forum #${n} | ${nextForum()}`, live: !preview }), 3800, [95, 125], 20)

// Conversations: long interviews, every week or so.
{
  const dates = datesBack(150, [3], 2)
  const nextTopic = deck('conversations', interviewTopics)
  const nextGuest = deck('guests', guests)
  dates.forEach((date) => {
    const ageDays = (generatedAt - date) / DAY
    const topic = nextTopic()
    const guest = nextGuest()
    const v = views(1100, ageDays)
    add('conversations', { title: `${topic} | Interview with ${guest}`, hostIds: ['richard'], publishedAt: at(date, 10), durationMin: between(55, 85), access: 'free', views: v, comments: comments(v, 0.008) })
  })
}

// ---------- ids, newest first per show ----------
const byShow = new Map()
for (const show of shows) {
  const list = episodes.filter((e) => e.showId === show.id).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  // Sequence numbers count up from the oldest, so ids never change as new episodes arrive.
  list.forEach((e, i) => {
    e.seq = list.length - i
    e.id = `${show.id}-${e.seq}`
  })
  byShow.set(show.id, list)
  seqByShow.set(show.id, list.length)
}

/** What a list card needs. The full record is the same here; a real API might trim more. */
const card = (e) => {
  const { seq, ...rest } = e
  return rest
}

// ---------- series ----------
const series = []
for (const e of [...byShow.get('chronos')].reverse()) {
  if (!e.series) continue
  let s = series.find((x) => x.name === e.series.name)
  if (!s) {
    s = { name: e.series.name, showId: 'chronos', episodes: [] }
    series.push(s)
  }
  s.episodes.push(card(e))
}
const descriptions = {
  'The Fall of the Republic': 'How the Roman Republic tore itself apart, from the Gracchi brothers to the Ides of March.',
  'The Eastern Roman Empire': 'The eastern empire that outlived Rome by a thousand years, and the gambles that kept it alive.',
  "The Hundred Years' War": 'A century of war between England and France over one disputed crown.',
}
const slugify = (name) => name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
for (const s of series) {
  s.slug = slugify(s.name)
  s.description = descriptions[s.name] ?? `${s.name}, told in ${s.episodes.length} parts.`
  s.totalMin = s.episodes.reduce((sum, e) => sum + e.durationMin, 0)
}
series.sort((a, b) => b.episodes.at(-1).publishedAt.localeCompare(a.episodes.at(-1).publishedAt))

// ---------- write ----------
rmSync(OUT, { recursive: true, force: true })
const write = (path, data) => {
  const file = join(OUT, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(data))
}

const showMeta = shows.map((s) => ({
  ...s,
  episodeCount: byShow.get(s.id).length,
  pageCount: Math.ceil(byShow.get(s.id).length / PAGE_SIZE),
  freePreview: card(byShow.get(s.id).find((e) => e.access === 'freemium') ?? byShow.get(s.id)[0]),
}))

const live = {
  showId: 'stoa-podcast',
  number: 1531,
  title: 'The Stoa Podcast #1531',
  hostIds: ['andrew', 'richard', 'tom'],
  viewers: 1984,
  startHour: 13,
}

write('meta.json', { generatedAt: generatedAt.toISOString(), pageSize: PAGE_SIZE, total: episodes.length })
write('shows.json', showMeta)
write('hosts.json', hosts)
write('series.json', series)
write('live.json', live)

for (const show of shows) {
  const list = byShow.get(show.id)
  for (let p = 0; p * PAGE_SIZE < list.length; p++) {
    write(`episodes/${show.id}/${p}.json`, { page: p, pageCount: Math.ceil(list.length / PAGE_SIZE), total: list.length, items: list.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE).map(card) })
  }
}

const newest = [...episodes].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
const latestOf = (showId, access) => byShow.get(showId).find((e) => !access || e.access === access)

// One request for everything the homepage shows first.
write('home.json', {
  featured: [latestOf('stoa-podcast'), latestOf('chronos', 'premium'), latestOf('conversations'), latestOf('statecraft', 'freemium')].map(card),
  startHere: shows.map((s) => ({
    showId: s.id,
    episode: card(s.access === 'free' ? byShow.get(s.id)[0] : (byShow.get(s.id).find((e) => e.access === 'freemium') ?? byShow.get(s.id).at(-1))),
  })),
  latest: newest.slice(0, 60).map(card),
  rows: Object.fromEntries(shows.map((s) => [s.id, byShow.get(s.id).slice(0, 20).map(card)])),
  seriesSlugs: series.slice(0, 12).map((s) => s.slug),
})

// What search needs for each episode, with short keys to keep the file small.
// i: id, t: title (empty for daily editions, which are titled by date),
// s: show, h: hosts, x: extra searchable text (topics, series), d: date, a: access, e: daily edition.
write(
  'search-docs.json',
  newest.map((e) => ({
    i: e.id,
    t: e.title ?? '',
    s: e.showId,
    h: e.hostIds,
    x: [...(e.topics ?? []), e.series?.name ?? ''].join(' ').trim(),
    d: e.publishedAt,
    a: e.access,
    ...(e.edition ? { e: 1 } : {}),
  })),
)

const counts = Object.fromEntries(shows.map((s) => [s.id, byShow.get(s.id).length]))
console.log('Episodes:', episodes.length, counts)
console.log('Series:', series.length)
