// Generates a catalogue at the real site's scale and writes it as seed data
// for the Laravel API (backend/database/seed). Laravel is the source of
// truth: it loads these files, serves them, and exports the static preview
// in public/data (`php artisan stoa:export`).
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
import { articles as articleSources } from './articles.mjs'
import { buildExtras } from './extras.mjs'
import { buildFeeds, buildSources, liveSources } from './sources.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT = join(ROOT, 'backend', 'database', 'seed')
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
// A fixed day: midnight on 20 October 2026, UK time. Fixed, so every run
// gives the same catalogue whatever day it runs. The site moves every date
// forward by whole weeks to "now", so weekdays (and daily titles) stay correct.
const generatedAt = new Date('2026-10-19T23:00:00.000Z')

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
    // A calendar day back, not 24 hours: across a clock change, 24 hours
    // lands on the same day twice or skips one.
    d.setDate(d.getDate() - 1)
  }
  return out // newest first
}

// ---------- reference data ----------
// Contributors. Names, roles and bios are invented for the demo.
const hosts = [
  { id: 'andrew', name: 'Andrew Pickering', role: 'Presenter, The Stoa Podcast', bio: 'Andrew has presented The Stoa Podcast since its first episode. Before that he spent a decade in local radio, and he still thinks the best interviews happen after the microphones are meant to be off.' },
  { id: 'richard', name: 'Richard Holloway', role: 'Presenter, Conversations', bio: 'Richard hosts Conversations, the long-form interview show. A former bookseller, he reads everything his guests have written before they sit down, and usually a few things they would rather he had not.' },
  { id: 'tom', name: 'Tom Heywood', role: 'Presenter, The Stoa Podcast and The Forum', bio: 'Tom chairs The Forum and is a regular on The Stoa Podcast. He writes about culture and comedy, and keeps a running list of sitcoms that deserved a third series.' },
  { id: 'rachel', name: 'Rachel Ashworth', role: 'Host, Statecraft', bio: 'Rachel hosts Statecraft, the geopolitics show. She worked in shipping insurance before turning to writing, which is why she can explain a strait closure in terms of who pays.' },
  { id: 'neil', name: 'Neil Barraclough', role: 'Host, Ledger', bio: 'Neil hosts Ledger, the economics show for people who do not like economics shows. He spent years as a credit analyst and now tries to explain bond markets without using the word "yield" more than twice.' },
  { id: 'helen', name: 'Helen Thwaite', role: 'Historian and host, Chronos', bio: 'Helen writes and presents Chronos, telling history in full, series by series. Her particular interests are the late Roman Republic and the Hundred Years\' War, and she has opinions about both.' },
  { id: 'danny', name: 'Danny Shaw', role: 'Host, Morning Brief', bio: 'Danny gets up before everyone else to present Morning Brief, the day ahead in short segments. He has read more newspapers before eight o\'clock than most people read in a week.' },
  { id: 'gary', name: 'Gary Lowther', role: 'Political correspondent', bio: 'Gary covers politics, from Westminster to the town hall. He is a regular on The Stoa Podcast and The Forum, and writes about elections, committees and the parts of Parliament that rarely make the news.' },
  { id: 'sally', name: 'Sally Dunmore', role: 'Economics writer', bio: 'Sally writes about public money: debt, tax and spending. She sits in on The Stoa Podcast and covers Morning Brief when Danny is away.' },
]

// Line-ups rotate, as they do on a real show. Their own random sequence,
// so the rest of the catalogue stays the same as before.
const rota = seeded('host-rotation')
/** `count` hosts from `pool`, with `anchor` present most of the time, in pool order. */
function lineup(pool, count, anchor, anchorChance) {
  const chosen = new Set(rota() < anchorChance ? [anchor] : [])
  while (chosen.size < count) chosen.add(pool[Math.floor(rota() * pool.length)])
  return pool.filter((id) => chosen.has(id))
}

// Each show's slot is the one definition of when it airs: the episode dates
// below, the schedule line on its page and the live page's "Coming up live"
// all come from it, so they can never disagree. days: 0 is Sunday.
// unit: what a new release is called, for the schedule line.
const WEEKDAYS = [1, 2, 3, 4, 5]
const shows = [
  { id: 'stoa-podcast', name: 'The Stoa Podcast', tagline: 'The daily flagship, live every weekday', access: 'free', hostIds: ['andrew', 'richard', 'tom'], palette: ['#c04d93', '#2a0f22', '#f0a6ca'], streamedLive: true, slot: { days: WEEKDAYS, hour: 13, minute: 0, live: true }, unit: 'episodes' },
  { id: 'morning-brief', name: 'Morning Brief', tagline: 'The day ahead, in short segments every weekday morning', access: 'free', hostIds: ['danny'], palette: ['#d5b720', '#2a2205', '#f6e7a1'], streamedLive: true, slot: { days: WEEKDAYS, hour: 8, minute: 0, live: true }, unit: 'editions' },
  { id: 'conversations', name: 'Conversations', tagline: 'Long-form interviews with interesting people', access: 'free', hostIds: ['richard'], palette: ['#8b5cf6', '#170d2e', '#d8c8ff'], slot: { days: [3], hour: 10, minute: 0, live: false }, unit: 'interviews' },
  { id: 'chronos', name: 'Chronos', tagline: 'History told in full, series by series', access: 'premium', hostIds: ['helen'], palette: ['#2a9d8f', '#08221f', '#e9c46a'], slot: { days: [0], hour: 13, minute: 0, live: false }, unit: 'parts' },
  { id: 'statecraft', name: 'Statecraft', tagline: 'Geopolitics without the noise', access: 'premium', hostIds: ['rachel'], palette: ['#4f8fc0', '#0b1726', '#a8dadc'], slot: { days: [2], hour: 15, minute: 0, live: false }, unit: 'episodes' },
  { id: 'ledger', name: 'Ledger', tagline: 'Economics you can actually use', access: 'premium', hostIds: ['neil'], palette: ['#6a994e', '#101b0c', '#e3f0c8'], slot: { days: [4], hour: 11, minute: 0, live: false }, unit: 'episodes' },
  { id: 'the-forum', name: 'The Forum', tagline: 'The panel show, live for members', access: 'premium', hostIds: ['andrew', 'tom', 'danny', 'neil'], palette: ['#e76f51', '#260d06', '#f4a261'], streamedLive: true, slot: { days: [5], hour: 19, minute: 0, live: true }, unit: 'episodes' },
]
const slotOf = (showId) => shows.find((s) => s.id === showId).slot

/** "Live weekdays at 1:00 pm", "New parts on Sundays at 1:00 pm". */
function scheduleText({ slot, unit }) {
  const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']
  const days = slot.days.join() === WEEKDAYS.join() ? 'weekdays' : `on ${slot.days.map((d) => dayNames[d]).join(' and ')}`
  const hour12 = slot.hour % 12 || 12
  const time = `${hour12}:${String(slot.minute).padStart(2, '0')} ${slot.hour < 12 ? 'am' : 'pm'}`
  return slot.live ? `Live ${days} at ${time}` : `New ${unit} ${days} at ${time}`
}
for (const show of shows) show.schedule = scheduleText(show)

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
  ['Henry VIII', 7], ['The Anglo-Saxons', 5], ['The Fall of the Republic', 5], ['Roman Resurgence', 4], ["The Hundred Years' War", 3],
]
// Each part's own title, shown before the series name:
// "Chronos #275 | Justinian's Gamble | Roman Resurgence, Part 2".
const partTitles = {
  Augustus: ['Octavian, Heir of Caesar', 'The Triumvirs', 'Actium', 'The First Emperor'],
  'The Plantagenets': ['Henry II and the Angevin Empire', 'Becket', 'Richard the Lionheart', 'Bad King John', 'Magna Carta', 'Edward I, Hammer of the Scots'],
  'The Spanish Armada': ["Philip's Grand Design", 'Fireships at Calais', 'The Protestant Wind'],
  'Alfred the Great': ['The Great Heathen Army', 'Retreat to Athelney', 'Edington', 'Burhs and Books'],
  'The Crusades': ['Deus Vult', 'The Fall of Jerusalem', 'The Crusader States', 'Saladin', 'The Third Crusade', 'The Sack of Constantinople', 'Acre, the Last Stand'],
  'The Wars of the Roses': ['A Weak King', 'York Claims the Crown', 'Towton', 'The Kingmaker', 'The Princes in the Tower', 'Bosworth Field'],
  Charlemagne: ["Pepin's Son", 'The Saxon Wars', 'Christmas Day, 800', 'The Carolingian Renaissance'],
  'The Glorious Revolution': ['James II', 'The Invitation', 'The Bill of Rights'],
  Hannibal: ['Over the Alps', 'Trebia and Trasimene', 'Cannae', 'Zama'],
  'The Black Death': ['Out of the East', 'The Great Mortality', 'A World Turned Upside Down'],
  'Elizabeth I': ['The Lady Elizabeth', 'The Religious Settlement', 'Mary, Queen of Scots', 'Spain and the Sea Dogs', 'Gloriana'],
  'The Normans': ['Rollo and Normandy', 'The Bastard Duke', 'Hastings', 'The Harrying of the North', 'Domesday'],
  'Rome and Carthage': ['Two Powers, One Sea', 'The First Punic War', "Hannibal's War", 'Carthago Delenda Est'],
  'The Tudors': ['From Bosworth to the Throne', 'Henry VII, the Miser King', 'The Young Henry VIII', 'Edward VI', 'Bloody Mary', 'The Last Tudor'],
  'Athens and Sparta': ['Two Cities', 'Marathon and Thermopylae', 'The Delian League', 'The Peloponnesian War', 'The Sicilian Disaster'],
  'The Stuarts': ['James VI and I', 'Charles I and Parliament', 'Civil War', 'Restoration'],
  'Alexander the Great': ['Philip of Macedon', 'The Granicus', 'Issus', 'Gaugamela', 'To the Edge of the World'],
  'The Vikings': ['Raiders from the North', 'Lindisfarne', 'Settlers and Traders', 'Vinland', 'Stamford Bridge'],
  'The Reformation': ['Ninety-Five Theses', 'Luther at Worms', "Calvin's Geneva", 'The Counter-Reformation'],
  'Constantinople Falls': ['The City Besieged', "Mehmed's Guns", 'The Last Emperor'],
  'Henry VIII': ['The Golden Prince', 'Wolsey', "The King's Great Matter", 'The Break with Rome', 'Dissolution', 'Six Wives', 'The Tyrant'],
  'The Anglo-Saxons': ['After Rome', 'Sutton Hoo', 'Conversion', "Offa's Dyke", 'The Kingdom of England'],
  'The Fall of the Republic': ['The Gracchi', 'Marius and Sulla', 'Pompey the Great', 'Crossing the Rubicon', 'The Ides of March'],
  'Roman Resurgence': ["Constantine's New Rome", "Justinian's Gamble", 'Belisarius Takes Italy', 'Heraclius and the Persian War'],
  "The Hundred Years' War": ['A Disputed Crown', 'Crécy and Poitiers', 'Agincourt'],
}
for (const [name, parts] of historySeries) {
  if (partTitles[name]?.length !== parts) throw new Error(`${name} needs ${parts} part titles.`)
}

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
  const slot = slotOf('stoa-podcast')
  const dates = datesBack(1530, slot.days)
  dates.forEach((date, i) => {
    const number = 1530 - i
    const ageDays = (generatedAt - date) / DAY
    const v = views(4200, ageDays)
    add('stoa-podcast', {
      number,
      title: `The Stoa Podcast #${number}`,
      topics: [pick(newsTopics), pick(newsTopics), pick(newsTopics)].filter((t, j, a) => a.indexOf(t) === j),
      hostIds: lineup(['andrew', 'richard', 'tom', 'gary', 'sally'], 3, 'andrew', 0.85),
      publishedAt: at(date, slot.hour, slot.minute),
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
  const slot = slotOf('morning-brief')
  const dates = datesBack(1040, slot.days, 0)
  dates.forEach((date) => {
    const ageDays = (generatedAt - date) / DAY
    const segments = [nextMorning(), nextMorning()]
    // The main edition is titled by its date when displayed, so it never goes stale.
    const edition = views(800, ageDays)
    // Sally covers some mornings.
    const presenter = rota() < 0.85 ? ['danny'] : ['sally']
    add('morning-brief', { edition: true, hostIds: presenter, publishedAt: at(date, slot.hour, slot.minute), durationMin: 22, access: 'free', views: edition, comments: comments(edition, 0.008) })
    segments.forEach((topic, j) => {
      const v = views(350, ageDays)
      add('morning-brief', { title: `Morning Brief | ${topic}`, hostIds: presenter, publishedAt: at(date, slot.hour, slot.minute + 30 + j * 15), durationMin: between(6, 12), access: 'free', views: v, comments: comments(v, 0.006) })
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
    for (let p = 1; p <= parts; p++) plan.push({ series: { name, part: p, of: parts }, partTitle: partTitles[name][p - 1] })
    if (planRandom() < 0.4) plan.push({ extra: nextExtra() })
  }
  const slot = slotOf('chronos')
  const dates = datesBack(plan.length, slot.days, 1).reverse() // oldest first
  plan.forEach((item, i) => {
    const number = 160 + i
    const ageDays = (generatedAt - dates[i]) / DAY
    const v = views(1600, ageDays)
    const isExtra = !item.series
    add('chronos', {
      number,
      title: isExtra ? `Chronos #${number} | ${item.extra}` : `Chronos #${number} | ${item.partTitle} | ${item.series.name}, Part ${item.series.part}`,
      series: item.series,
      hostIds: ['helen'],
      publishedAt: at(dates[i], slot.hour, slot.minute),
      durationMin: isExtra ? between(40, 55) : between(75, 95),
      access: isExtra ? 'freemium' : 'premium',
      views: v,
      comments: comments(v, 0.01),
    })
  })
}

// Weekly members' shows, each with the odd free preview.
function weekly(showId, count, makeTitle, base, duration, previewEvery) {
  const { days, hour, minute } = slotOf(showId)
  const dates = datesBack(count, days, 1)
  dates.forEach((date, i) => {
    const ageDays = (generatedAt - date) / DAY
    const v = views(base, ageDays)
    const preview = i % previewEvery === previewEvery - 1
    add(showId, {
      hostIds: shows.find((s) => s.id === showId).hostIds,
      ...makeTitle(count - i, preview),
      publishedAt: at(date, hour, minute),
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
weekly('statecraft', 200, (n) => ({ number: n, title: `Statecraft #${n} | ${nextGeo()}` }), 2300, [60, 85], 15)
weekly('ledger', 200, (n) => ({ number: n, title: `Ledger #${n} | ${nextEcon()}` }), 2100, [45, 65], 15)
weekly('the-forum', 200, (n, preview) => ({ number: n, title: preview ? `The Forum #${n} | The Best Bits of #${n - 1}` : `The Forum #${n} | ${nextForum()}`, live: !preview, hostIds: lineup(['andrew', 'tom', 'danny', 'neil', 'gary', 'sally'], 4, 'tom', 0.8) }), 3800, [95, 125], 20)

// Conversations: long interviews, every week or so.
{
  const slot = slotOf('conversations')
  const dates = datesBack(150, slot.days, 2)
  const nextTopic = deck('conversations', interviewTopics)
  const nextGuest = deck('guests', guests)
  dates.forEach((date) => {
    const ageDays = (generatedAt - date) / DAY
    const topic = nextTopic()
    const guest = nextGuest()
    const v = views(1100, ageDays)
    const r = rota()
    const interviewer = r < 0.8 ? 'richard' : r < 0.9 ? 'helen' : 'andrew'
    add('conversations', { title: `${topic} | Interview with ${guest}`, hostIds: [interviewer], publishedAt: at(date, slot.hour, slot.minute), durationMin: between(55, 85), access: 'free', views: v, comments: comments(v, 0.008) })
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
  'Roman Resurgence': 'The eastern empire that outlived Rome by a thousand years, and the gambles that kept it alive.',
  "The Hundred Years' War": 'A century of war between England and France over one disputed crown.',
}
const slugify = (name) => name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
for (const s of series) {
  s.slug = slugify(s.name)
  s.description = descriptions[s.name] ?? `${s.name}, told in ${s.episodes.length} parts.`
  s.totalMin = s.episodes.reduce((sum, e) => sum + e.durationMin, 0)
}
series.sort((a, b) => b.episodes.at(-1).publishedAt.localeCompare(a.episodes.at(-1).publishedAt))

// ---------- articles ----------
// Reading time from the length of the body, at about 200 words a minute.
// Engagement (views, comments, likes, dislikes) is generated from each
// piece's mood, with its own random sequence.
const engagement = seeded('article-engagement')
const articles = articleSources
  .map(({ daysAgo, watchNext, mood, ...a }) => {
    const reach = mood === 'quiet' ? 0.2 : 1
    const articleViews = Math.round((2500 + engagement() * 9000) * Math.min(1, 0.35 + daysAgo / 10) * reach)
    const reactions = Math.round(articleViews * (0.04 + engagement() * 0.03))
    const dislikeShare = mood === 'divisive' || mood === 'quiet' ? 0.42 + engagement() * 0.14 : 0.05 + engagement() * 0.15
    const words = a.body.join(' ').split(/\s+/).length
    const match = byShow
      .get(watchNext.show)
      .find((e) => e.title?.includes(watchNext.topic) || e.topics?.includes(watchNext.topic))
    if (!match) throw new Error(`No ${watchNext.show} episode on "${watchNext.topic}" for ${a.id}.`)
    return {
      ...a,
      publishedAt: at(new Date(generatedAt.getTime() - daysAgo * DAY), 10),
      readMin: Math.max(2, Math.round(words / 200)),
      views: articleViews,
      comments: Math.round(articleViews * (mood === 'divisive' ? 0.02 : 0.008) * (0.7 + engagement() * 0.6)),
      likes: reactions - Math.round(reactions * dislikeShare),
      dislikes: Math.round(reactions * dislikeShare),
      watchNextId: match.id,
    }
  })
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

// ---------- comments and reading lists ----------
// Built after the catalogue so each thread's size can follow its episode's
// popularity; comment counts are then set to the real thread sizes.
const allEpisodes = [...byShow.values()].flat()
const extras = buildExtras({ episodes: allEpisodes, articles, now: generatedAt, seededRandom: seeded })
// Where each episode is published (Rumble, Odysee, BitChute, VOD).
const sources = buildSources({ episodes: allEpisodes, liveShowIds: shows.filter((s) => s.slot.live).map((s) => s.id), now: generatedAt, seededRandom: seeded })

// ---------- write the seed data ----------
// This script only invents the catalogue. Laravel is the source of truth:
// its seeder loads these files into the database, its API serves them, and
// `php artisan stoa:export` writes the static preview in public/data.
rmSync(OUT, { recursive: true, force: true })
const write = (path, data) => {
  const file = join(OUT, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(data))
}

write('meta.json', { generatedAt: generatedAt.toISOString() })
write('shows.json', shows)
write('hosts.json', hosts)
// Series in display order (newest first), with their episodes listed by id, oldest part first.
write(
  'series.json',
  series.map((s, position) => ({ slug: s.slug, name: s.name, showId: s.showId, description: s.description, position, episodeIds: s.episodes.map((e) => e.id) })),
)
write('episodes.json', allEpisodes)
write('articles.json', articles)
// Comments by thread ("episode:{id}", "article:{id}", "live:live-show"), replies nested.
write('comments.json', extras.threads)
// Reading lists by episode, and the live show's.
write('reading-lists.json', extras.lists)
write('sources.json', sources)

// Sample platform feeds for the sync, kept with the backend's tests.
{
  const feeds = buildFeeds({ episodes: allEpisodes, sources, shows, now: generatedAt, seededRandom: seeded })
  const dir = join(ROOT, 'backend', 'tests', 'fixtures', 'feeds')
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const asJson = (data) => `${JSON.stringify(data, null, 2)}\n`
  writeFileSync(join(dir, 'rumble.json'), asJson(feeds.rumble))
  writeFileSync(join(dir, 'odysee.json'), asJson(feeds.odysee))
  writeFileSync(join(dir, 'bitchute.xml'), feeds.bitchute)
  writeFileSync(join(dir, 'vod.json'), asJson(feeds.vod))
}

write('live.json', {
  showId: 'stoa-podcast',
  number: 1531,
  title: 'The Stoa Podcast #1531',
  hostIds: ['andrew', 'richard', 'tom'],
  viewers: 1984,
  startHour: slotOf('stoa-podcast').hour,
  sources: liveSources,
})

const counts = Object.fromEntries(shows.map((s) => [s.id, byShow.get(s.id).length]))
console.log('Episodes:', episodes.length, counts)
console.log('Series:', series.length, '| Articles:', articles.length)
console.log('Sources:', Object.entries(sources.reduce((n, s) => ({ ...n, [s.status]: (n[s.status] ?? 0) + 1 }), {})).map(([k, v]) => `${k} ${v}`).join(', '))
console.log('Comments:', extras.threads.reduce((n, t) => n + t.comments.reduce((m, c) => m + 1 + c.replies.length, 0), 0), '| Reading list items:', extras.lists.reduce((n, l) => n + l.items.length, 0))
console.log('Seed data written to', OUT)
